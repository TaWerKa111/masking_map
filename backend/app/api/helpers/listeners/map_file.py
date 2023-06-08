from app import db
from app.api.helpers.events.map_file import MapFileEvent
from common.postgres.models import TaskCheckMapFile, Notification


@MapFileEvent.after_add_or_update_rule_views
def add_task_check_exists_files():
    task = TaskCheckMapFile(
        type_task="check_file_task", status=TaskCheckMapFile.StatusTask.pending
    )
    db.session.add(task)
    db.session.commit()


@MapFileEvent.after_generate_map_views
def add_notification(text):
    notification = Notification(
        text=text,
        is_for_all=True
    )
    db.session.add(notification)
    db.session.commit()
