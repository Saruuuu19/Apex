# Apex

Sistema operativo personal para gestionar el entrenamiento y, próximamente, la productividad.

Hoy Apex se centra en el **tracking de entrenamiento**: crear rutinas, convertirlas en sesiones de entrenamiento, registrar cada serie con su peso, repeticiones y RPE, y mantener un histórico de lo que has hecho. Es un proyecto en evolución constante, con más módulos en camino.

## Funcionalidades actuales

- **Rutinas** — plantillas de entrenamiento reutilizables con ejercicios y series objetivo (reps, peso, tipo de serie).
- **Sesiones de entrenamiento** — se crean a partir de una rutina (copia desacoplada) o en blanco; se completan cuando terminas.
- **Registro de series** — cada set guarda reps, peso y RPE realizados durante el entrenamiento.
- **Catálogo de ejercicios** — base de datos de ejercicios con músculo principal, secundarios y equipamiento (gestionada por dev).
- **Autenticación JWT** — registro, login y sesiones por usuario, con rate-limiting en login/registro.

## Stack

| Capa          | Tecnología                                            |
| ------------- | ----------------------------------------------------- |
| Frontend      | Next.js 16 · TypeScript · Tailwind CSS 4 · pnpm       |
| Backend       | FastAPI · Python 3.14 · SQLAlchemy 2.0 · Alembic · uv |
| Base de datos | PostgreSQL 17 (Docker Compose)                        |
| Auth          | JWT (python-jose) · bcrypt · rate-limiting (slowapi)  |

## Conceptos clave

- **Routine = plan.** La plantilla que defines (qué ejercicios, cuántas series, con qué peso objetivo).
- **WorkoutSession = ejecución.** Lo que realmente haces en el gimnasio. Al empezar una sesión desde una rutina se crea una **copia desacoplada**: editar la rutina nunca modifica sesiones ya empezadas.
- **Catálogo de ejercicios** — los ejercicios no los crea el usuario; son una lista gestionada por desarrollo.

## Estructura del proyecto

```
apex-os/
├── backend/            # API FastAPI (app/, alembic/, .env)
├── frontend/           # Webapp Next.js (app/, package.json)
├── docker-compose.yml  # PostgreSQL local
└── README.md
```

## Puesta en marcha

**Requisitos:** Docker, Python 3.14, [uv](https://docs.astral.sh/uv/), [pnpm](https://pnpm.io/).

1. **Configura el entorno del backend.** Crea `backend/.env` con, como mínimo, `DATABASE_URL` y `SECRET_KEY` (ver campos requeridos en `backend/app/core/config.py`).
2. **Levanta PostgreSQL** (desde la raíz del repo):

   ```bash
   docker compose up -d
   ```

3. **Instala dependencias y aplica migraciones** (desde `backend/`):

   ```bash
   uv sync
   uv run alembic upgrade head
   ```

4. **Arranca el backend** (desde `backend/`):

   ```bash
   uv run uvicorn app.main:app --reload
   ```

   API disponible en <http://localhost:8000> · Docs interactivos en <http://localhost:8000/docs>

5. **Arranca el frontend** (desde `frontend/`):

   ```bash
   pnpm install
   pnpm dev
   ```

   Webapp en <http://localhost:3000>

## Comandos importantes

### Docker / PostgreSQL

Ejecutar **desde la raíz del repo** (`apex-os/`).

| Comando                           | Qué hace                            |
| --------------------------------- | ----------------------------------- |
| `docker compose up -d`            | Levanta PostgreSQL en segundo plano |
| `docker compose down`             | Detiene y elimina los contenedores  |
| `docker compose logs -f postgres` | Sigue los logs de PostgreSQL        |
| `docker compose restart postgres` | Reinicia PostgreSQL                 |

### Backend

Ejecutar **desde `backend/`**.

**Desarrollo**

| Comando                                | Qué hace                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| `uv sync`                              | Instala/sincroniza las dependencias de Python            |
| `uv run uvicorn app.main:app --reload` | Arranca la API en modo desarrollo con recarga automática |

**Migraciones (Alembic)**

| Comando                                                   | Qué hace                                         |
| --------------------------------------------------------- | ------------------------------------------------ |
| `uv run alembic revision --autogenerate -m "descripción"` | Crea una nueva migración a partir de los modelos |
| `uv run alembic upgrade head`                             | Aplica todas las migraciones pendientes          |
| `uv run alembic downgrade -1`                             | Revierte la última migración                     |
| `uv run alembic history`                                  | Lista el historial de migraciones                |
| `uv run alembic current`                                  | Muestra la versión actual de la base de datos    |

**Lint y formato (ruff)**

| Comando                     | Qué hace                                      |
| --------------------------- | --------------------------------------------- |
| `uv run ruff check .`       | Comprueba el código sin modificarlo           |
| `uv run ruff check --fix .` | Comprueba y corrige problemas automáticamente |
| `uv run ruff format .`      | Formatea el código                            |

### Frontend

Ejecutar **desde `frontend/`**.

| Comando        | Qué hace                                               |
| -------------- | ------------------------------------------------------ |
| `pnpm install` | Instala las dependencias de Node                       |
| `pnpm dev`     | Arranca el servidor de desarrollo (hot reload)         |
| `pnpm build`   | Compila la app para producción                         |
| `pnpm start`   | Sirve la compilación de producción (tras `pnpm build`) |
| `pnpm lint`    | Ejecuta ESLint                                         |

## API

La API expone su documentación interactiva (Swagger UI) en **<http://localhost:8000/docs>**.

Recursos principales:

- `POST /auth/register`, `POST /auth/login` — autenticación
- `/routines` — CRUD de rutinas y sus ejercicios/series
- `/workout-sessions` — creación, inicio desde rutina, registro de sets y completado
- `/exercises` — catálogo de ejercicios
- `/me/...` — rutinas y sesiones del usuario autenticado

## Próximamente

Apex es un "sistema operativo personal": además del tracking de entrenamiento, se irán añadiendo nuevos módulos de productividad. Este espacio crecerá con el roadmap.
