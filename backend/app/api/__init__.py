"""
API Routes
"""
from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router
from app.api.projects import router as projects_router
from app.api.categories import router as categories_router
from app.api.ai import router as ai_router
from app.api.data import router as data_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(tasks_router)
api_router.include_router(projects_router)
api_router.include_router(categories_router)
api_router.include_router(ai_router)
api_router.include_router(data_router)
