import type { Equipment, MuscleGroup, SetType } from "@/types";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: "Chest",
  LATS: "Lats",
  UPPER_BACK: "Upper Back",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  FOREARMS: "Forearms",
  FRONT_DELTS: "Front delts",
  SIDE_DELTS: "Side delts",
  REAR_DELTS: "Rear delts",
  QUADS: "Cuadriceps",
  HAMSTRINGS: "Hamstrings",
  GLUTES: "Glutes",
  CALVES: "Calves",
  ADDUCTORS: "Adductors",
  ABDUCTORS: "Abductors",
  ABS: "Abs",
  OBLIQUES: "Obliques",
  LOWER_BACK: "Lower Back",
  CARDIO: "Cardio",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  NONE: "Bodyweight",
  BARBELL: "Barbell",
  DUMBBELL: "Dumbell",
  KETTLEBELL: "Kettlebell",
  CABLE: "Cable",
  MACHINE: "Machine",
  PLATE: "Plate",
};

export const SET_TYPE_LABELS: Record<SetType, string> = {
  WARM_UP: "Warm Up",
  NORMAL: "Normal",
  DROP_SET: "Drop Set",
  FAILURE: "Failure",
};

export const SET_TYPE_ABBR: Record<SetType, string> = {
  WARM_UP: "W",
  NORMAL: "N",
  DROP_SET: "D",
  FAILURE: "F",
};
