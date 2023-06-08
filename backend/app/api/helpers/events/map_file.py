class MapFileEvent:
    after_add_or_update_rule_views_funcs = []
    after_generate_map_views_funcs = []

    @classmethod
    def after_add_or_update_rule_views(cls, func):
        """
        Добавление функции в ивент лист
        :param func: function
        :return: function
        """
        if callable(func):
            cls.after_add_or_update_rule_views_funcs.append(func)
            return func

    @classmethod
    def process_after_add_or_update_rule_views(cls):
        """
        Действия после добавления или изменения правила
        :return: None
        """

        for func in cls.after_add_or_update_rule_views_funcs:
            if callable(func):
                func()

    @classmethod
    def after_generate_map_views(cls, func):
        """
        Добавление функции в ивент лист
        :param func: function
        :return: function
        """
        if callable(func):
            cls.after_generate_map_views_funcs.append(func)
            return func

    @classmethod
    def process_after_generate_map_views(cls, text):
        """
        Действия после добавления или изменения правила
        :return: None
        """

        for func in cls.after_generate_map_views_funcs:
            if callable(func):
                func(text)
