import catalog from "@/data/exercises.temp.json";
import type { Exercise } from "@/types";

export const EXERCISE_FALLBACK_IMAGE = "/icon-apex.svg";

// Catálogo temporal local. Misma forma que Exercise del backend.
// Cuando el backend tenga los 6 ejercicios sembrados, cambiar estas
// llamadas por api.getExercises() sin tocar los componentes.
export function getCatalogExercises(): Exercise[] {
  return catalog as Exercise[];
}

export function getExerciseImageUrl(
  exercise: Exercise | undefined | null,
): string {
  return exercise?.media_url ?? EXERCISE_FALLBACK_IMAGE;
}
