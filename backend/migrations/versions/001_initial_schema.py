"""Initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-04-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("avg_hours_per_week", sa.Float(), nullable=False),
        sa.Column("hourly_rate", sa.Float(), nullable=False),
        sa.Column("risk_profile_score", sa.Float(), server_default="1.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_users_id", "users", ["id"])

    # Policies
    op.create_table(
        "policies",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("weekly_premium", sa.Float(), nullable=False),
        sa.Column("coverage_hours", sa.Float(), nullable=False),
        sa.Column("active_status", sa.Boolean(), server_default="true"),
        sa.Column("risk_score", sa.Float(), server_default="1.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_policies_id", "policies", ["id"])

    # Triggers
    op.create_table(
        "triggers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("trigger_type", sa.String(), index=True),
        sa.Column("severity", sa.Float()),
        sa.Column("zone", sa.String()),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_triggers_id", "triggers", ["id"])

    # Claims
    op.create_table(
        "claims",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "trigger_id", sa.Integer(), sa.ForeignKey("triggers.id"), nullable=False
        ),
        sa.Column("disruption_hours", sa.Float(), nullable=False),
        sa.Column("loss_calculated", sa.Float(), nullable=False),
        sa.Column("status", sa.String(), server_default="pending"),
        sa.Column("fraud_confidence", sa.Float(), server_default="0.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_claims_id", "claims", ["id"])

    # Payouts
    op.create_table(
        "payouts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "claim_id", sa.Integer(), sa.ForeignKey("claims.id"), nullable=False
        ),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("status", sa.String(), server_default="processing"),
        sa.Column(
            "processed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_payouts_id", "payouts", ["id"])


def downgrade() -> None:
    op.drop_table("payouts")
    op.drop_table("claims")
    op.drop_table("triggers")
    op.drop_table("policies")
    op.drop_table("users")
