from application import db
from common.postgres.models import User


def get_user(username: str) -> User:
    """
    Получить пользователя по его логину
    :param username: str,
        логин пользователя
    :return: User
    """

    user = db.session.query(User).filter(
        User.username == username
    ).first()
    return user
