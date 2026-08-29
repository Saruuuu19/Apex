export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-(--text-muted)">
        Tu perfil y estadísticas. Conecta con <code>GET /me</code> vía lib/api.
      </p>
    </div>
  );
}