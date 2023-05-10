from marshmallow import Schema, fields


class LoginSchema(Schema):
    login = fields.String(example="admin")
    password = fields.String(example="12345678")


class UserSchema(Schema):
    id = fields.Integer()
    username = fields.String()
    role = fields.String()
