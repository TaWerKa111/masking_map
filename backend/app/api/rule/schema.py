from marshmallow import Schema, fields, pre_load, EXCLUDE

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


class LocationSchema(Schema):
    id = fields.Integer()
    name = fields.String()

class WorkSchema(Schema):
    id = fields.Integer()
    name = fields.String()

class LocationTypeSchema(Schema):
    id = fields.Integer()
    name = fields.String()

class QuestionAnswerSchema(Schema):
    id = fields.Integer(allow_none=True)
    text = fields.String()
    is_right = fields.Bool()

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


class CriteriaSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    type_criteria = fields.Method("get_criteria_type")
    locations = fields.List(fields.Nested(LocationSchema()))
    works = fields.List(fields.Nested(WorkSchema()))
    locations_type = fields.List(fields.Nested(LocationTypeSchema()))
    questions = fields.List(fields.Nested(QuestionSchema()))

    def get_criteria_type(self, obj):
        return obj.type_criteria.value



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
    text = fields.String()
    answers = fields.List(fields.Nested(QuestionAnswerSchema()))
    right_answer_id = fields.Integer(allow_none=True)

    class Meta:
        unknown = EXCLUDE


class UpdateQuestionSchema(AddQuestionSchema):
    id = fields.Integer()


class RuleProtectionSchema(Schema):
    protection_id = fields.Integer()
    is_masking = fields.Bool()
    is_demasking = fields.Bool()

    class Meta:
        unknown = EXCLUDE


class LocationRuleSchema(Schema):
    id = fields.Integer()

    class Meta:
        unknown = EXCLUDE


class TypeWorkRuleSchema(Schema):
    id = fields.Integer()
    
    class Meta:
        unknown = EXCLUDE


class TypeLocationRuleSchema(Schema):
    id = fields.Integer()

    class Meta:
        unknown = EXCLUDE


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
    compensatory_measures = fields.String(allow_none=True)


class RuleListSchema(Schema):
    rules = fields.List(fields.Nested(RuleSchema()))
    pagination = fields.Nested(PaginationResponseSchema())


class GetRuleSchema(Schema):
    rule_id = fields.Integer()


class FilterRulesSchema(PaginationSchema):
    rule_ids = fields.List(fields.Integer(), data_key="rule_ids[]")
    name = fields.String(allow_none=True)
