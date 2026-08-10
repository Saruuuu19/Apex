"""set null on delete for workout_sessions routine fk

Revision ID: a2b200f3c8e1
Revises: 1fac0fe5d72b
Create Date: 2026-08-10 00:04:11.575044

"""
from alembic import op
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = 'a2b200f3c8e1'
down_revision: Union[str, Sequence[str], None] = '1fac0fe5d72b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        "workout_sessions_routine_id_fkey", "workout_sessions", type_="foreignkey"
    )
    op.create_foreign_key(
        "workout_sessions_routine_id_fkey",
        "workout_sessions",
        "routines",
        ["routine_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "workout_sessions_routine_id_fkey", "workout_sessions", type_="foreignkey"
    )
    op.create_foreign_key(
        "workout_sessions_routine_id_fkey",
        "workout_sessions",
        "routines",
        ["routine_id"],
        ["id"],
    )
