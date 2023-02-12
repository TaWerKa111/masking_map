from marshmallow import Schema, fields


class BinaryResponseSchema(Schema):
    result = fields.Bool(example=False)
    message = fields.String(example="Failed load data")
