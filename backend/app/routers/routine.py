# Routines.py router
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from uuid import UUID

from app.core.dependencies import get_current_user
from app.models.routine import Routine
from app.models.user import User
from app.schemas.routine import RoutineCreate, RoutineResponse, RoutineUpdate

router = APIRouter(prefix="/routines", tags=["Routines"])


@router.post(
    "/",
    response_model=RoutineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_routine(
    routine: RoutineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = Routine(name=routine.name, user_id=current_user.id)

    db.add(db_routine)

    db.commit()

    db.refresh(db_routine)

    return db_routine


@router.get(
    "/{routine_id}",
    response_model=RoutineResponse,
    status_code=status.HTTP_200_OK,
)
def get_routine(
    routine_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = db.get(Routine, routine_id)

    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found"
        )

    if db_routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this routine",
        )

    return db_routine


@router.patch(
    "/{routine_id}",
    response_model=RoutineResponse,
    status_code=status.HTTP_200_OK,
)
def update_routine(
    routine_id: UUID,
    routine_update: RoutineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = db.get(Routine, routine_id)

    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found"
        )

    if db_routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this routine",
        )

    update_data = routine_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_routine, field, value)

    db.commit()

    db.refresh(db_routine)

    return db_routine


@router.delete(
    "/{routine_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_routine(
    routine_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = db.get(Routine, routine_id)

    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found"
        )

    if db_routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this routine",
        )

    db.delete(db_routine)

    db.commit()
