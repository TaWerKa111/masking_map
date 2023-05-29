import datetime
import logging
import time

from sqlalchemy import or_

from app import db
from app.handlers import HANDLERS
from app.transport.consumer.abstract import ConsumerAbc
from common.postgres.models import TaskCheckMapFile
from app.helpers.exeptions import DontValidateFile


class DataBaseConsumer(ConsumerAbc):
    in_process = False
    SEC = 5

    def __init__(self, logger=None):
        self.logger = logger or logging.getLogger(__name__)
        self.session = None

    def start(self):
        self.in_process = True
        self.logger.info("Start consuming.")
        while self.in_process:
            task = self._get_message()
            if task:
                try:
                    result = self.on_task(task)
                except DontValidateFile: 
                    self.reject(task)
                except Exception as err:
                    self.logger.error(err, exc_info=True)
                    self.reject(task)
                else:
                    self.ack(task)
            else:
                self.logger.info("No task, sleep 5 sec")
                time.sleep(self.SEC)

    def on_task(self, task):
        handler_cls = HANDLERS.get("task")
        print(HANDLERS)

        if not handler_cls:
            self.logger.info("Handler not found!")
            return False

        handler = handler_cls(task)
        self.logger.info(f"Start handler - {handler.name}")

        return handler.run()

    def stop(self):
        self.in_process = False

    def reject(self, task):
        task.status = TaskCheckMapFile.StatusTask.failed
        self.session.commit()

    def ack(self, task):
        task.status = TaskCheckMapFile.StatusTask.success
        self.session.commit()

    def connect(self):
        self.logger.info("Connect to db")
        self.session = db.session

    def _set_in_process(self, task: TaskCheckMapFile):
        task.status = TaskCheckMapFile.StatusTask.in_process
        self.session.commit()

    def _get_message(self):
        if not self.session:
            self.connect()

        task = (
            self.session.query(TaskCheckMapFile)
            .filter(
                TaskCheckMapFile.status
                == TaskCheckMapFile.StatusTask.pending,
                or_(
                   TaskCheckMapFile.date_start.is_(None),
                   TaskCheckMapFile.date_start <= datetime.datetime.utcnow()
                )
            )
            .order_by(TaskCheckMapFile.created_at)
            .limit(1)
            .first()
        )

        self.logger.info(
            f"query - {task}")

        if task:
            self._set_in_process(task)

        return task
