"""
AI API Endpoints - Proxy for AI services in cloud mode
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.ai import ai_service
from app.crud import task as task_crud
from app.database import get_db
from app.models import User
from app.schemas import (
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    AIPlanRequest,
    AIPlanResponse,
)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze_productivity(
    request: AIAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze productivity based on completed tasks

    In cloud mode, the AI API key is managed by the backend.
    Users don't need to configure their own API key.
    """
    # Get completed tasks
    if request.task_ids:
        # Analyze specific tasks
        tasks = []
        for task_id in request.task_ids:
            task = await task_crud.get_task_by_id(db, task_id)
            if task and task.user_id == current_user.id and task.status == "COMPLETED":
                tasks.append({
                    "title": task.title,
                    "tags": task.tags or [],
                    "total_time": task.total_time,
                })
    else:
        # Analyze all completed tasks
        tasks = await task_crud.get_completed_tasks(db, current_user.id)
        tasks = [
            {
                "title": t.title,
                "tags": t.tags or [],
                "total_time": t.total_time,
            }
            for t in tasks
        ]

    # Call AI service
    result = await ai_service.analyze_productivity(tasks)

    return AIAnalyzeResponse(
        score=result["score"],
        summary=result["summary"],
        suggestions=result["suggestions"],
        analyzed_tasks=result["analyzed_tasks"]
    )


@router.post("/plan", response_model=AIPlanResponse)
async def generate_project_plan(
    request: AIPlanRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a project plan with tasks based on a goal

    In cloud mode, the AI API key is managed by the backend.
    Users don't need to configure their own API key.
    """
    result = await ai_service.generate_project_plan(
        goal=request.goal,
        context=request.context
    )

    return AIPlanResponse(
        project_name=result["project_name"],
        project_description=result["project_description"],
        tasks=result["tasks"],
        total_estimated_time=result.get("total_estimated_time")
    )
