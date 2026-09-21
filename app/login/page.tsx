"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400"
            >
              JournalX
            </Link>

            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Sign in to continue to your trading journal.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
          >
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}