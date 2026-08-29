import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}
