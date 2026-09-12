"""harden workout flow: one post per session, unique orders, rpe check

Revision ID: 9b1f2a3c4d5e
Revises: 64043cb45a56
Create Date: 2026-09-11 05:30:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "9b1f2a3c4d5e"
down_revision: Union[str, Sequence[str], None] = "64043cb45a56"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Keep the earliest published post per workout session, drop duplicates.
    op.execute(
        """
        DELETE FROM workout_posts a
        USING workout_posts b
        WHERE a.workout_session_id IS NOT NULL
          AND a.workout_session_id = b.workout_session_id
          AND (a.published_at, a.id) > (b.published_at, b.id)
        """
    )

    # Renumber orders only in partitions that currently contain duplicates,
    # preserving the original relative order.
    op.execute(
        """
        WITH duplicate_partitions AS (
            SELECT workout_session_id
            FROM workout_exercises
            GROUP BY workout_session_id, "order"
            HAVING count(*) > 1
        ),
        ranked AS (
            SELECT id,
                   row_number() OVER (
                       PARTITION BY workout_session_id
                       ORDER BY "order", id
                   ) - 1 AS new_order
            FROM workout_exercises
        )
        UPDATE workout_exercises we
        SET "order" = ranked.new_order
        FROM ranked
        WHERE we.id = ranked.id
          AND we."order" <> ranked.new_order
          AND we.workout_session_id IN (
              SELECT workout_session_id FROM duplicate_partitions
          )
        """
    )
    op.execute(
        """
        WITH duplicate_partitions AS (
            SELECT workout_exercise_id
            FROM sets
            GROUP BY workout_exercise_id, "order"
            HAVING count(*) > 1
        ),
        ranked AS (
            SELECT id,
                   row_number() OVER (
                       PARTITION BY workout_exercise_id
                       ORDER BY "order", id
                   ) - 1 AS new_order
            FROM sets
        )
        UPDATE sets s
        SET "order" = ranked.new_order
        FROM ranked
        WHERE s.id = ranked.id
          AND s."order" <> ranked.new_order
          AND s.workout_exercise_id IN (
              SELECT workout_exercise_id FROM duplicate_partitions
          )
        """
    )

    op.create_unique_constraint(
        "uq_workout_posts_workout_session_id",
        "workout_posts",
        ["workout_session_id"],
    )
    op.create_unique_constraint(
        "uq_workout_exercises_session_order",
        "workout_exercises",
        ["workout_session_id", "order"],
    )
    op.create_unique_constraint(
        "uq_sets_workout_exercise_order",
        "sets",
        ["workout_exercise_id", "order"],
    )
    op.create_check_constraint(
        "ck_sets_rpe_range",
        "sets",
        "rpe IS NULL OR (rpe >= 7 AND rpe <= 10)",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("ck_sets_rpe_range", "sets", type_="check")
    op.drop_constraint("uq_sets_workout_exercise_order", "sets", type_="unique")
    op.drop_constraint(
        "uq_workout_exercises_session_order", "workout_exercises", type_="unique"
    )
    op.drop_constraint(
        "uq_workout_posts_workout_session_id", "workout_posts", type_="unique"
    )
