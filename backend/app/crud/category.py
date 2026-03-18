"""
CRUD operations for Category model
"""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Category, User
from app.core.default_data import DEFAULT_CATEGORIES


async def get_categories_by_user(db: AsyncSession, user_id: str) -> list[Category]:
    """Get all categories for a user"""
    result = await db.execute(
        select(Category).where(Category.user_id == user_id).order_by(Category.created_at)
    )
    return list(result.scalars().all())


async def get_category_by_id(db: AsyncSession, category_id: str) -> Optional[Category]:
    """Get a category by ID"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def get_category_by_name(
    db: AsyncSession,
    user_id: str,
    name: str
) -> Optional[Category]:
    """Get a category by name for a user"""
    result = await db.execute(
        select(Category).where(Category.user_id == user_id, Category.name == name)
    )
    return result.scalar_one_or_none()


async def create_category(
    db: AsyncSession,
    user_id: str,
    name: str,
    color: str
) -> Category:
    """Create a new category"""
    category = Category(
        user_id=user_id,
        name=name,
        color=color,
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def create_default_categories(db: AsyncSession, user_id: str) -> list[Category]:
    """Create default categories for a new user"""
    categories = []
    for cat_data in DEFAULT_CATEGORIES:
        category = Category(
            user_id=user_id,
            name=cat_data["name"],
            color=cat_data["color"],
        )
        db.add(category)
        categories.append(category)

    await db.flush()
    for category in categories:
        await db.refresh(category)

    return categories


async def update_category(
    db: AsyncSession,
    category_id: str,
    name: Optional[str] = None,
    color: Optional[str] = None
) -> Optional[Category]:
    """Update a category"""
    category = await get_category_by_id(db, category_id)
    if not category:
        return None

    if name is not None:
        category.name = name
    if color is not None:
        category.color = color

    await db.flush()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: str) -> bool:
    """Delete a category"""
    category = await get_category_by_id(db, category_id)
    if not category:
        return False

    await db.delete(category)
    await db.flush()
    return True
