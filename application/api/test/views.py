from flask import Blueprint

bp = Blueprint("test_api", __name__, url_prefix="/test/")


@bp.route("/hello/")
def hello():
    """
    Тестовый запроса, которой должны всегда отрабатывать.

    :return: Tuple(JSON, int)
    """

    return {"message": "hello"}, 200
