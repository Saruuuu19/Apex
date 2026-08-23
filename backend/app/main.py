from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.core.limiter import limiter
from app.routers.auth import router as auth_router
from app.routers.exercise import router as exercise_router
from app.routers.routine import router as routines_router
from app.routers.user import router as users_router
from app.routers.workouts import router as workout_sessions_router
from app.routers.routine_exercises import router as routine_exercises_router

app = FastAPI(
    title="Apex API",
    description="API for the Apex application",
    version="0.1.0",
)

# CORS Config
origins = ["http://localhost:3000", "https://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)


@app.get("/")
def root():
    return {"message": "Apex API is running!"}


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

app.include_router(auth_router)
app.include_router(exercise_router)
app.include_router(routines_router)
app.include_router(users_router)
app.include_router(workout_sessions_router)
app.include_router(routine_exercises_router)
