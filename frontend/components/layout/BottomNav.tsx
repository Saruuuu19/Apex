"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon, Dumbbell, House, User } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/home/feed", icon: House },
  { label: "Workout", href: "/workout-sessions", icon: Dumbbell },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t border-(--bg-input) bg-(--bg)"
    >
      {navItems.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/home/feed"
            ? pathname.startsWith("/home")
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-200",
              active
                ? "text-(--text-link)"
                : "text-(--text-muted) hover:text-(--text)",
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}