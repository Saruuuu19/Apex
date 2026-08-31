import { PageContainer } from "@/components/layout/PageContainer";

export default function WorkoutSessionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageContainer>{children}</PageContainer>;
}