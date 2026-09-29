"""Promueve (o degrada) a un usuario a admin del catálogo de ejercicios.

Uso (desde backend/):
    uv run python make_admin.py <username>
    uv run python make_admin.py <username> --revoke
"""

import sys

from sqlalchemy import select

from app.database import SessionLocal
from app.models.user import User


def main() -> None:
    args = sys.argv[1:]
    revoke = "--revoke" in args
    names = [a for a in args if not a.startswith("--")]

    if len(names) != 1:
        sys.exit("Uso: uv run python make_admin.py <username> [--revoke]")

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == names[0]))
        if user is None:
            sys.exit(f"Usuario no encontrado: {names[0]}")

        user.is_admin = not revoke
        db.commit()

    print(f"{names[0]}: is_admin = {not revoke}")


if __name__ == "__main__":
    main()
