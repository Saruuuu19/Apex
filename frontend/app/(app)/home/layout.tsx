import { HomeHeader } from "@/components/layout/HomeHeader";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full flex-col">
      <HomeHeader />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}