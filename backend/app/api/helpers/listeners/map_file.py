from app import db
from app.api.helpers.events.map_file import MapFileEvent
from common.postgres.models import TaskCheckMapFile


@MapFileEvent.after_add_or_update_rule_views
def add_task_check_exists_files():
    task = TaskCheckMapFile(
        type_task="check_file_task", status=TaskCheckMapFile.StatusTask.pending
    )
    db.session.add(task)
    db.session.commit()
