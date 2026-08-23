"use client";

import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";

import { login } from "@/lib/auth";
import { GoogleIcon } from "@/components/ui/Icons";

const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google/login";

export function LoginForm({ defaultNext }: { defaultNext?: string }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col">
      <h1 className="mb-6 text-center font-pixel text-2xl font-semibold text-(--text)">
        Log In
      </h1>

      <input type="hidden" name="next" value={defaultNext ?? ""} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="identifier"
          className="text-sm font-medium font-mono text-(--text)"
        >
          Email / Username
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
          />

          <input
            type="text"
            id="identifier"
            name="identifier"
            autoComplete="username"
            placeholder="Enter your email or username"
            required
            className="h-10 w-full rounded-md border border-(--bg-input) bg(--bg-input) pr-3 pl-10 font-mono text-(--text) placeholder:text-(--text-muted)"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium font-mono text-(--text)"
        >
          Password
        </label>

        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
          />

          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className="h-10 w-full rounded-md border border-(--bg-input) bg(--bg-input) pr-3 pl-10 font-mono text-(--text) placeholder:text-(--text-muted)"
          />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="mt-4 font-mono text-sm text-(--text-danger)">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-10 w-full rounded-md bg-(--button-bg) font-bold text-(--text-accent) transition-colors hover:bg-(--button-bg-hover) disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Logging in..." : "Log in"}
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
          Log in with Google
        </a>
      </div>
    </form>
  );
}