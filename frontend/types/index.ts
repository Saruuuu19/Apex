export type SetType = "WARM_UP" | "NORMAL" | "DROP_SET" | "FAILURE";

export type MuscleGroup =
  | "CHEST"
  | "LATS"
  | "UPPER_BACK"
  | "BICEPS"
  | "TRICEPS"
  | "FOREARMS"
  | "FRONT_DELTS"
  | "SIDE_DELTS"
  | "REAR_DELTS"
  | "QUADS"
  | "HAMSTRINGS"
  | "GLUTES"
  | "CALVES"
  | "ADDUCTORS"
  | "ABDUCTORS"
  | "ABS"
  | "OBLIQUES"
  | "LOWER_BACK"
  | "CARDIO";

export type Equipment =
  | "NONE"
  | "BARBELL"
  | "DUMBBELL"
  | "KETTLEBELL"
  | "CABLE"
  | "MACHINE"
  | "PLATE";

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Exercise {
  id: string;
  name: string;
  primary_muscle: MuscleGroup;
  secondary_muscles: MuscleGroup[];
  equipment: Equipment;
  media_url: string | null;
}

export interface RoutineSet {
  id: string;
  routine_exercise_id: string;
  order: number;
  target_reps: number | null;
  target_weight: number | null;
  set_type: SetType;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  order: number;
  routine_sets: RoutineSet[];
}

export interface Routine {
  id: string;
  name: string;
  user_id: string;
  routine_exercises: RoutineExercise[];
}

export interface Set {
  id: string;
  workout_exercise_id: string;
  order: number;
  set_type: SetType;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
}

export interface WorkoutExercise {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  order: number;
  sets: Set[] | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  started_at: string;
  completed_at: string | null;
  workout_exercises: WorkoutExercise[];
}