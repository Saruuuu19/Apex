"""remove traps from musclegroup enum

Revision ID: 1fac0fe5d72b
Revises: 948d760e7f34
Create Date: 2026-07-16 23:53:44.357686

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1fac0fe5d72b'
down_revision: Union[str, Sequence[str], None] = '948d760e7f34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


OLD_VALUES = (
    'CHEST', 'LATS', 'UPPER_BACK', 'TRAPS', 'BICEPS', 'TRICEPS', 'FOREARMS',
    'FRONT_DELTS', 'SIDE_DELTS', 'REAR_DELTS', 'QUADS', 'HAMSTRINGS', 'GLUTES',
    'CALVES', 'ABS', 'OBLIQUES', 'LOWER_BACK', 'ADDUCTORS', 'ABDUCTORS',
    'CARDIO',
)
NEW_VALUES = tuple(v for v in OLD_VALUES if v != 'TRAPS')


def _swap_enum(values: tuple[str, ...]) -> None:
    """Recreate the musclegroup type with the given values and re-point the
    exercises columns at it (Postgres cannot drop a value from an enum)."""
    op.execute("ALTER TYPE musclegroup RENAME TO musclegroup_old")
    sa.Enum(*values, name='musclegroup').create(op.get_bind())
    op.execute(
        "ALTER TABLE exercises ALTER COLUMN primary_muscle "
        "TYPE musclegroup USING primary_muscle::text::musclegroup"
    )
    op.execute(
        "ALTER TABLE exercises ALTER COLUMN secondary_muscles "
        "TYPE musclegroup[] USING secondary_muscles::text[]::musclegroup[]"
    )
    op.execute("DROP TYPE musclegroup_old")


def upgrade() -> None:
    """Upgrade schema."""
    # Remap any TRAPS rows to UPPER_BACK so the cast below cannot fail.
    op.execute(
        "UPDATE exercises SET primary_muscle = 'UPPER_BACK' "
        "WHERE primary_muscle = 'TRAPS'"
    )
    op.execute(
        """
        UPDATE exercises
        SET secondary_muscles = ARRAY(
            SELECT DISTINCT CASE WHEN m = 'TRAPS' THEN 'UPPER_BACK' ELSE m END
            FROM unnest(secondary_muscles::text[]) AS m
        )::musclegroup[]
        WHERE 'TRAPS' = ANY(secondary_muscles::text[])
        """
    )
    _swap_enum(NEW_VALUES)


def downgrade() -> None:
    """Downgrade schema."""
    _swap_enum(OLD_VALUES)
