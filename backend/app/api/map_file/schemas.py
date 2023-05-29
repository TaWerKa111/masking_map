from marshmallow import Schema, fields, EXCLUDE

from app.api.helpers.schemas import (
    PaginationSchema,
    PaginationResponseSchema,
    BinaryResponseSchema,
)
from app.api.masking.validators import (
    is_not_exist_mn_object,
    is_not_exist_type_work,
)


class GetListFilesMaskingSchema(PaginationSchema):
    """
    Схема для фильтрации списка файлов, пока ток пагинация
    """
    type_location_ids = fields.List(
        fields.Integer(), allow_none=True, data_key="type_location_ids[]")
    type_work_ids = fields.List(
        fields.Integer(), allow_none=True, data_key="type_work_ids[]")
    protection_ids = fields.List(
        fields.Integer(), allow_none=True, data_key="protection_ids[]")


class FileMaskingSchema(Schema):
    id = fields.Integer()
    filename = fields.String()
    description = fields.String()
    user_id = fields.Integer()
    is_test = fields.Boolean()
    is_valid = fields.Boolean()


class ListFileMaskingSchema(Schema):
    pagination = fields.Nested(PaginationResponseSchema())
    files = fields.List(fields.Nested(FileMaskingSchema()))


class Question(Schema):
    id = fields.Integer()
    answer_id = fields.Integer()

    class Meta:
        unknown = EXCLUDE


class LocationGenerateMapSchema(Schema):
    id = fields.Integer(validate=[is_not_exist_mn_object])
    id_type = fields.Integer(allow_none=True)

    class Meta:
        unknown = EXCLUDE


class TypeWorkGenerateMapSchema(Schema):
    id = fields.Integer(validate=[is_not_exist_type_work])

    class Meta:
        unknown = EXCLUDE


class GenerateMaskingPlanSchema(Schema):
    locations = fields.List(fields.Nested(LocationGenerateMapSchema()))
    type_works = fields.List(
        fields.Nested(TypeWorkGenerateMapSchema()), allow_none=True
    )
    questions = fields.List(fields.Nested(Question()))
    is_test = fields.Boolean()

    class Meta:
        unknown = EXCLUDE


class CheckMaskingFileSchema(GenerateMaskingPlanSchema):
    protections = fields.List(fields.Integer())


class MaskingResponseFileSchema(BinaryResponseSchema):
    masking_uuid = fields.UUID()
    description = fields.String()
    is_end = fields.Boolean()
    rule_ids = fields.List(fields.Integer())
    logic_machine_answer = fields.List(fields.String())
