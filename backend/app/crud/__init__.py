"""
CRUD operations for all models
"""
from app.crud.user import (
    get_user_by_id,
    get_user_by_username,
    create_user,
    authenticate_user,
    update_user,
    update_password,
    delete_user,
)
from app.crud.category import (
    get_categories_by_user,
    get_category_by_id,
    get_category_by_name,
    create_category,
    create_default_categories,
    update_category,
    delete_category,
)
from app.crud.project import (
    get_projects_by_user,
    get_project_by_id,
    create_project,
    update_project,
    delete_project,
    get_project_with_task_count,
)
from app.crud.task import (
    get_tasks_by_user,
    get_task_by_id,
    create_task,
    update_task,
    delete_task,
    delete_tasks_batch,
    start_task,
    pause_task,
    complete_task,
    add_milestone,
    add_task_dependency,
    remove_task_dependency,
    get_tasks_by_project,
    get_completed_tasks,
)

__all__ = [
    # User
    "get_user_by_id",
    "get_user_by_username",
    "create_user",
    "authenticate_user",
    "update_user",
    "update_password",
    "delete_user",
    # Category
    "get_categories_by_user",
    "get_category_by_id",
    "get_category_by_name",
    "create_category",
    "create_default_categories",
    "update_category",
    "delete_category",
    # Project
    "get_projects_by_user",
    "get_project_by_id",
    "create_project",
    "update_project",
    "delete_project",
    "get_project_with_task_count",
    # Task
    "get_tasks_by_user",
    "get_task_by_id",
    "create_task",
    "update_task",
    "delete_task",
    "delete_tasks_batch",
    "start_task",
    "pause_task",
    "complete_task",
    "add_milestone",
    "add_task_dependency",
    "remove_task_dependency",
    "get_tasks_by_project",
    "get_completed_tasks",
]
