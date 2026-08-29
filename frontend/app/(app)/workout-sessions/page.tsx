export default function WorkoutSessionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Workout</h1>
      </div>
      <p className="text-sm text-(--text-muted)">
        Rutinas de entrenamiento y nueva sesión. Conecta con{" "}
        <code>GET /me/workout-sessions</code> vía lib/api.
      </p>
    </div>
  );
}
