from marshmallow import Schema, fields, pre_load

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
    id = fields.Integer(allow_none=True)
    text = fields.String()

    @pre_load
    def preprocess(self, data, **kwargs):
        if data.get("id"):
            if isinstance(data["id"], str):
                data["id"] = None
        return data


class QuestionSchema(Schema):
    id = fields.Integer()
    text = fields.String()
    answers = fields.List(fields.Nested(QuestionAnswerSchema()))


class QuestionListSchema(Schema):
    questions = fields.List(fields.Nested(QuestionSchema()))
    pagination = fields.Nested(PaginationResponseSchema())


class GetQuestionSchema(Schema):
    id = fields.Integer(dump_only=True)


class FilterQuestionsSchema(PaginationSchema):
    question_ids = fields.List(fields.Integer(), data_key="question_ids[]")
    text = fields.String()


class AddQuestionSchema(Schema):
    id = fields.Integer()
    # text = fields.String()
    # answers = fields.List(fields.Nested(QuestionAnswerSchema()))


class UpdateQuestionSchema(AddQuestionSchema):
    id = fields.Integer()


class RuleProtectionSchema(Schema):
    protection_id = fields.Integer()
    is_masking = fields.Bool()
    is_demasking = fields.Bool()


class LocationRuleSchema(Schema):
    id = fields.Integer()


class TypeWorkRuleSchema(Schema):
    id = fields.Integer()


class TypeLocationRuleSchema(Schema):
    id = fields.Integer()


class AddRuleSchema(Schema):
    name = fields.String()
    type_works = fields.List(fields.Nested(TypeWorkRuleSchema()))
    locations = fields.List(fields.Nested(LocationRuleSchema()))
    type_locations = fields.List(fields.Nested(TypeLocationRuleSchema()))
    questions = fields.List(fields.Nested(AddQuestionSchema()))
    protections = fields.List(fields.Nested(RuleProtectionSchema()))
    compensatory_measures = fields.String(allow_none=True)


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
