"use client";

import { useActionState } from "react";
import { Lock, Mail, User } from "lucide-react";

import { register } from "@/lib/auth";
import { GoogleIcon } from "@/components/ui/Icons";

const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google/login";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);

  return (
    <form action={action} className="flex flex-col">
      <h1 className="mb-6 text-center font-pixel text-2xl font-semibold text-(--text)">
        Create Account
      </h1>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium font-mono text-(--text)"
        >
          Email
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
          />

          <input
            type="text"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            className="h-10 w-full rounded-md border border-(--bg-input) bg(--bg-input) pr-3 pl-10 font-mono text-(--text) placeholder:text-(--text-muted)"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-sm font-medium font-mono text-(--text)"
        >
          Username
        </label>

        <div className="relative">
          <User
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
          />

          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            placeholder="Enter your username"
            required
            minLength={5}
            maxLength={20}
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
            autoComplete="new-password"
            placeholder="Enter your password"
            required
            minLength={8}
            maxLength={72}
            className="h-10 w-full rounded-md border border-(--bg-input) bg(--bg-input) pr-3 pl-10 font-mono text-(--text) placeholder:text-(--text-muted)"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label
          htmlFor="confirm-password"
          className="text-sm font-medium font-mono text-(--text)"
        >
          Confirm Password
        </label>

        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
          />

          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
            minLength={8}
            maxLength={72}
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
        {pending ? "Creating account..." : "Create Account"}
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
  );
}
