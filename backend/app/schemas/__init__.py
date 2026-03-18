"""
Pydantic Schemas for API Validation and Serialization
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ============ User Schemas ============

class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=100)


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: str
    language: str = "zh-CN"
    theme: str = "dark"
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Token payload schema"""
    sub: str  # user_id
    exp: datetime
    type: str  # "access" or "refresh"


# ============ Category Schemas ============

class CategoryBase(BaseModel):
    """Base category schema"""
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., min_length=1, max_length=50)


class CategoryCreate(CategoryBase):
    """Schema for creating a category"""
    pass


class CategoryResponse(CategoryBase):
    """Schema for category response"""
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Project Schemas ============

class ProjectBase(BaseModel):
    """Base project schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field(..., min_length=1, max_length=50)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, min_length=1, max_length=50)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ProjectResponse(ProjectBase):
    """Schema for project response"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Task Schemas ============

class TimeLogBase(BaseModel):
    """Base time log schema"""
    start_time: int  # Unix timestamp in ms
    end_time: Optional[int] = None  # Unix timestamp in ms
    duration: Optional[int] = None  # Duration in ms


class TimeLogCreate(TimeLogBase):
    """Schema for creating a time log"""
    pass


class TimeLogResponse(TimeLogBase):
    """Schema for time log response"""
    id: str
    task_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class MilestoneBase(BaseModel):
    """Base milestone schema"""
    name: Optional[str] = None
    task_time: int  # Total task time at milestone creation
    branch_name: Optional[str] = None


class MilestoneCreate(MilestoneBase):
    """Schema for creating a milestone"""
    pass


class MilestoneResponse(MilestoneBase):
    """Schema for milestone response"""
    id: str
    task_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    """Base task schema"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    tags: Optional[list[str]] = None
    status: str = "IDLE"
    total_time: int = 0
    estimated_time: Optional[int] = None
    project_id: Optional[str] = None


class TaskCreate(TaskBase):
    """Schema for creating a task"""
    parent_task_ids: Optional[list[str]] = None
    time_logs: Optional[list[TimeLogCreate]] = None
    milestones: Optional[list[MilestoneCreate]] = None


class TaskUpdate(BaseModel):
    """Schema for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    tags: Optional[list[str]] = None
    status: Optional[str] = None
    total_time: Optional[int] = None
    estimated_time: Optional[int] = None
    project_id: Optional[str] = None


class TaskResponse(TaskBase):
    """Schema for task response"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    time_logs: list[TimeLogResponse] = []
    milestones: list[MilestoneResponse] = []
    parent_task_ids: list[str] = []

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for task list response"""
    tasks: list[TaskResponse]
    total: int


# ============ Data Export/Import Schemas ============

class ExportData(BaseModel):
    """Schema for exported data"""
    tasks: list[TaskResponse]
    projects: list[ProjectResponse]
    categories: list[CategoryResponse]
    exported_at: datetime
    version: str = "1.0"


class ImportData(BaseModel):
    """Schema for importing data"""
    tasks: Optional[list[TaskCreate]] = None
    projects: Optional[list[ProjectCreate]] = None
    categories: Optional[list[CategoryCreate]] = None


class ImportResult(BaseModel):
    """Schema for import result"""
    tasks_imported: int
    projects_imported: int
    categories_imported: int
    errors: list[str] = []


# ============ AI Schemas ============

class AIAnalyzeRequest(BaseModel):
    """Schema for AI analysis request"""
    task_ids: Optional[list[str]] = None  # If None, analyze all completed tasks


class AIAnalyzeResponse(BaseModel):
    """Schema for AI analysis response"""
    score: int  # 0-100 productivity score
    summary: str
    suggestions: list[str]
    analyzed_tasks: int


class AIPlanRequest(BaseModel):
    """Schema for AI project planning request"""
    goal: str = Field(..., min_length=10, max_length=2000)
    context: Optional[str] = None


class AIPlanTask(BaseModel):
    """Schema for a task in AI plan"""
    title: str
    description: Optional[str] = None
    estimated_time: Optional[int] = None  # in minutes
    dependencies: Optional[list[str]] = None  # task titles this depends on


class AIPlanResponse(BaseModel):
    """Schema for AI project planning response"""
    project_name: str
    project_description: str
    tasks: list[AIPlanTask]
    total_estimated_time: Optional[int] = None  # in minutes
