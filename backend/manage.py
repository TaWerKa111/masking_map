from flask.cli import main, cli
from app import app
from app.api.helpers.listeners.map_file import *


if __name__ == "__main__":
    main(app)
