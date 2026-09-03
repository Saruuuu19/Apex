from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_post import WorkoutPost
from app.models.workout_session import WorkoutSession
from app.schemas.workout_post import WorkoutPostResponse

router = APIRouter(tags=["Feed"])


@router.get("/feed", response_model=list[WorkoutPostResponse])
def get_feed(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    posts = db.scalars(
        select(WorkoutPost)
        .order_by(WorkoutPost.performed_at.desc())
        .options(
            selectinload(WorkoutPost.workout_session)
            .selectinload(WorkoutSession.workout_exercises)
            .selectinload(WorkoutExercise.sets),
            selectinload(WorkoutPost.user),
        )
    ).all()
    return posts


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(WorkoutPost, post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post",
        )

    db.delete(post)
    db.commit()
