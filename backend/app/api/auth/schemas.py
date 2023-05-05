from marshmallow import Schema, fields


class LoginSchema(Schema):
    login = fields.String(example="admin")
    password = fields.String(example="12345678")
