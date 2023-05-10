from flask import Flask

from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy

from config import AppConfig


app = Flask(
    __name__, static_url_path="/static", template_folder="../common/templates"
)
app.config.from_object("config.AppConfig")

db = SQLAlchemy(app)

# add CORS for api resource. All origins
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=AppConfig.Access_Control_Allow_Credentials,
)


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
