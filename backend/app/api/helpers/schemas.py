from marshmallow import Schema, fields, validate


class BinaryResponseSchema(Schema):
    result = fields.Bool(example=False)
    message = fields.String(example="Failed load data")


class PaginationSchema(Schema):
    page = fields.Integer(
        example=1, validate=validate.Range(min=0), load_default=1
    )
    limit = fields.Integer(example=10, load_default=1000)


class PaginationResponseSchema(Schema):
    page = fields.Integer(example=1)
    limit = fields.Integer(example=10)
    total_pages = fields.Integer(example=1)
    total_items = fields.Integer(example=10)
