"""Inicialización de la base de datos al arrancar el backend.

- Crea las tablas si no existen (`Base.metadata.create_all`).
- Siembra los usuarios demo solo si la tabla está vacía.

En un proyecto en producción esto se manejaría con Alembic. Para este
alcance académico, `create_all` es suficiente y no necesitamos migraciones.
"""

from __future__ import annotations

import time

from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.security import hash_password
from .models import User
from .session import Base, SessionLocal, engine


def _wait_for_db(max_attempts: int = 30, delay: float = 1.0) -> None:
    """En docker-compose el backend puede arrancar antes que postgres acepte
    conexiones aunque el healthcheck haya pasado. Reintentamos brevemente."""
    last_exc: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect():
                return
        except OperationalError as e:
            last_exc = e
            print(f"[db] esperando postgres (intento {attempt}/{max_attempts})...")
            time.sleep(delay)
    raise RuntimeError(
        f"No se pudo conectar a la base de datos tras {max_attempts} intentos: {last_exc}"
    )


def _seed_demo_users(session: Session) -> int:
    """Inserta los usuarios demo si la tabla `users` está vacía.

    Devuelve cuántos usuarios se insertaron.
    """
    settings = get_settings()
    if session.scalar(select(User).limit(1)) is not None:
        return 0  # ya hay datos, no sembrar nada

    demos = [
        {
            "username": settings.demo_free_username,
            "password": settings.demo_free_password,
            "tier": "free",
        },
        {
            "username": settings.demo_premium_username,
            "password": settings.demo_premium_password,
            "tier": "premium",
        },
    ]

    for spec in demos:
        user = User(
            username=spec["username"],
            hashed_password=hash_password(spec["password"]),
            tier=spec["tier"],
        )
        session.add(user)
    session.commit()
    return len(demos)


def init_db() -> None:
    """Crea tablas y siembra demo users. Idempotente."""
    _wait_for_db()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seeded = _seed_demo_users(session)
        if seeded:
            print(f"[db] sembrados {seeded} usuarios demo (free + premium)")
        else:
            print("[db] usuarios ya presentes, no se siembra")
