"""
Data Import/Export API Endpoints
"""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.crud import (
    category as category_crud,
    project as project_crud,
    task as task_crud,
)
from app.database import get_db
from app.models import User
from app.schemas import (
    CategoryCreate,
    ExportData,
    ImportData,
    ImportResult,
    ProjectCreate,
    TaskCreate,
    CategoryResponse,
    ProjectResponse,
    TaskResponse,
)

router = APIRouter(prefix="/data", tags=["Data"])


@router.get("/export", response_model=ExportData)
async def export_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export all user data

    Returns tasks, projects, and categories in JSON format.
    This can be used for backup or migration.
    """
    # Get all user data
    tasks = await task_crud.get_tasks_by_user(db, current_user.id)
    projects = await project_crud.get_projects_by_user(db, current_user.id)
    categories = await category_crud.get_categories_by_user(db, current_user.id)

    return ExportData(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        projects=[ProjectResponse.model_validate(p) for p in projects],
        categories=[CategoryResponse.model_validate(c) for c in categories],
        exported_at=datetime.utcnow(),
        version="1.0"
    )


@router.post("/import", response_model=ImportResult)
async def import_data(
    data: ImportData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Import data from JSON

    This can be used to restore from backup or migrate from localStorage.
    """
    errors = []
    tasks_imported = 0
    projects_imported = 0
    categories_imported = 0

    # Import categories first (tasks may reference them via tags)
    if data.categories:
        for cat_data in data.categories:
            try:
                # Check if category already exists
                existing = await category_crud.get_category_by_name(
                    db,
                    user_id=current_user.id,
                    name=cat_data.name
                )

                if existing:
                    # Update existing category
                    await category_crud.update_category(
                        db,
                        category_id=existing.id,
                        name=cat_data.name,
                        color=cat_data.color
                    )
                else:
                    # Create new category
                    await category_crud.create_category(
                        db,
                        user_id=current_user.id,
                        name=cat_data.name,
                        color=cat_data.color
                    )

                categories_imported += 1
            except Exception as e:
                errors.append(f"Failed to import category '{cat_data.name}': {str(e)}")

    # Import projects
    project_id_map = {}  # Map old project IDs to new ones

    if data.projects:
        for proj_data in data.projects:
            try:
                project = await project_crud.create_project(
                    db,
                    user_id=current_user.id,
                    name=proj_data.name,
                    description=proj_data.description,
                    color=proj_data.color,
                    start_date=proj_data.start_date,
                    end_date=proj_data.end_date,
                )
                project_id_map[proj_data.name] = project.id
                projects_imported += 1
            except Exception as e:
                errors.append(f"Failed to import project '{proj_data.name}': {str(e)}")

    # Import tasks
    if data.tasks:
        # Create a name-to-id mapping for projects
        projects = await project_crud.get_projects_by_user(db, current_user.id)
        project_name_to_id = {p.name: p.id for p in projects}

        for task_data in data.tasks:
            try:
                # Map project_id if it's a name reference
                project_id = task_data.project_id
                if project_id and project_id in project_name_to_id:
                    project_id = project_name_to_id[project_id]

                task = await task_crud.create_task(
                    db,
                    user_id=current_user.id,
                    title=task_data.title,
                    description=task_data.description,
                    tags=task_data.tags,
                    status=task_data.status,
                    total_time=task_data.total_time,
                    estimated_time=task_data.estimated_time,
                    project_id=project_id,
                    parent_task_ids=task_data.parent_task_ids,
                    time_logs=[log.model_dump() for log in task_data.time_logs] if task_data.time_logs else None,
                    milestones=[m.model_dump() for m in task_data.milestones] if task_data.milestones else None,
                )
                tasks_imported += 1
            except Exception as e:
                errors.append(f"Failed to import task '{task_data.title}': {str(e)}")

    return ImportResult(
        tasks_imported=tasks_imported,
        projects_imported=projects_imported,
        categories_imported=categories_imported,
        errors=errors
    )
