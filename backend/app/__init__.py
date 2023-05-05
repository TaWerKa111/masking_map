from flask import Flask

from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy

from common.postgres.models import User
from config import AppConfig
from flask_httpauth import HTTPBasicAuth


app = Flask(
    __name__, static_url_path="/static", template_folder="../common/templates"
)
app.config.from_object("config.AppConfig")
auth = HTTPBasicAuth()

db = SQLAlchemy(app)

# add CORS for api resource. All origins
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=AppConfig.Access_Control_Allow_Credentials,
)


# verify user
@auth.verify_password
def verify_user_password(username: str, password: str) -> str or None:
    user = db.session.query(User).filter(User.username == username).first()

    if user and user.check_password(password):
        return username


@auth.get_user_roles
def get_user_roles(user: User) -> str:
    return user.role


from app.management.create.swagger import bp as cli_cr_swagger  # noqa:
from app.management.create.user import bp as cli_cr_user

from app.api.masking.views import bp as api_masking  # noqa:
from app.api.test.views import bp as api_test  # noqa:
from app.api.swagger.views import bp as api_swagger  # noqa:
from app.api.swagger.views import (
    swagger_ui_blueprint as api_swagger_ui,
)  # noqa:
from app.api.auth.views import bp as api_auth  # noqa:
from app.api.map_file.views import bp as api_files  # noqa:
from app.api.rule.views import bp as api_rules  # noqa:


app.register_blueprint(cli_cr_swagger)
app.register_blueprint(cli_cr_user)
app.register_blueprint(api_masking)
app.register_blueprint(api_test)
app.register_blueprint(api_swagger)
app.register_blueprint(api_swagger_ui)
app.register_blueprint(api_auth)
app.register_blueprint(api_files)
app.register_blueprint(api_rules)
