"""Seed del catálogo de ejercicios desde el JSON temporal del frontend.

Uso (desde backend/):
    uv run python seed_exercises.py

Idempotente: los ejercicios se insertan con sus UUID fijos, así que
volver a ejecutarlo no duplica filas (ON CONFLICT DO NOTHING).
"""

import json
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.database import SessionLocal
from app.models.enums import Equipment, MuscleGroup
from app.models.exercise import Exercise

# backend/ y frontend/ son hermanos en la raíz del repo.
CATALOG_PATH = (
    Path(__file__).resolve().parents[1] / "frontend" / "data" / "exercises.temp.json"
)


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))

    rows = [
        {
            "id": exercise["id"],
            "name": exercise["name"],
            "primary_muscle": MuscleGroup(exercise["primary_muscle"]),
            "secondary_muscles": [
                MuscleGroup(m) for m in exercise["secondary_muscles"]
            ],
            "equipment": Equipment(exercise["equipment"]),
            "media_url": exercise["media_url"],
        }
        for exercise in catalog
    ]

    with SessionLocal() as db:
        result = db.execute(
            insert(Exercise).values(rows).on_conflict_do_nothing(index_elements=["id"])
        )
        db.commit()

        total = db.scalar(select(func.count()).select_from(Exercise))

    print(f"Ejercicios insertados: {result.rowcount}")
    print(f"Total en la DB: {total}")


if __name__ == "__main__":
    main()
