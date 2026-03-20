"""
CRUD operations for User model
"""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models import User


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get a user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get a user by username"""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    username: str,
    password: str,
    language: str = "zh-CN",
    theme: str = "dark"
) -> User:
    """Create a new user"""
    hashed_password = hash_password(password)
    user = User(
        username=username,
        password_hash=hashed_password,
        language=language,
        theme=theme,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession,
    username: str,
    password: str
) -> tuple[Optional[User], Optional[str]]:
    """
    Authenticate a user by username and password

    Returns:
        tuple: (user, error_message)
        - (User, None) - authentication successful
        - (None, "用户不存在") - username not found
        - (None, "密码错误") - password incorrect
    """
    user = await get_user_by_username(db, username)
    if not user:
        return None, "用户不存在"
    if not verify_password(password, user.password_hash):
        return None, "密码错误"
    return user, None


async def update_user(
    db: AsyncSession,
    user_id: str,
    language: Optional[str] = None,
    theme: Optional[str] = None
) -> Optional[User]:
    """Update user settings"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    if language is not None:
        user.language = language
    if theme is not None:
        user.theme = theme

    await db.flush()
    await db.refresh(user)
    return user


async def update_password(
    db: AsyncSession,
    user_id: str,
    old_password: str,
    new_password: str
) -> bool:
    """Update user password"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return False

    if not verify_password(old_password, user.password_hash):
        return False

    user.password_hash = hash_password(new_password)
    await db.flush()
    return True


async def delete_user(db: AsyncSession, user_id: str) -> bool:
    """Delete a user"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return False

    await db.delete(user)
    await db.flush()
    return True
