export default async function WorkoutSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <p className="text-sm text-zinc-500">
      Detalle de la sesión <code>{id}</code>.
    </p>
  );
}