"""
CRUD operations for Task model
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Task, TaskDependency, TimeLog, Milestone


async def get_tasks_by_user(
    db: AsyncSession,
    user_id: str,
    status: Optional[str] = None,
    project_id: Optional[str] = None
) -> list[Task]:
    """Get all tasks for a user with optional filters"""
    query = select(Task).where(Task.user_id == user_id)

    if status:
        query = query.where(Task.status == status)
    if project_id:
        query = query.where(Task.project_id == project_id)

    query = query.order_by(Task.created_at.desc()).options(
        selectinload(Task.time_logs),
        selectinload(Task.milestones),
        selectinload(Task.parent_tasks),
    )

    result = await db.execute(query)
    tasks = list(result.scalars().all())

    # Fetch parent task IDs for each task
    for task in tasks:
        task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]

    return tasks


async def get_task_by_id(db: AsyncSession, task_id: str) -> Optional[Task]:
    """Get a task by ID with all relationships"""
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .options(
            selectinload(Task.time_logs),
            selectinload(Task.milestones),
            selectinload(Task.parent_tasks),
        )
    )
    task = result.scalar_one_or_none()
    if task:
        task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]
    return task


async def create_task(
    db: AsyncSession,
    user_id: str,
    title: str,
    description: Optional[str] = None,
    tags: Optional[list[str]] = None,
    status: str = "IDLE",
    total_time: int = 0,
    estimated_time: Optional[int] = None,
    project_id: Optional[str] = None,
    parent_task_ids: Optional[list[str]] = None,
    time_logs: Optional[list[dict]] = None,
    milestones: Optional[list[dict]] = None
) -> Task:
    """Create a new task with optional relationships"""
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        tags=tags,
        status=status,
        total_time=total_time,
        estimated_time=estimated_time,
        project_id=project_id,
    )
    db.add(task)
    await db.flush()

    # Add task dependencies
    if parent_task_ids:
        for parent_id in parent_task_ids:
            dependency = TaskDependency(
                task_id=task.id,
                parent_id=parent_id,
            )
            db.add(dependency)

    # Add time logs
    if time_logs:
        for log_data in time_logs:
            time_log = TimeLog(
                task_id=task.id,
                start_time=log_data.get("start_time"),
                end_time=log_data.get("end_time"),
                duration=log_data.get("duration"),
            )
            db.add(time_log)

    # Add milestones
    if milestones:
        for milestone_data in milestones:
            milestone = Milestone(
                task_id=task.id,
                name=milestone_data.get("name"),
                task_time=milestone_data.get("task_time", 0),
                branch_name=milestone_data.get("branch_name"),
            )
            db.add(milestone)

    await db.flush()
    await db.refresh(task)

    # Load relationships
    result = await db.execute(
        select(Task)
        .where(Task.id == task.id)
        .options(
            selectinload(Task.time_logs),
            selectinload(Task.milestones),
            selectinload(Task.parent_tasks),
        )
    )
    task = result.scalar_one()
    task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]

    return task


async def update_task(
    db: AsyncSession,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[list[str]] = None,
    status: Optional[str] = None,
    total_time: Optional[int] = None,
    estimated_time: Optional[int] = None,
    project_id: Optional[str] = None
) -> Optional[Task]:
    """Update a task"""
    task = await get_task_by_id(db, task_id)
    if not task:
        return None

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if tags is not None:
        task.tags = tags
    if status is not None:
        task.status = status
    if total_time is not None:
        task.total_time = total_time
    if estimated_time is not None:
        task.estimated_time = estimated_time
    if project_id is not None:
        task.project_id = project_id

    await db.flush()
    await db.refresh(task)
    task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]
    return task


async def delete_task(db: AsyncSession, task_id: str) -> bool:
    """Delete a task"""
    task = await get_task_by_id(db, task_id)
    if not task:
        return False

    await db.delete(task)
    await db.flush()
    return True


async def delete_tasks_batch(db: AsyncSession, task_ids: list[str], user_id: str) -> int:
    """Delete multiple tasks by IDs"""
    result = await db.execute(
        select(Task).where(
            and_(Task.id.in_(task_ids), Task.user_id == user_id)
        )
    )
    tasks = result.scalars().all()

    count = 0
    for task in tasks:
        await db.delete(task)
        count += 1

    await db.flush()
    return count


async def start_task(db: AsyncSession, task_id: str) -> Optional[Task]:
    """Start a task (change status to RUNNING and create time log)"""
    task = await get_task_by_id(db, task_id)
    if not task:
        return None

    task.status = "RUNNING"

    # Create new time log
    time_log = TimeLog(
        task_id=task.id,
        start_time=int(datetime.now().timestamp() * 1000),
    )
    db.add(time_log)

    await db.flush()
    await db.refresh(task)
    task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]
    return task


async def pause_task(db: AsyncSession, task_id: str) -> Optional[Task]:
    """Pause a task (change status to PAUSED and close time log)"""
    task = await get_task_by_id(db, task_id)
    if not task:
        return None

    task.status = "PAUSED"

    # Find the open time log and close it
    result = await db.execute(
        select(TimeLog)
        .where(and_(TimeLog.task_id == task.id, TimeLog.end_time.is_(None)))
        .order_by(TimeLog.start_time.desc())
    )
    time_log = result.scalar_one_or_none()

    if time_log:
        time_log.end_time = int(datetime.now().timestamp() * 1000)
        time_log.duration = time_log.end_time - time_log.start_time
        task.total_time += time_log.duration

    await db.flush()
    await db.refresh(task)
    task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]
    return task


async def complete_task(db: AsyncSession, task_id: str) -> Optional[Task]:
    """Complete a task (change status to COMPLETED and close time log)"""
    task = await get_task_by_id(db, task_id)
    if not task:
        return None

    task.status = "COMPLETED"

    # Find the open time log and close it
    result = await db.execute(
        select(TimeLog)
        .where(and_(TimeLog.task_id == task.id, TimeLog.end_time.is_(None)))
        .order_by(TimeLog.start_time.desc())
    )
    time_log = result.scalar_one_or_none()

    if time_log:
        time_log.end_time = int(datetime.now().timestamp() * 1000)
        time_log.duration = time_log.end_time - time_log.start_time
        task.total_time += time_log.duration

    await db.flush()
    await db.refresh(task)
    task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]
    return task


async def add_milestone(
    db: AsyncSession,
    task_id: str,
    name: Optional[str],
    task_time: int,
    branch_name: Optional[str] = None
) -> Optional[Milestone]:
    """Add a milestone to a task"""
    task = await get_task_by_id(db, task_id)
    if not task:
        return None

    milestone = Milestone(
        task_id=task.id,
        name=name,
        task_time=task_time,
        branch_name=branch_name,
    )
    db.add(milestone)
    await db.flush()
    await db.refresh(milestone)
    return milestone


async def add_task_dependency(
    db: AsyncSession,
    task_id: str,
    parent_id: str
) -> Optional[TaskDependency]:
    """Add a dependency to a task"""
    # Check if dependency already exists
    result = await db.execute(
        select(TaskDependency).where(
            and_(TaskDependency.task_id == task_id, TaskDependency.parent_id == parent_id)
        )
    )
    if result.scalar_one_or_none():
        return None  # Dependency already exists

    dependency = TaskDependency(
        task_id=task_id,
        parent_id=parent_id,
    )
    db.add(dependency)
    await db.flush()
    await db.refresh(dependency)
    return dependency


async def remove_task_dependency(
    db: AsyncSession,
    task_id: str,
    parent_id: str
) -> bool:
    """Remove a dependency from a task"""
    result = await db.execute(
        select(TaskDependency).where(
            and_(TaskDependency.task_id == task_id, TaskDependency.parent_id == parent_id)
        )
    )
    dependency = result.scalar_one_or_none()

    if not dependency:
        return False

    await db.delete(dependency)
    await db.flush()
    return True


async def get_tasks_by_project(db: AsyncSession, project_id: str) -> list[Task]:
    """Get all tasks for a project"""
    result = await db.execute(
        select(Task)
        .where(Task.project_id == project_id)
        .order_by(Task.created_at.desc())
        .options(
            selectinload(Task.time_logs),
            selectinload(Task.milestones),
            selectinload(Task.parent_tasks),
        )
    )
    tasks = list(result.scalars().all())

    for task in tasks:
        task.parent_task_ids = [dep.parent_id for dep in task.parent_tasks]

    return tasks


async def get_completed_tasks(db: AsyncSession, user_id: str) -> list[Task]:
    """Get all completed tasks for a user (for AI analysis)"""
    result = await db.execute(
        select(Task)
        .where(and_(Task.user_id == user_id, Task.status == "COMPLETED"))
        .order_by(Task.updated_at.desc())
        .options(
            selectinload(Task.time_logs),
            selectinload(Task.milestones),
        )
    )
    return list(result.scalars().all())
