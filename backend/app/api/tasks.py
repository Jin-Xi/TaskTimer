"""
Tasks API Endpoints
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.crud import task as task_crud
from app.database import get_db
from app.models import User
from app.schemas import (
    TaskCreate,
    TaskResponse,
    TaskListResponse,
    TaskUpdate,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status"),
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all tasks for the current user with optional filters"""
    tasks = await task_crud.get_tasks_by_user(
        db,
        user_id=current_user.id,
        status=status,
        project_id=project_id
    )

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        total=len(tasks)
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific task by ID"""
    task = await task_crud.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    return TaskResponse.model_validate(task)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new task"""
    task = await task_crud.create_task(
        db,
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        tags=task_data.tags,
        status=task_data.status,
        total_time=task_data.total_time,
        estimated_time=task_data.estimated_time,
        project_id=task_data.project_id,
        parent_task_ids=task_data.parent_task_ids,
        time_logs=[log.model_dump() for log in task_data.time_logs] if task_data.time_logs else None,
        milestones=[m.model_dump() for m in task_data.milestones] if task_data.milestones else None,
    )

    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a task"""
    task = await task_crud.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this task"
        )

    updated_task = await task_crud.update_task(
        db,
        task_id=task_id,
        title=task_data.title,
        description=task_data.description,
        tags=task_data.tags,
        status=task_data.status,
        total_time=task_data.total_time,
        estimated_time=task_data.estimated_time,
        project_id=task_data.project_id,
    )

    return TaskResponse.model_validate(updated_task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a task"""
    task = await task_crud.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    await task_crud.delete_task(db, task_id)

    return {"message": "Task deleted successfully"}


@router.delete("")
async def delete_tasks_batch(
    task_ids: list[str] = Query(..., description="List of task IDs to delete"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete multiple tasks"""
    count = await task_crud.delete_tasks_batch(db, task_ids, current_user.id)

    return {
        "message": f"Deleted {count} tasks",
        "deleted_count": count
    }


@router.post("/{task_id}/start", response_model=TaskResponse)
async def start_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a task (change status to RUNNING)"""
    task = await task_crud.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this task"
        )

    # Check if task has incomplete dependencies
    if task.parent_tasks:
        from app.models import Task
        from sqlalchemy import select, and_

        incomplete_parents = await db.execute(
            select(Task)
            .where(
                and_(
                    Task.id.in_([d.parent_id for d in task.parent_tasks]),
                    Task.status != "COMPLETED"
                )
            )
        )
        incomplete = incomplete_parents.scalars().all()

        if incomplete:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start task. Incomplete dependencies: {', '.join([t.title for t in incomplete])}"
            )

    updated_task = await task_crud.start_task(db, task_id)
    return TaskResponse.model_validate(updated_task)


@router.post("/{task_id}/pause", response_model=TaskResponse)
async def pause_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Pause a task (change status to PAUSED)"""
    task = await task_crud.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this task"
        )

    updated_task = await task_crud.pause_task(db, task_id)
    return TaskResponse.model_validate(updated_task)


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Complete a task (change status to COMPLETED)"""
    task = await task_crud.get_task_by_id(db, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this task"
        )

    updated_task = await task_crud.complete_task(db, task_id)
    return TaskResponse.model_validate(updated_task)


@router.get("/project/{project_id}", response_model=TaskListResponse)
async def get_project_tasks(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all tasks for a specific project"""
    from app.crud import project as project_crud

    project = await project_crud.get_project_by_id(db, project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this project"
        )

    tasks = await task_crud.get_tasks_by_project(db, project_id)

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        total=len(tasks)
    )
