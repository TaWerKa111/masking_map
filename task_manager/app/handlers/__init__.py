import os
import importlib
import inspect
import pkgutil

from app.handlers.abstract import AbstractHandler

__all__ = ["HANDLERS"]

HANDLERS = dict()


current_dir = os.path.dirname(__file__)

# Проходимся по всем файлам в текущей директории
for loader, name, is_pkg in pkgutil.walk_packages(__path__):
    module = loader.find_module(name).load_module(name)
    for name, value in inspect.getmembers(module):
        if name == "AbstractHandler":
            continue

        # Получаем все атрибуты модуля
        for name, obj in inspect.getmembers(module):
            if inspect.isclass(obj) and hasattr(obj, "name"):
                class_name = obj.name
                HANDLERS[class_name] = obj

