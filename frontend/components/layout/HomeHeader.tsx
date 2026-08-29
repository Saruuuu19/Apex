"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const views = [
  { label: "Dashboard", href: "/home/dashboard" },
  { label: "Feed", href: "/home/feed" },
];

export function HomeHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-(--bg)">
      <nav
        className="mx-10 flex items-center justify-center gap-1 border-b border-(--bg-input) px-6 py-2 md:mx-auto md:max-w-2xl md:px-0"
        aria-label="Vista de inicio"
      >
        {views.map(({ label, href }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center px-4 text-base font-medium transition-colors duration-200 hover:text-(--text)",
                active ? "text-(--text)" : "text-(--text-muted)",
              )}
            >
              {label}
              {active && (
                <span className="absolute inset-x-4 bottom-2 h-0.5 rounded-full bg-(--text-link)" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
