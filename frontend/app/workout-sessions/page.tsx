import Link from "next/link";

export default function WorkoutSessionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sesiones</h1>
        <Link
          href="/workout-sessions/new"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Nueva sesión
        </Link>
      </div>
      <p className="text-sm text-zinc-500">
        Historial de sesiones. Conecta con <code>GET /me/workout-sessions</code>{" "}
        vía lib/api.
      </p>
    </div>
  );
}