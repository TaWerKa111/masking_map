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

from application.api.masking.views import bp as api_masking  # noqa:
from application.api.test.views import bp as api_test  # noqa:
from application.api.swagger.views import bp as api_swagger  # noqa:
from application.api.swagger.views import swagger_ui_blueprint as api_swagger_ui  # noqa:

app.register_blueprint(api_masking)
app.register_blueprint(api_test)
app.register_blueprint(api_swagger)
app.register_blueprint(api_swagger_ui)

