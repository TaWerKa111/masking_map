import logging
from abc import ABC, abstractmethod

from app import db
from common.postgres.models import TaskCheckMapFile


class AbstractHandler(ABC):

    def __init__(self, task, logger=None):
        self.session = db.session
        self.logger = logger or logging.getLogger(__name__)

        try:
            self.task: TaskCheckMapFile = (
                db.session.query(TaskCheckMapFile)
                .filter(
                    TaskCheckMapFile.id == task.id
                )
                .limit(1)
                .first()
            )
        except Exception as err:
            pass

    @abstractmethod
    def process(self):
        pass

    def run(self):
        return self.process()
