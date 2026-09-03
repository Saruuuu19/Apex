from pydantic import BaseModel


class WorkoutPostCreate(BaseModel):
    caption: str | None = None