from os import environ
from typing import List


class SettingField:

    def __init__(self, field: str, type_=str, **kwargs):
        """
        Getting environment variable
        :param field: variable name
        :param type_: cast type
        :param kwargs:
            - default     (Any):    Set default value if name not in
                                    Environment.
        """
        self.field: str = field
        self.type = type_
        self.options: dict = kwargs

    def __get__(self, instance, owner):
        value = None
        try:
            if 'default' in self.options:
                value = environ.get(self.field, self.options.get('default'))
            else:
                value = environ[self.field]

            return self.type(value) if self.type else value
        except KeyError as error:
            raise ValueError(
                f'"{self.field}" environment variable should be setted!'
            )
        except TypeError as error:
            raise TypeError(f'Cannot cast {value} to {self.type_}!')


class BaseSetting:

    @classmethod
    def to_dict(cls, is_lower: bool = True, groups: List[str] = None,
                **kwargs) -> dict:
        """
        Config file to dict
        :param is_lower: config fields to lower case style.
                         Pass groups in lower case.
        :param groups: list of prefix keys for grouping. Example ssl_sslmode
                       where ssl(_) as prefix.
        :param kwargs:
            - ignored (List[str]):   Ignore properties.
        :return:
        """
        ignored = kwargs.get('ignored', [])

        if groups is None:
            groups = []

        cfg = {g: {} for g in groups}
        for key, value in [p for p in cls.__dict__.items() if p[0][:1] != '_']:
            if key.lower() in ignored:
                continue

            field = key.split('_')
            if field[0].lower() in groups:
                group = field[0].lower()
                field = '_'.join(field[1:])
                cfg[group].update({
                    field.lower() if is_lower else field: getattr(cls, key)
                })
            else:
                cfg[key.lower() if is_lower else key] = getattr(cls, key)

        return cfg

    @staticmethod
    def get(name: str, type_=None, **kwargs):
        """
        Getting environment variable
        :param name: variable name
        :param type_: cast type
        :param kwargs:
            - default     (Any):    Set default value if name not in
                                    Environment.
        :return: environment variable value
        """
        value = None
        try:
            if 'default' in kwargs:
                value = environ.get(name, kwargs.get('default'))
            else:
                value = environ[name]

            return type_(value) if type_ else value
        except KeyError as error:
            raise ValueError(
                f'"{name}" environment variable should be setted!'
            )
        except TypeError as error:
            raise TypeError(f'Cannot cast {value} to {type_}!')

    @staticmethod
    def get_bool(cls, name: str, **kwargs):
        return BaseSetting.get(name, type_=bool, **kwargs)

    @staticmethod
    def get_int(cls, name: str, **kwargs):
        return BaseSetting.get(name, type_=int, **kwargs)
