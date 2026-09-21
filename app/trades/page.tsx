import Link from "next/link";
import { Plus } from "lucide-react";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

export default async function TradesPage() {
  const user = await requireUser();

  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      entryDate: "desc",
    },
    take: 50,
    include: {
      strategy: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Trades
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage and review your trading journal.
          </p>
        </div>

        <Link
          href="/trades/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Trade
        </Link>
      </div>

      {/* Trades */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {trades.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">
              No trades yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Start building your journal by adding your first trade.
            </p>

            <Link
              href="/trades/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add your first trade
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Symbol
                  </th>

                  <th className="px-5 py-4">
                    Direction
                  </th>

                  <th className="px-5 py-4">
                    Entry
                  </th>

                  <th className="px-5 py-4">
                    Exit
                  </th>

                  <th className="px-5 py-4">
                    P&L
                  </th>

                  <th className="px-5 py-4">
                    R
                  </th>

                  <th className="px-5 py-4">
                    Result
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="transition hover:bg-white/[0.03]"
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">
                      {trade.entryDate.toLocaleDateString()}
                    </td>

                    {/* Symbol - CLICKABLE */}
                    <td className="px-5 py-4 font-semibold">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="text-blue-400 transition hover:text-blue-300 hover:underline"
                      >
                        {trade.symbol}
                      </Link>
                    </td>

                    {/* Direction */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          trade.direction === "LONG"
                            ? "rounded-md bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400"
                            : "rounded-md bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400"
                        }
                      >
                        {trade.direction}
                      </span>
                    </td>

                    {/* Entry */}
                    <td className="px-5 py-4">
                      {trade.entryPrice}
                    </td>

                    {/* Exit */}
                    <td className="px-5 py-4">
                      {trade.exitPrice ?? "—"}
                    </td>

                    {/* P&L */}
                    <td
                      className={
                        trade.netPnl === null
                          ? "px-5 py-4"
                          : trade.netPnl >= 0
                            ? "px-5 py-4 font-semibold text-green-400"
                            : "px-5 py-4 font-semibold text-red-400"
                      }
                    >
                      {trade.netPnl === null
                        ? "—"
                        : `$${trade.netPnl.toFixed(2)}`}
                    </td>

                    {/* R Multiple */}
                    <td className="px-5 py-4">
                      {trade.rMultiple === null
                        ? "—"
                        : `${trade.rMultiple.toFixed(2)}R`}
                    </td>

                    {/* Result */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          trade.status === "WIN"
                            ? "rounded-md bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400"
                            : trade.status === "LOSS"
                              ? "rounded-md bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400"
                              : trade.status === "BREAKEVEN"
                                ? "rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-400"
                                : "rounded-md bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400"
                        }
                      >
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}