import { LoginForm } from "@/components/features/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-6">
      <main className="w-full max-w-96 rounded-lg px-6 py-8">
        <LoginForm defaultNext={next} />
      </main>
    </div>
  );
}
