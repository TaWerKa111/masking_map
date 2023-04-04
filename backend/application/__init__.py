from flask import Flask

from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy

from application.api.helpers.utils import get_user
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
def verify_user_password(username, password):
    user = get_user(username)

    if user and user.check_password(password):
        return username


@auth.get_user_roles
def get_user_roles(user):
    return user.role


from application.management.create.swagger import bp as cli_cr_swagger # noqa:
# from application.management.create.user import bp as cli_cr_user

from application.api.masking.views import bp as api_masking  # noqa:
from application.api.test.views import bp as api_test  # noqa:
from application.api.swagger.views import bp as api_swagger  # noqa:
from application.api.swagger.views import swagger_ui_blueprint as api_swagger_ui  # noqa:


app.register_blueprint(cli_cr_swagger)
# app.register_blueprint(cli_cr_user)
app.register_blueprint(api_masking)
app.register_blueprint(api_test)
app.register_blueprint(api_swagger)
app.register_blueprint(api_swagger_ui)


