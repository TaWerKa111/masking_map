import importlib
import os
import pkgutil

from flask_script import Command


# Import all modules for package dir
sub_command_usage = {}
modules = pkgutil.iter_modules([os.path.dirname(__file__)])
for (module_loader, name, ispkg) in modules:
    importlib.import_module("." + name, __package__)
    if ispkg:
        module = globals()[name]
        sub_command_usage[name] = module.__doc__.strip()

# Create dict of classes (file_name => class)
commands_classes = {}
for cls in Command.__subclasses__():
    # If class is not from current package
    if not cls.__module__.startswith(__name__):
        continue
    sub_mod = cls.__module__[len(__name__) + 1 :]
    sub_mod_parts = sub_mod.split(".")
    short_mod_name = sub_mod_parts[-1]
    if len(sub_mod_parts) > 1:
        parent_mod = sub_mod_parts[0]
        if parent_mod not in commands_classes:
            commands_classes[parent_mod] = {}
        commands_classes[parent_mod][short_mod_name] = cls
    else:
        commands_classes[short_mod_name] = cls
