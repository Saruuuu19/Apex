export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <p className="text-sm text-zinc-500">
      Detalle de la rutina <code>{id}</code>.
    </p>
  );
}