from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin

from apispec_webframeworks.flask import FlaskPlugin

from flask import current_app

from app import app


def add_security_scheme(documentation: APISpec) -> None:
    """
    Добавление схем безопасности.

    @param documentation: FlaskApiSpec: документация к приложению
    @return: None
    """
    # add security scheme
    auth_schema = {"type": "http", "scheme": "bearer"}
    user_schema = {"type": "apiKey", "in": "header", "name": "User"}
    role_schema = {"type": "apiKey", "in": "header", "name": "Role"}
    documentation.components.security_scheme("bearerAuth", auth_schema)
    documentation.components.security_scheme("userAuth", user_schema)
    documentation.components.security_scheme("roleAuth", role_schema)


def add_responses(documentation: APISpec) -> None:
    """
    Добавление часто встречаемых кодов ответов!
    @param documentation: ApiSpec: документация к приложению
    @return: None
    """
    response_400 = {
        "description": "Данные введены некорректно!",
        "content": {
            "app/json": {
                "schema": "BinaryResponseSchema",
                "examples": {
                    "Bad Request": {
                        "value": {
                            "message": "Неверный формат введенных данных",
                            "result": False,
                        }
                    }
                },
            }
        },
    }
    response_401 = {
        "description": "Ошибка авторизации!",
        "content": {
            "app/json": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "сообщение с сервера!",
                        },
                        "result": {"type": "boolean"},
                    },
                },
                "examples": {
                    "Invalid token": {
                        "value": {
                            "message": "Время жизни токена закончилось!!",
                            "result": False,
                        }
                    },
                    "No token": {
                        "value": {
                            "message": "Пользователь не авторизован!",
                            "result": False,
                        }
                    },
                },
            }
        },
    }
    response_403 = {
        "description": "Недостаточно прав!",
        "content": {
            "app/json": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "сообщение с сервера!",
                        },
                        "result": {"type": "boolean"},
                    },
                },
                "examples": {
                    "403 Forbidden": {
                        "value": {
                            "message": "Недостаточно прав!",
                            "result": False,
                        }
                    },
                },
            }
        },
    }
    response_415 = {
        "description": "Формат входных данных JSON",
        "content": {
            "app/json": {
                "schema": {
                    "type": "object",
                    "description": "Сообщение о результатах регистрации",
                    "properties": {
                        "message": {"type": "string"},
                        "result": {"type": "boolean"},
                    },
                },
                "examples": {
                    "No JSON": {
                        "value": {
                            "message": "Формат входных данных JSON!!",
                            "result": False,
                        }
                    }
                },
            }
        },
    }

    documentation.components.response("BadRequest", response_400)
    documentation.components.response("Unauthorized", response_401)
    documentation.components.response("NoJson", response_415)
    documentation.components.response("Forbidden", response_403)


def add_view_to_docs(documentation: APISpec) -> None:
    """
    Добавление методов приложения в документацию,
    описание к ним берется из их doc-strings.

    @param documentation: FlaskApiSpec: документация к приложению
    @return: None
    """
    # Добавление вьюшек в документацию
    for fn_name in app.view_functions:
        if "api" in fn_name and "flask-apispec" not in fn_name:
            view_fn = app.view_functions[fn_name]
            with app.app_context():
                documentation.path(view=view_fn)


def write_docs_to_file(documentation: APISpec) -> None:
    """
    Запись документации в yaml файл.
    @param documentation: APISpec: документация к приложению
    @return: None
    """
    # Запись документации в yaml файл
    try:
        file = open("openapi.yaml", "w")
        with app.app_context():
            print(documentation.to_yaml(), file=file)
        file.close()
    except PermissionError:
        current_app.logger.info(
            f"Недостаточно прав для создания файла " f"{'openapi.yaml'}."
        )


def create_spec() -> APISpec:
    """
    Создание документации и сохранение ее в yaml файл.

    @return: None
    """
    apispec = APISpec(
        title="Приложение для генерации карт маскирования",
        version="v0.1",
        plugins=[MarshmallowPlugin(), FlaskPlugin()],
        openapi_version="3.0.3",
        servers=[
            {
                "url": "http://localhost:5001/",
                "description": "Тестовый сервер",
            }
        ],
    )

    add_security_scheme(apispec)
    add_responses(apispec)
    add_view_to_docs(apispec)
    write_docs_to_file(apispec)
    return apispec


if __name__ == "__main__":
    create_spec()
