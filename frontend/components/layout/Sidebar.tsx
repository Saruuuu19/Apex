import Link from "next/link";
import {
  type LucideIcon,
  Gauge,
  Heart,
  ClipboardList,
  Dumbbell,
  NotebookPen,
  Settings,
} from "lucide-react";

import { Logo } from "@/components/layout/Logo";

const NAV_ICON_CLASS = "h-5 w-5";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Feed", href: "/feed", icon: Heart },
  { label: "Routines", href: "/routines", icon: ClipboardList },
  { label: "Exercises", href: "/exercises", icon: Dumbbell },
  { label: "Trainer", href: "/trainer", icon: NotebookPen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-(--bg-input) bg-(--bg) px-4 py-6">
      <Link href="/" className="mb-8 px-2">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-light text-(--text) transition-colors hover:bg-(--bg-input-hover)"
          >
            <Icon className={NAV_ICON_CLASS} />
            {label}
          </Link>
        ))}
      </nav>

      <Link
        href="/profile"
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-(--bg-input-hover)"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--bg-input) text-sm font-medium text-(--text-muted)">
          U
        </span>
        <span className="text-sm font-medium text-(--text)">Usuario</span>
      </Link>
    </aside>
  );
}
