from marshmallow import Schema, fields, post_load, EXCLUDE

from application.api.helpers.schemas import BinaryResponseSchema
from application.api.masking.helpers import (
    add_protection,
    add_type_work,
    add_mn_object,
    add_type_protection,
    add_type_work_protection,
    get_type_work_list, get_mn_object_list,
)
from application.api.masking.validators import (
    is_not_exist_mn_object,
    is_not_exist_type_work
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


class GetTypeWorkListSchema(Schema):
    ids_type_protection = fields.List(
        fields.Integer, example=[1], data_key="ids_type_protection[]", allow_none=True)
    ids_type_mn_object = fields.List(
        fields.Integer, example=[1], data_key="ids_type_mn_object[]", allow_none=True)
    name_type_work = fields.String(example="Work 1", allow_none=True)

    @post_load
    def get_filter_type_work(self, data, **kwargs):
        return get_type_work_list(
            name=data.get("name_type_work"),
            ids_type_mn_object=data.get("ids_type_mn_object"),
            ids_type_protection=data.get("ids_type_protection"),
        )


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


class GetMNObjectListSchema(Schema):
    ids_type_protection = fields.List(
        fields.Integer, example=[1], data_key="ids_type_protection[]")
    ids_type_mn_object = fields.List(
        fields.Integer, example=[1], data_key="ids_type_mn_object[]")
    name_mn_object = fields.String(example="example", allow_none=True)

    @post_load
    def get_mn_object_list(self, data, **kwargs):
        return get_mn_object_list(
            name=data.get("name_protection"),
            ids_type_mn_object=data.get("ids_type_mn_object"),
            ids_type_protection=data.get("ids_type_protection"),
        )


class GenerateMaskingPlanSchema(Schema):

    id_object = fields.Integer(validate=[is_not_exist_mn_object])
    id_type_work = fields.Integer(validate=[is_not_exist_type_work])


class MaskingResponseFileSchema(BinaryResponseSchema):
    masking_uuid = fields.UUID()


class TypeMnObjectSchema(Schema):
    name = fields.Str(example="защита 1")
