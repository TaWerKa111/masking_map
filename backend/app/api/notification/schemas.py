from marshmallow import Schema, fields

from app.api.helpers.schemas import PaginationResponseSchema, PaginationSchema


class GetNotifySchema(PaginationSchema):
    pass


class NotifySchema(Schema):
    text = fields.String()
    id = fields.Integer()
    status = fields.Integer()
    is_reading = fields.Bool()
    is_for_all = fields.Bool()
    user_id = fields.Integer()


class NotifyListSchema(Schema):
    notifications = fields.List(fields.Nested(NotifySchema()))
    pagination = fields.Nested(PaginationResponseSchema())
