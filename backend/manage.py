from flask_migrate import Migrate, MigrateCommand

from flask_script import Manager

from application import app
from application.management import commands_classes, sub_command_usage

# Create manager
manager = Manager(app)

# Add db migrate commands
# migrate = Migrate(app, db, compare_type=True)
# manager.add_command("db", MigrateCommand)

# For all commands classes in package dir
for name in sorted(commands_classes.keys()):
    # This is subcommand dict?
    if isinstance(commands_classes[name], dict):
        sub_usage = sub_command_usage.get(name, "")
        sub_manager = Manager(app, usage=sub_usage)
        for sub_name in sorted(commands_classes[name].keys()):
            sub_manager.add_command(sub_name,
                                    commands_classes[name][sub_name]())
        manager.add_command(name, sub_manager)
    else:
        manager.add_command(name, commands_classes[name]())

if __name__ == "__main__":
    manager.run()
