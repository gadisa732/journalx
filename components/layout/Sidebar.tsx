import Link from "next/link";
import {
  BarChart3,
  Bot,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";

import { LogoutButton } from "@/components/layout/LogoutButton";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Trades",
    href: "/trades",
    icon: TrendingUp,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "AI Coach",
    href: "/ai-coach",
    icon: Bot,
  },
  {
    label: "Strategies",
    href: "/strategies",
    icon: Target,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight text-blue-400"
          >
            JournalX
          </Link>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Trading Journal
          </p>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-1 px-3 py-5"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[var(--border)] px-4 py-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
            <p className="text-xs font-medium">JournalX Pro</p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Unlock advanced analytics and AI coaching.
            </p>

            <Link
              href="/pricing"
              className="mt-3 block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-xs font-semibold text-white transition hover:opacity-90"
            >
              View Plans
            </Link>
          </div>

          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}