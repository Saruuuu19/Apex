# Apex-OS — Intentional design decisions

This document exists so that AI tools (editor, agents, etc.) DO NOT "fix" these decisions assuming they're bugs. If something here seems odd, it is intentional — ask before changing.

## Philosophy

Apex-OS models the distinction between plan and execution.

- Routine = plan.
- WorkoutSession = execution.

Never mix these two concepts.

## Data model

- `RoutineSet` uses `target_reps` / `target_weight` (the planned targets). `Set` uses `reps` / `weight` / `rpe` (the actual results). The names are DIFFERENT on purpose — do not unify them.
- A `Set` is created with `reps`/`weight`/`rpe` set to None when copied from a `RoutineSet` via `/start` — the user fills them in while training.
- Enums (SetType, MuscleGroup, Equipment) are declared WITHOUT explicit SqlEnum in `mapped_column` except when inside an ARRAY (e.g., `secondary_muscles`). This is the project's chosen style, not an omission.
- RPE is Numeric(3,1), business range 7.0–10.0 in 0.5 increments (validated in the schema, not in the column).
- `cascade="all, delete-orphan"` is applied to all parent→child composition relationships (Routine→RoutineExercise→RoutineSet, WorkoutSession→WorkoutExercise→Set). Do NOT add cascade on Routine→WorkoutSession (a session should survive if its source routine is deleted — that is why `routine_id` is nullable there).

## Authorization

- Reading Routine is PUBLIC for any authenticated user (ownership is not checked). Only mutations (POST exercises, PATCH, DELETE, `/start`) verify ownership.
- GET /exercises (catalog) requires authentication but does not check for role/admin — there is no role system yet.
- Auth error messages (login, register) are intentionally generic so they do not reveal which specific field failed.

## Endpoints — intentional behavior

- POST /workout-sessions/ ALWAYS creates an empty session (it ignores `workout_exercises` in the request body even if the schema permits them). This is the "empty workout" case.
- POST /routines/{id}/start DOES copy the full structure (RoutineExercise→WorkoutExercise, RoutineSet→Set) but leaves `reps`/`weight`/`rpe` as None. These two endpoints are intentionally different and their logic should not be unified.
- POST /workout-sessions/{id}/complete rejects (400) attempts to complete a session that already has `completed_at` — this is not a PATCH; it is a one-time action.

## Code style

- Imports always use `app.*` (never `backend.app.*`) because uvicorn runs from `backend/`, not from the repo root.
- Use SQLAlchemy 2.0 style: `select()`/`scalars()`/`db.get()` — never `db.query().filter()`.
- PATCH uses `model_dump(exclude_unset=True)` + `setattr` in a loop.
- Use forward references with `TYPE_CHECKING` for relationships between models to avoid circular imports.

## Exercise catalog

- Exercise is a developer-managed catalog.
- Users never create, modify, or delete exercises.
- POST /exercises exists only for administration (currently protected by authentication only, until roles are implemented).
- Avoid proposing user-facing CRUD endpoints for Exercise.

## Routines vs sessions

- Routine represents only a template.
- Never modify a WorkoutSession when editing a Routine.
- Starting a workout always creates a decoupled copy.

There are two ways to create a WorkoutSession:
- POST /workout-sessions (empty)
- POST /routines/{id}/start (from template)

Do not unify these flows.

## Updating Routine

- Completing a WorkoutSession DOES NOT automatically update a Routine's `target_weight` or `target_reps`.

- Updating the template will be an explicit user decision in the future.
