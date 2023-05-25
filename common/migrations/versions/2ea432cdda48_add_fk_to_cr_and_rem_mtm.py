"""add fk to cr and rem mtm

Revision ID: 2ea432cdda48
Revises: 79fef0ceb852
Create Date: 2023-05-16 09:34:10.481829

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2ea432cdda48'
down_revision = '79fef0ceb852'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('rule_criteria')
    op.add_column('criteria', sa.Column('rule_id', sa.Integer(), nullable=True))
    op.create_foreign_key("fk_criteria_rule", 'criteria', 'rule', ['rule_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("fk_criteria_rule", 'criteria', type_='foreignkey')
    op.drop_column('criteria', 'rule_id')
    op.create_table('rule_criteria',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('id_rule', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('id_criteria', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['id_criteria'], ['criteria.id'], name='rule_criteria_id_criteria_fkey'),
    sa.ForeignKeyConstraint(['id_rule'], ['rule.id'], name='rule_criteria_id_rule_fkey'),
    sa.PrimaryKeyConstraint('id', name='rule_criteria_pkey')
    )
    # ### end Alembic commands ###