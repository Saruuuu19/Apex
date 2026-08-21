import Link from "next/link";

export default function RoutinesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Rutinas</h1>
        <Link
          href="/routines/new"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Nueva rutina
        </Link>
      </div>
      {children}
    </div>
  );
}