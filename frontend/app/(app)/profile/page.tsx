import { logout } from "@/lib/auth";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-(--text-muted)">
        Tu perfil y estadísticas. Conecta con <code>GET /me</code> vía lib/api.
      </p>

      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="h-10 w-full rounded-md border border-(--text-danger) font-bold text-(--text-danger) transition-colors hover:bg-(--text-danger)/10"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
