# Troubleshooting — GoalPredict 2026

Errores conocidos al levantar el stack con Docker Compose y cómo resolverlos.

## `password authentication failed for user "goalpredict"`

**Síntoma:**

```
goalpredict-db   | FATAL: password authentication failed for user "goalpredict"
goalpredict-backend | [db] esperando postgres (intento 1/30)...
...
goalpredict-backend | RuntimeError: No se pudo conectar a la base de datos tras 30 intentos
```

**Causa:**

Postgres **solo inicializa el usuario y contraseña en el primer arranque**, cuando el directorio de datos (`/var/lib/postgresql/data`, montado desde el volumen `goalpredict-pgdata`) está vacío. Si el volumen ya existe de una corrida previa con otro password, la nueva contraseña de `.env` se ignora y la autenticación falla.

Casos típicos en los que esto pasa:
- Cambiaste el `POSTGRES_PASSWORD` o `DATABASE_URL` en `.env` después de un `compose up` exitoso.
- Cambiaste el `.env` (o lo creaste por primera vez) entre arranques.
- Otro miembro del equipo arrancó el stack en tu máquina con otro password.

**Solución:**

```bash
docker compose down -v       # ⚠️ Borra el volumen, perdiendo los usuarios registrados
docker compose up --build    # Reinicializa Postgres con el password actual del .env
```

> `down -v` también borra cualquier usuario que hayas creado vía `/auth/register`. Si quieres conservarlos, haz primero un `pg_dump` con `docker exec goalpredict-db pg_dumpall -U goalpredict > backup.sql`.

## El backend arranca sin `.env`

Si no existe `.env` en la raíz, Compose cae en los defaults definidos con `${VAR:-default}` en `docker-compose.yml` (`changeme`, `goalpredict`, etc.). Sirve para una primera prueba pero **no es seguro para producción**: la `JWT_SECRET_KEY` queda con el valor por defecto.

Para configurar el stack en condiciones decentes:

```bash
cp .env.example .env
# Editar .env y poner valores reales, especialmente:
#   POSTGRES_PASSWORD
#   JWT_SECRET_KEY  (generar con: python -c "import secrets; print(secrets.token_urlsafe(64))")
```

Si ya habías levantado el stack y cambias estos valores, vuelve a hacer `docker compose down -v` para reinicializar Postgres.

## El frontend muestra "Failed to fetch" o "Network error"

**Causa habitual:** el frontend no encuentra el backend. Pasos para diagnosticar:

1. ¿Están ambos containers `(healthy)`?
   ```bash
   docker compose ps
   ```
2. ¿El backend responde directamente?
   ```bash
   curl http://localhost:8765/health
   ```
3. ¿El proxy de nginx funciona?
   ```bash
   curl http://localhost:8080/api/v1/teams
   ```

Si (2) falla, mira `docker compose logs backend`. Si (2) funciona pero (3) no, revisa `frontend/nginx.conf`.

## La imagen del backend es enorme (>1 GB)

Verificado: backend ~1.03 GB. La mayor parte viene de `xgboost` (227 MB) + `scipy/pandas/sklearn/numpy` (~190 MB combinados) + base Python slim + sistema. Esto es normal para imágenes con un stack ML completo.

Si necesitas reducirlo más:
- Multi-stage build con `python:3.11-slim` como runtime final y `python:3.11` como builder.
- Reemplazar `xgboost` por `xgboost-cpu` (paquete CPU-only más liviano), si existe para tu plataforma.
- Mover los modelos a un volumen y bajarlos en el primer arranque desde S3/object storage.

## Cómo limpiar todo y empezar de cero

```bash
docker compose down -v --rmi local    # detiene, borra volúmenes Y imágenes locales
docker system prune -af               # opcional: borra caches de build
cp .env.example .env                  # genera .env si no existe
docker compose up --build             # rebuild + arranque limpio
```
