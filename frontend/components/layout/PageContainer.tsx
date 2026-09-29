export function PageContainer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24">{children}</main>
  );
}
