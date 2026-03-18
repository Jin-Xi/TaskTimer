"""
SQLAlchemy Database Models
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Char,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def generate_uuid() -> str:
    """Generate UUID string"""
    return str(uuid4())


class User(Base):
    """User model - stores user account information"""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="zh-CN")
    theme: Mapped[str] = mapped_column(String(10), default="dark")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    projects: Mapped[list["Project"]] = relationship(
        "Project", back_populates="user", cascade="all, delete-orphan"
    )
    categories: Mapped[list["Category"]] = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )


class Project(Base):
    """Project model - stores project information"""

    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(Char(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="projects")
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="project")

    __table_args__ = (Index("idx_projects_user_id", "user_id"),)


class Category(Base):
    """Category model - stores task categories/tags"""

    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(Char(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="categories")

    __table_args__ = (Index("idx_categories_user_id", "user_id"),)


class Task(Base):
    """Task model - stores task information"""

    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(Char(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[str | None] = mapped_column(
        Char(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="IDLE")
    total_time: Mapped[int] = mapped_column(BigInteger, default=0)
    estimated_time: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="tasks")
    project: Mapped["Project | None"] = relationship("Project", back_populates="tasks")
    time_logs: Mapped[list["TimeLog"]] = relationship(
        "TimeLog", back_populates="task", cascade="all, delete-orphan"
    )
    milestones: Mapped[list["Milestone"]] = relationship(
        "Milestone", back_populates="task", cascade="all, delete-orphan"
    )
    # Task dependencies (this task depends on parent tasks)
    parent_tasks: Mapped[list["TaskDependency"]] = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.task_id",
        back_populates="task",
        cascade="all, delete-orphan",
    )
    # Tasks that depend on this task
    dependent_tasks: Mapped[list["TaskDependency"]] = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.parent_id",
        back_populates="parent_task",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("idx_tasks_user_id", "user_id"),
        Index("idx_tasks_project_id", "project_id"),
        Index("idx_tasks_status", "status"),
    )


class TaskDependency(Base):
    """Task dependency model - stores parent-child task relationships"""

    __tablename__ = "task_dependencies"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    task_id: Mapped[str] = mapped_column(
        Char(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    parent_id: Mapped[str] = mapped_column(
        Char(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    task: Mapped["Task"] = relationship(
        "Task", foreign_keys=[task_id], back_populates="parent_tasks"
    )
    parent_task: Mapped["Task"] = relationship(
        "Task", foreign_keys=[parent_id], back_populates="dependent_tasks"
    )

    __table_args__ = (
        Index("idx_task_deps_task_id", "task_id"),
        Index("idx_task_deps_parent_id", "parent_id"),
        # Unique constraint to prevent duplicate dependencies
        # Note: SQLAlchemy unique constraint on multiple columns
    )


class TimeLog(Base):
    """Time log model - stores task time tracking records"""

    __tablename__ = "time_logs"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    task_id: Mapped[str] = mapped_column(
        Char(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    start_time: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Unix timestamp in ms
    end_time: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # Unix timestamp in ms
    duration: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # Duration in ms
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    task: Mapped["Task"] = relationship("Task", back_populates="time_logs")

    __table_args__ = (Index("idx_time_logs_task_id", "task_id"),)


class Milestone(Base):
    """Milestone model - stores task milestones"""

    __tablename__ = "milestones"

    id: Mapped[str] = mapped_column(Char(36), primary_key=True, default=generate_uuid)
    task_id: Mapped[str] = mapped_column(
        Char(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    task_time: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Total task time at milestone creation
    branch_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    task: Mapped["Task"] = relationship("Task", back_populates="milestones")

    __table_args__ = (
        Index("idx_milestones_task_id", "task_id"),
        Index("idx_milestones_branch", "task_id", "branch_name"),
    )
