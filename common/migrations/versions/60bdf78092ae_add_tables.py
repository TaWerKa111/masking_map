"""add tables

Revision ID: 60bdf78092ae
Revises: 
Create Date: 2023-05-09 16:14:00.150742

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '60bdf78092ae'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('criteria',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('type_criteria', sa.Enum('location', 'type_work', 'type_location', 'question', name='typecriteria'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('departament_of_work',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('location_type',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('protection_status',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=64), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('question',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('text', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('type_protection',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('updated_at', postgresql.TIMESTAMP(), nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=64), nullable=True),
    sa.Column('password_hash', sa.String(length=255), nullable=True),
    sa.Column('role', sa.String(length=32), nullable=True),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_table('criteria_location_type',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_criteria', sa.Integer(), nullable=True),
    sa.Column('id_type_location', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_criteria'], ['criteria.id'], ),
    sa.ForeignKeyConstraint(['id_type_location'], ['location_type.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('location',
    sa.Column('updated_at', postgresql.TIMESTAMP(), nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('id_parent', sa.Integer(), nullable=True),
    sa.Column('id_type', sa.Integer(), nullable=True),
    sa.Column('ind_location', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_parent'], ['location.id'], ),
    sa.ForeignKeyConstraint(['id_type'], ['location_type.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_location_id_parent'), 'location', ['id_parent'], unique=False)
    op.create_table('masking_map_file',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('filename', sa.String(length=255), nullable=True),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('masking_uuid', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('data_masking', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('question_answer',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('text', sa.String(length=255), nullable=True),
    sa.Column('id_question', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_question'], ['question.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('question_criteria',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_criteria', sa.Integer(), nullable=True),
    sa.Column('id_question', sa.Integer(), nullable=True),
    sa.Column('id_right_answer', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_criteria'], ['criteria.id'], ),
    sa.ForeignKeyConstraint(['id_question'], ['question.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('rule',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('type_work',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('departament_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['departament_id'], ['departament_of_work.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_type_work_name'), 'type_work', ['name'], unique=False)
    op.create_table('criteria_location',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_criteria', sa.Integer(), nullable=True),
    sa.Column('id_location', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_criteria'], ['criteria.id'], ),
    sa.ForeignKeyConstraint(['id_location'], ['location.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('criteria_work_type',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_criteria', sa.Integer(), nullable=True),
    sa.Column('id_type_work', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_criteria'], ['criteria.id'], ),
    sa.ForeignKeyConstraint(['id_type_work'], ['type_work.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('protection',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('id_type_protection', sa.Integer(), nullable=True),
    sa.Column('is_end', sa.Boolean(), nullable=True),
    sa.Column('is_need_masking', sa.Boolean(), nullable=True),
    sa.Column('id_status', sa.Integer(), nullable=True),
    sa.Column('id_location', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_location'], ['location.id'], ),
    sa.ForeignKeyConstraint(['id_status'], ['protection_status.id'], ),
    sa.ForeignKeyConstraint(['id_type_protection'], ['type_protection.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_protection_id_type_protection'), 'protection', ['id_type_protection'], unique=False)
    op.create_index(op.f('ix_protection_name'), 'protection', ['name'], unique=False)
    op.create_table('rule_criteria',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_rule', sa.Integer(), nullable=True),
    sa.Column('id_criteria', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_criteria'], ['criteria.id'], ),
    sa.ForeignKeyConstraint(['id_rule'], ['rule.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('rule_protection',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_rule', sa.Integer(), nullable=True),
    sa.Column('id_protection', sa.Integer(), nullable=True),
    sa.Column('is_need_masking', sa.Boolean(), nullable=True),
    sa.Column('is_need_demasking', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['id_protection'], ['protection.id'], ),
    sa.ForeignKeyConstraint(['id_rule'], ['rule.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('type_work_protection',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_protection', sa.Integer(), nullable=True),
    sa.Column('id_type_work', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_protection'], ['protection.id'], ),
    sa.ForeignKeyConstraint(['id_type_work'], ['type_work.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('type_work_protection')
    op.drop_table('rule_protection')
    op.drop_table('rule_criteria')
    op.drop_index(op.f('ix_protection_name'), table_name='protection')
    op.drop_index(op.f('ix_protection_id_type_protection'), table_name='protection')
    op.drop_table('protection')
    op.drop_table('criteria_work_type')
    op.drop_table('criteria_location')
    op.drop_index(op.f('ix_type_work_name'), table_name='type_work')
    op.drop_table('type_work')
    op.drop_table('rule')
    op.drop_table('question_criteria')
    op.drop_table('question_answer')
    op.drop_table('masking_map_file')
    op.drop_index(op.f('ix_location_id_parent'), table_name='location')
    op.drop_table('location')
    op.drop_table('criteria_location_type')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_table('users')
    op.drop_table('type_protection')
    op.drop_table('question')
    op.drop_table('protection_status')
    op.drop_table('location_type')
    op.drop_table('departament_of_work')
    op.drop_table('criteria')
    # ### end Alembic commands ###
