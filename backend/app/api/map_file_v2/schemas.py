from marshmallow import Schema, fields


class QuestionMaskingSchema(Schema):
    id = fields.Integer()
    answer_id = fields.Integer()


class GenerateMapV2Schema(Schema):
    type_work_ids = fields.List(fields.Integer(), allow_none=True)
    location_ids = fields.List(fields.Integer(), allow_none=True)
    type_location_ids = fields.List(fields.Integer(), allow_none=True)
    questions = fields.List(
        fields.Nested(QuestionMaskingSchema()), allow_none=True
    )
