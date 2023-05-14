from marshmallow import Schema, fields

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


class FileMaskingSchema(Schema):
    id = fields.Integer()
    name = fields.Integer()


class ListFileMaskingSchema(Schema):
    pagination = fields.Nested(PaginationResponseSchema())
    files = fields.Nested(FileMaskingSchema())


class Question(Schema):
    id = fields.Integer()
    answer_id = fields.Integer()


class GenerateMaskingPlanSchema(Schema):
    location_id = fields.Integer(validate=[is_not_exist_mn_object])
    type_work_id = fields.Integer(validate=[is_not_exist_type_work])
    questions = fields.List(fields.Nested(Question()))
    is_test = fields.Boolean()


class MaskingResponseFileSchema(BinaryResponseSchema):
    masking_uuid = fields.UUID()
