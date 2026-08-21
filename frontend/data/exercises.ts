import type { Equipment, Exercise, MuscleGroup, SetType } from "@/types";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: "Pecho",
  LATS: "Dorsales",
  UPPER_BACK: "Espalda alta",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  FOREARMS: "Antebrazos",
  FRONT_DELTS: "Deltoides frontal",
  SIDE_DELTS: "Deltoides lateral",
  REAR_DELTS: "Deltoides posterior",
  QUADS: "Cuádriceps",
  HAMSTRINGS: "Isquios",
  GLUTES: "Glúteos",
  CALVES: "Gemelos",
  ADDUCTORS: "Aductores",
  ABDUCTORS: "Abductores",
  ABS: "Abdominales",
  OBLIQUES: "Oblicuos",
  LOWER_BACK: "Lumbar",
  CARDIO: "Cardio",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  NONE: "Peso corporal",
  BARBELL: "Barra",
  DUMBBELL: "Mancuernas",
  KETTLEBELL: "Kettlebell",
  CABLE: "Polea",
  MACHINE: "Máquina",
  PLATE: "Disco",
};

export const SET_TYPE_LABELS: Record<SetType, string> = {
  WARM_UP: "Calentamiento",
  NORMAL: "Normal",
  DROP_SET: "Drop set",
  FAILURE: "Al fallo",
};

export const mockExercises = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Press banca",
    primary_muscle: "CHEST" as MuscleGroup,
    secondary_muscles: ["TRICEPS", "FRONT_DELTS"] as MuscleGroup[],
    equipment: "BARBELL" as Equipment,
    media_url: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Sentadilla",
    primary_muscle: "QUADS" as MuscleGroup,
    secondary_muscles: ["GLUTES", "HAMSTRINGS"] as MuscleGroup[],
    equipment: "BARBELL" as Equipment,
    media_url: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Dominadas",
    primary_muscle: "LATS" as MuscleGroup,
    secondary_muscles: ["BICEPS"] as MuscleGroup[],
    equipment: "NONE" as Equipment,
    media_url: null,
  },
] as Exercise[];
