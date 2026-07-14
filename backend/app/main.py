from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.exercise import router as exercise_router
from app.routers.routine import router as routines_router
from app.routers.user import router as users_router
from app.routers.workouts import router as workout_sessions_router
from app.routers.routine_exercises import router as routine_exercises_router

app = FastAPI(
    title="Apex-OS API",
    description="API for the Apex-OS application",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(exercise_router)
app.include_router(routines_router)
app.include_router(users_router)
app.include_router(workout_sessions_router)
app.include_router(routine_exercises_router)
