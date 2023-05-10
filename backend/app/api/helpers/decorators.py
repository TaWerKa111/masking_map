import http
from functools import wraps

from flask import session, request

from app.api.auth.helpers import get_user_by_login
from app.api.helpers.schemas import BinaryResponseSchema


# def login_required(roles=None):
#     def decorator(func):
#         @wraps(func)
#         def wrapper(*args, **kwargs):
#             user_id = session.get("user_id")
#             role = session.get("role")
#             if user_id:
#                 if role and roles:
#                     if role in roles:
#                         return func(*args, **kwargs)
#                     else:
#                         return BinaryResponseSchema().dump(
#                             {
#                                 "message": "Недостаточно прав!",
#                                 "result": False
#                             }
#                         ), http.HTTPStatus.UNAUTHORIZED
#                 return func(*args, **kwargs)
#             return BinaryResponseSchema().dump(
#                 {
#                     "message": "Пользователь не авторизован!",
#                     "result": False
#                 }
#             ), http.HTTPStatus.UNAUTHORIZED
#         return wrapper
#     return decorator

def login_required(roles=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            username, password = request.headers.get(
                "Authorization").split(":")
            user = get_user_by_login(username)
            if user and user.check_password(password):
                if user.role and roles:
                    if user.role in roles:
                        return func(*args, **kwargs)
                    else:
                        return BinaryResponseSchema().dump(
                            {
                                "message": "Недостаточно прав!",
                                "result": False
                            }
                        ), http.HTTPStatus.UNAUTHORIZED
                return func(*args, **kwargs)
            return BinaryResponseSchema().dump(
                {
                    "message": "Пользователь не авторизован!",
                    "result": False
                }
            ), http.HTTPStatus.UNAUTHORIZED
        return wrapper
    return decorator
