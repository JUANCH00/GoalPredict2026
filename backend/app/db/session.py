"""Engine + sesión de SQLAlchemy y dependencia FastAPI `get_db`.

Usamos el modo síncrono porque las rutas son sync (`def`) y la latencia
dominante del backend es el modelo ML, no la DB. Async añadiría complejidad
sin ganancia en este alcance académico.
"""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from ..core.config import get_settings

settings = get_settings()

# `pool_pre_ping=True` reabre conexiones muertas (útil cuando Postgres se
# reinicia o cuando el container queda idle).
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base declarativa de todos los modelos ORM."""


def get_db() -> Iterator[Session]:
    """Dependencia FastAPI: cede una sesión y la cierra al final del request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
