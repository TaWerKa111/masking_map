from marshmallow import Schema, fields, post_load, EXCLUDE

from application.api.masking.helpers import (
    add_protection,
    add_type_work,
    add_mn_object,
    add_type_protection,
    add_type_work_protection,
)


class AddTypeWorkSchema(Schema):
    """ """

    name = fields.String(example="Огневые работы")

    class Meta:
        unknown = EXCLUDE

    @post_load
    def add(self, data, **kwargs):
        return add_type_work(**data)


class TypeWorkSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")


class AddProtectionSchema(Schema):
    """ """

    name = fields.String(example="Защита агрегата №1")
    id_type_protection = fields.Integer(example=1)

    class Meta:
        unknown = EXCLUDE

    @post_load
    def add(self, data, **kwargs):
        return add_protection(**data)


class ProtectionSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")
    id_type_protection = fields.Integer()


class AddTypeProtectionSchema(Schema):
    """ """

    name = fields.String(example="Общестанционная")

    class Meta:
        unknown = EXCLUDE

    @post_load
    def add(self, data, **kwargs):
        return add_type_protection(**data)


class TypeProtectionSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")


class AddMNObjectSchema(Schema):
    """ """

    name = fields.String(example="Защита агрегата №1")
    id_parent = fields.Integer(example=1)
    id_protection = fields.Integer(example=1)

    class Meta:
        unknown = EXCLUDE

    @post_load
    def add(self, data, **kwargs):
        return add_mn_object(**data)


class MNObjectSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")
    id_parent = fields.Integer()
    id_protection = fields.Integer()
