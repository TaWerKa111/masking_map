from flask import session

from app import db
from common.postgres.models import User


def login_user(user: User) -> None:
    """
    Авторизация пользователя, создание куки сессии.

    @param user: User,
        пользователь
    @return: None
    """

    session["user_id"] = user.id
    session["role"] = user.role
    session["is_login_in"] = True


def logout_user() -> None:
    """
    Выход пользователя. Удаление куки.

    @return: None
    """

    session.pop("user_id", None)
    session.pop("role", None)
    session.pop("is_login_in", None)


def get_user() -> User or None:
    user_id = session.get("user_id")
    if not user_id:
        return None
    # user = db.session.query(User).get(user_id)
    user = {
        "id": session.get("user_id"),
        "role": session.get("role"),
    }
    return user


def get_user_by_login(username) -> User or None:
    user = db.session.query(User).filter(User.username == username).first()
    return user


def add_user(username: str, password: str) -> User:
    user = User(
        username=username,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user
