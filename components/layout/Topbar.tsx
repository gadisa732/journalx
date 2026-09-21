import Link from "next/link";
import { Bell, Search } from "lucide-react";

type TopbarProps = {
  firstName: string;
  lastName: string;
  email: string;
};

export function Topbar({
  firstName,
  lastName,
  email,
}: TopbarProps) {
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

            <input
              type="search"
              placeholder="Search trades..."
              aria-label="Search trades"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="md:hidden">
            <Link
              href="/dashboard"
              className="text-sm font-bold tracking-tight text-blue-400"
            >
              JournalX
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            <Bell className="h-5 w-5" />

            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500"
            />
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-400">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">
                {firstName} {lastName}
              </p>

              <p className="max-w-40 truncate text-xs text-[var(--muted)]">
                {email}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}