from flask import current_app
from marshmallow import Schema, fields, post_load, EXCLUDE

from app.api.helpers.schemas import (
    BinaryResponseSchema,
    PaginationSchema,
    PaginationResponseSchema,
)
from app.api.masking.helpers import (
    add_protection,
    add_type_work,
    add_location,
    add_type_protection,
    get_type_work_list,
    get_location_list, get_location, add_type_location,
)
from app.api.masking.validators import (
    is_not_exist_mn_object,
    is_not_exist_type_work,
)
from common.postgres.models import Location


# Todo дописать логику для схем (добавление и изменение данных)


class DepartamentSchema(Schema):
    id = fields.Integer()
    name = fields.String()


class AddDepartamentSchema(Schema):
    name = fields.String()


class UpdateDepartamentSchema(Schema):
    id = fields.Integer()
    name = fields.String()


class FilterParamDepartamentSchema(Schema):
    name = fields.String()


class DepartamentListSchema(Schema):
    departaments = fields.List(fields.Nested(DepartamentSchema()))


class AddTypeWorkSchema(Schema):
    """ """

    name = fields.String(example="Огневые работы")
    departament_id = fields.Integer(example=1, allow_none=True)

    class Meta:
        unknown = EXCLUDE

    @post_load
    def add(self, data, **kwargs):
        return add_type_work(**data)


class UpdateTypeWorkSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    departament_id = fields.Integer(allow_none=True)


class TypeWorkSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")
    departament = fields.Nested(DepartamentSchema())


class TypeWorkListSchema(Schema):
    type_works = fields.List(fields.Nested(TypeWorkSchema()))
    pagination = fields.Nested(PaginationResponseSchema())


class FilterParamTypeWorkSchema(Schema):
    ids_type_protection = fields.List(
        fields.Integer,
        example=[1],
        data_key="ids_type_protection[]",
        allow_none=True,
    )
    ids_type_mn_object = fields.List(
        fields.Integer,
        example=[1],
        data_key="ids_type_mn_object[]",
        allow_none=True,
    )
    name_type_work = fields.String(example="Work 1", allow_none=True)

    @post_load
    def get_filter_type_work(self, data, **kwargs):
        return get_type_work_list(
            name=data.get("name_type_work"),
            ids_type_mn_object=data.get("ids_type_mn_object"),
            ids_type_protection=data.get("ids_type_protection"),
        )


class AddProtectionSchema(Schema):
    """"""

    name = fields.String(example="Защита агрегата №1")
    id_type_protection = fields.Integer(example=1)
    id_location = fields.Integer(example=1)
    is_end = fields.Boolean(example=True)

    class Meta:
        unknown = EXCLUDE

    # @post_load
    # def add(self, data, **kwargs):
    #     return add_protection(**data)


class UpdateProtectionSchema(AddProtectionSchema):
    id = fields.Integer()


class FileterParamProtectionSchema(PaginationSchema):
    name = fields.String()
    type_protections_ids = fields.List(
        fields.Integer(), data_key="type_protections_ids[]"
    )


class ProtectionSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")
    id_type_protection = fields.Integer()
    # type_protection = fields.List(fields.Dict())
    is_end = fields.Boolean(example=True)


class ProtectionListSchema(Schema):
    protections = fields.List(fields.Nested(ProtectionSchema()))
    pagination = fields.Nested(PaginationResponseSchema())


class AddTypeProtectionSchema(Schema):
    """"""

    name = fields.String(example="Общестанционная")

    class Meta:
        unknown = EXCLUDE

    @post_load
    def add(self, data, **kwargs):
        return add_type_protection(**data)


class FilterParamTypeProtectionSchema(Schema):
    name = fields.String()


class UpdateTypeProtectionSchema(Schema):
    id = fields.Integer()
    name = fields.String()


class TypeProtectionSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")


class AddLocationSchema(Schema):
    """ """

    name = fields.String(example="Защита агрегата №1")
    id_parent = fields.Integer(example=1)
    # id_protection = fields.Integer(example=1)
    ind_location = fields.Integer(example=1)
    id_type_location = fields.Integer(example=1)

    class Meta:
        unknown = EXCLUDE


class UpdateLocationSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    id_parent = fields.Integer(allow_none=True)
    id_type_location = fields.Integer(allow_none=True)


class GetLocationSchema(Schema):
    id = fields.Integer()

    @post_load()
    def get_location_process(self, data, **kwargs):
        get_location(**data)


class LocationSchema(Schema):
    id = fields.Integer(example=1)
    name = fields.String(example="")
    id_parent = fields.Integer()
    # id_protection = fields.Integer()
    id_type = fields.Integer(allow_none=True)


class LocationListSchema(Schema):
    locations = fields.List(fields.Nested(LocationSchema()))
    pagination = fields.Nested(PaginationResponseSchema())


class FilterParamLocationSchema(PaginationSchema):
    ids_type_protection = fields.List(
        fields.Integer, example=[1], data_key="ids_type_protection[]", allow_none=True
    )
    ids_type_location = fields.List(
        fields.Integer, example=[1], data_key="ids_type_mn_location[]", allow_none=True
    )
    name = fields.String(example="example", allow_none=True)

    @post_load
    def get_mn_object_list(self, data, **kwargs):
        current_app.logger.info(data)
        return get_location_list(
            name=data.get("name"),
            ids_type_mn_object=data.get("ids_type_location"),
            ids_type_protection=data.get("ids_type_protection"),
        )


class AddTypeLocationSchema(Schema):
    name = fields.String()

    @post_load()
    def add_type_location_process(self, data, **kwargs):
        return add_type_location(
            data.get("name")
        )


class UpdateTypeLocationSchema(Schema):
    id = fields.Integer()
    name = fields.String()


class TypeLocationSchema(Schema):
    id = fields.Integer()
    name = fields.Str(example="защита 1")


class RelationshipLocationLocationSchema(Schema):
    location_id = fields.Integer()
    location_ids = fields.List(fields.Integer())


class RelationshipLocationProtectionSchema(Schema):
    location_id = fields.Integer()
    protection_ids = fields.List(fields.Integer())



