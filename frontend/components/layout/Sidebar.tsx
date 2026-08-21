import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { NotebookPen } from "lucide-react";

import { Logo } from "@/components/layout/Logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Feed", href: "/feed" },
  { label: "Routines", href: "/routines" },
  { label: "Exercises", href: "/exercises" },
  { label: "Trainer", href: "/trainer" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 px-4 py-6 dark:border-zinc-800">
      <Link href="/" className="mb-8 px-2">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            {item.label === "Exercises" && <Dumbbell className="h-4 w-4" />}
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/profile"
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          U
        </span>
        <span className="text-sm font-medium">usuario</span>
      </Link>
    </aside>
  );
}
