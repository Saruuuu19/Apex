from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.exercise import router as exercise_router

app = FastAPI(
    title="Apex-OS API",
    description="API for the Apex-OS application",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(exercise_router)
