from flask_sqlalchemy import Pagination

from app import db
from common.postgres.models import User


def get_user(username: str) -> User:
    """
    Получить пользователя по его логину
    :param username: str,
        логин пользователя
    :return: User
    """

    user = db.session.query(User).filter(User.username == username).first()
    return user


def serialize_paginate_object(paginate_object: Pagination):
    items = paginate_object.items
    total_pages = round(paginate_object.total / paginate_object.per_page)
    pagination = {
        "total_items": paginate_object.total,
        "total_pages": total_pages,
        "page": paginate_object.page,
        "limit": paginate_object.per_page,
    }
    return items, pagination
