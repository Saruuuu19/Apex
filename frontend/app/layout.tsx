import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="min-h-screen">
          <div className="flex">
            <Sidebar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
