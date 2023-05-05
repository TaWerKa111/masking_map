from marshmallow import Schema, fields

from app.api.helpers.schemas import PaginationSchema, PaginationResponseSchema
from app.api.masking.schemas import ProtectionSchema
from common.postgres.models import Protection


class TypeCriteriaSchema(Schema):
    id = fields.Integer()
    name = fields.String()


class AddTypeCriteriaSchema(Schema):
    name = fields.String()

    def add_type_cr(self, data, **kwargs):
        pass


class CriteriaSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    type = fields.Nested(TypeCriteriaSchema())


class QuestionAnswerSchema(Schema):
    id = fields.Integer(dump_only=True)
    text = fields.String()
    is_right_answer = fields.Bool()


class QuestionSchema(Schema):
    id = fields.Integer()
    text = fields.String()
    criteria = fields.List(fields.Nested(CriteriaSchema()))
    responses = fields.List(fields.Nested(QuestionAnswerSchema()))


class AddQuestionSchema(Schema):
    text = fields.String()
    answers = fields.List(fields.Nested(QuestionAnswerSchema()))


class RuleProtectionSchema(Schema):
    protection_id = fields.Integer()
    is_masking = fields.Bool()
    is_demasking = fields.Bool()


class AddRuleSchema(Schema):
    name = fields.String()
    type_work_id = fields.Integer()
    location_id = fields.Integer()
    type_location_id = fields.Integer()
    questions = fields.List(fields.Nested(AddQuestionSchema()))
    protections = fields.List(fields.Nested(RuleProtectionSchema()))


class UpdateRuleSchema(AddRuleSchema):
    id = fields.Integer()


class RuleSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    criteria = fields.List(fields.Nested(CriteriaSchema()))
    protections = fields.List(fields.Nested(ProtectionSchema()))


class RuleListSchema(Schema):
    rules = fields.List(fields.Nested(RuleSchema()))
    pagination = fields.Nested(PaginationResponseSchema())


class GetRuleSchema(Schema):
    rule_id = fields.Integer()


class FilterRulesSchema(PaginationSchema):
    rule_ids = fields.List(fields.Integer(), data_key="rule_ids[]")
    name = fields.String()
