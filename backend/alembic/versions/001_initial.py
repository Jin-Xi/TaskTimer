"""Initial database schema

Revision ID: 001_initial
Revises:
Create Date: 2026-03-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial database schema"""

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('language', sa.String(10), server_default='zh-CN'),
        sa.Column('theme', sa.String(10), server_default='dark'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_users_username', 'users', ['username'])

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('user_id', sa.Char(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(50), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_projects_user_id', 'projects', ['user_id'])

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('user_id', sa.Char(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('color', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('idx_categories_user_id', 'categories', ['user_id'])

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('user_id', sa.Char(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('project_id', sa.Char(36), sa.ForeignKey('projects.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(20), server_default='IDLE'),
        sa.Column('total_time', sa.BigInteger(), server_default='0'),
        sa.Column('estimated_time', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_project_id', 'tasks', ['project_id'])
    op.create_index('idx_tasks_status', 'tasks', ['status'])

    # Create task_dependencies table
    op.create_table(
        'task_dependencies',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('task_id', sa.Char(36), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parent_id', sa.Char(36), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('idx_task_deps_task_id', 'task_dependencies', ['task_id'])
    op.create_index('idx_task_deps_parent_id', 'task_dependencies', ['parent_id'])
    # Create unique constraint for task_id + parent_id
    op.create_unique_constraint('uq_task_dependencies', 'task_dependencies', ['task_id', 'parent_id'])

    # Create time_logs table
    op.create_table(
        'time_logs',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('task_id', sa.Char(36), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('start_time', sa.BigInteger(), nullable=False),
        sa.Column('end_time', sa.BigInteger(), nullable=True),
        sa.Column('duration', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('idx_time_logs_task_id', 'time_logs', ['task_id'])

    # Create milestones table
    op.create_table(
        'milestones',
        sa.Column('id', sa.Char(36), primary_key=True),
        sa.Column('task_id', sa.Char(36), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('task_time', sa.BigInteger(), nullable=False),
        sa.Column('branch_name', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('idx_milestones_task_id', 'milestones', ['task_id'])
    op.create_index('idx_milestones_branch', 'milestones', ['task_id', 'branch_name'])


def downgrade() -> None:
    """Drop all tables in reverse order"""
    op.drop_table('milestones')
    op.drop_table('time_logs')
    op.drop_table('task_dependencies')
    op.drop_table('tasks')
    op.drop_table('categories')
    op.drop_table('projects')
    op.drop_table('users')
