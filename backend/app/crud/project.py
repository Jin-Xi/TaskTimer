"""
CRUD operations for Project model
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project


async def get_projects_by_user(db: AsyncSession, user_id: str) -> list[Project]:
    """Get all projects for a user"""
    result = await db.execute(
        select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
    )
    return list(result.scalars().all())


async def get_project_by_id(db: AsyncSession, project_id: str) -> Optional[Project]:
    """Get a project by ID"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def create_project(
    db: AsyncSession,
    user_id: str,
    name: str,
    color: str,
    description: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Project:
    """Create a new project"""
    project = Project(
        user_id=user_id,
        name=name,
        description=description,
        color=color,
        start_date=start_date,
        end_date=end_date,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def update_project(
    db: AsyncSession,
    project_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    color: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Optional[Project]:
    """Update a project"""
    project = await get_project_by_id(db, project_id)
    if not project:
        return None

    if name is not None:
        project.name = name
    if description is not None:
        project.description = description
    if color is not None:
        project.color = color
    if start_date is not None:
        project.start_date = start_date
    if end_date is not None:
        project.end_date = end_date

    await db.flush()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: str) -> bool:
    """Delete a project (tasks will have project_id set to NULL via SET NULL)"""
    project = await get_project_by_id(db, project_id)
    if not project:
        return False

    await db.delete(project)
    await db.flush()
    return True


async def get_project_with_task_count(db: AsyncSession, project_id: str) -> Optional[dict]:
    """Get a project with task count"""
    from sqlalchemy import func
    from app.models import Task

    result = await db.execute(
        select(
            Project,
            func.count(Task.id).label("task_count")
        )
        .outerjoin(Task, Task.project_id == Project.id)
        .where(Project.id == project_id)
        .group_by(Project.id)
    )
    row = result.first()
    if not row:
        return None

    project, task_count = row
    return {
        "project": project,
        "task_count": task_count,
    }
