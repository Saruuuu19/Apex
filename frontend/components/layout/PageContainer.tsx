export function PageContainer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-8">{children}</main>
  );
}