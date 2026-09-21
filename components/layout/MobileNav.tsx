"use client";

import Link from "next/link";
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Menu,
  TrendingUp,
} from "lucide-react";

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
];

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 px-2 py-2 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/settings"
          aria-label="More settings"
          className="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </Link>
      </div>
    </nav>
  );
}