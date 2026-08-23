import { RegisterForm } from "@/components/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-6">
      <main className="w-full max-w-96 rounded-lg px-6 py-8">
        <RegisterForm />
      </main>
    </div>
  );
}