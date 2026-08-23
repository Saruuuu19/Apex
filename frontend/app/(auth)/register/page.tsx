import { type LucideIcon, Mail, User, Lock } from "lucide-react";
import { GoogleIcon } from "@/components/ui/Icons";

const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google/register";

const inputItems: {
  label: string;
  id: string;
  type: string;
  icon: LucideIcon;
  placeholder: string;
}[] = [
  {
    label: "Email",
    id: "email",
    type: "text",
    icon: Mail,
    placeholder: "Enter your email",
  },
  {
    label: "Username",
    id: "username",
    type: "text",
    icon: User,
    placeholder: "Enter your username",
  },
  {
    label: "Password",
    id: "password",
    type: "password",
    icon: Lock,
    placeholder: "Enter your password",
  },
  {
    label: "Confirm Password",
    id: "confirm-password",
    type: "password",
    icon: Lock,
    placeholder: "Repeat your password",
  },
];

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-6">
      <main className="w-full max-w-96 rounded-lg px-6 py-8">
        <form className="flex flex-col">
          <h1 className="mb-6 text-center font-pixel text-2xl font-semibold text-(--text)">
            Create Account
          </h1>

          {inputItems.map((item, index) => (
            <div
              key={item.id}
              className={
                index === 0
                  ? "flex flex-col gap-1.5"
                  : "mt-4 flex flex-col gap-1.5"
              }
            >
              <label
                htmlFor={item.id}
                className="text-sm font-medium font-mono text-(--text)"
              >
                {item.label}
              </label>

              <div className="relative">
                <item.icon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
                />

                <input
                  type={item.type}
                  id={item.id}
                  name={item.id}
                  autoComplete={
                    item.type === "password" ? "current-password" : "username"
                  }
                  placeholder={item.placeholder}
                  className="h-10 w-full rounded-md border border-(--bg-input) bg(--bg-input) pr-3 pl-10 font-mono text-(--text) placeholder:text-(--text-muted)"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="mt-6 h-10 w-full rounded-md bg-(--button-bg) font-bold text-(--text-accent) transition-colors hover:bg-(--button-bg-hover)"
          >
            Create Account
          </button>

          <div className="my-6 flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-(--bg-surface)" />

            <span className="shrink-0 text-sm font-mono text-(--text-muted)">
              Or continue with
            </span>

            <span className="h-px flex-1 bg-(--bg-surface)" />
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={GOOGLE_AUTH_URL}
              className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-(--bg-surface) bg-(--bg-surface) px-4 font-mono text-sm text-(--text) transition-colors hover:bg-(--bg-surface-hover)"
            >
              <GoogleIcon className="h-4 w-4 shrink-0" />
              Sign up with Google
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
