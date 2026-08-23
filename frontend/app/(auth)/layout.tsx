import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="mx-auto w-full max-w-sm">{children}</div>;
}
