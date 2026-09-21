import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      symbol: true,
      direction: true,
      status: true,
      netPnl: true,
      rMultiple: true,
      entryDate: true,
      setup: true,
    },
    orderBy: {
      entryDate: "desc",
    },
    take: 10,
  });

  const closedTrades = trades.filter((trade) => trade.status !== "OPEN");

  const wins = closedTrades.filter((trade) => trade.status === "WIN");
  const losses = closedTrades.filter((trade) => trade.status === "LOSS");

  const totalPnl = trades.reduce(
    (sum, trade) => sum + (trade.netPnl ?? 0),
    0,
  );

  const winRate =
    closedTrades.length > 0
      ? (wins.length / closedTrades.length) * 100
      : 0;

  const grossProfit = wins.reduce(
    (sum, trade) => sum + Math.max(trade.netPnl ?? 0, 0),
    0,
  );

  const grossLoss = losses.reduce(
    (sum, trade) => sum + Math.abs(Math.min(trade.netPnl ?? 0, 0)),
    0,
  );

  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const averageR =
    closedTrades.length > 0
      ? closedTrades.reduce(
          (sum, trade) => sum + (trade.rMultiple ?? 0),
          0,
        ) / closedTrades.length
      : 0;

  const stats = [
    {
      label: "Total P&L",
      value: formatCurrency(totalPnl, user.defaultCurrency),
      positive: totalPnl >= 0,
    },
    {
      label: "Win Rate",
      value: formatPercent(winRate),
      positive: winRate >= 50,
    },
    {
      label: "Profit Factor",
      value: Number.isFinite(profitFactor)
        ? profitFactor.toFixed(2)
        : "∞",
      positive: profitFactor >= 1,
    },
    {
      label: "Average R",
      value: `${averageR.toFixed(2)}R`,
      positive: averageR >= 0,
    },
    {
      label: "Total Trades",
      value: trades.length.toString(),
      positive: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">JournalX</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome back, {user.firstName}
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Here is an overview of your trading performance.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <p className="text-sm text-[var(--muted)]">{stat.label}</p>

              <p
                className={`mt-3 text-2xl font-bold ${
                  stat.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="font-semibold">Recent Trades</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Your latest journal entries.
            </p>
          </div>

          {trades.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium">No trades yet</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Add your first trade to start building your journal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Symbol</th>
                    <th className="px-5 py-3 font-medium">Direction</th>
                    <th className="px-5 py-3 font-medium">Setup</th>
                    <th className="px-5 py-3 font-medium">Result</th>
                    <th className="px-5 py-3 font-medium">P&L</th>
                    <th className="px-5 py-3 font-medium">R</th>
                  </tr>
                </thead>

                <tbody>
                  {trades.map((trade) => {
                    const pnl = trade.netPnl ?? 0;

                    return (
                      <tr
                        key={trade.id}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-5 py-4 font-medium">
                          {trade.symbol}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              trade.direction === "LONG"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {trade.direction}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[var(--muted)]">
                          {trade.setup ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          {trade.status}
                        </td>

                        <td
                          className={`px-5 py-4 font-medium ${
                            pnl >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(pnl, user.defaultCurrency)}
                        </td>

                        <td className="px-5 py-4">
                          {(trade.rMultiple ?? 0).toFixed(2)}R
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}