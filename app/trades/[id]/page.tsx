import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

function formatMoney(value: number | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

export default async function TradeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      strategy: true,
    },
  });

  if (!trade) {
    notFound();
  }

  const resultClass =
    trade.status === "WIN"
      ? "bg-emerald-500/10 text-emerald-400"
      : trade.status === "LOSS"
        ? "bg-red-500/10 text-red-400"
        : trade.status === "BREAKEVEN"
          ? "bg-yellow-500/10 text-yellow-400"
          : "bg-blue-500/10 text-blue-400";

  const directionClass =
    trade.direction === "LONG"
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/trades"
            className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Back to Trades
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {trade.symbol}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${resultClass}`}
            >
              {trade.status}
            </span>

            <span
              className={`rounded-full bg-white/5 px-3 py-1 text-xs font-bold ${directionClass}`}
            >
              {trade.direction}
            </span>
          </div>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {formatDate(trade.entryDate)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/trades/${trade.id}/edit`}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
          >
            Edit Trade
          </Link>

          <Link
            href="/trades"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            All Trades
          </Link>
        </div>
      </div>

      {/* Performance */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Performance
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            label="P&L"
            value={formatMoney(trade.pnl)}
          />

          <DetailItem
            label="Net P&L"
            value={formatMoney(trade.netPnl)}
          />

          <DetailItem
            label="R Multiple"
            value={
              trade.rMultiple !== null
                ? `${trade.rMultiple.toFixed(2)}R`
                : "—"
            }
          />

          <DetailItem
            label="Fees"
            value={formatMoney(trade.fees)}
          />
        </div>
      </section>

      {/* Trade & Risk */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Trade & Risk
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            label="Entry Price"
            value={trade.entryPrice}
          />

          <DetailItem
            label="Stop Loss"
            value={trade.stopLoss}
          />

          <DetailItem
            label="Take Profit"
            value={trade.takeProfit ?? "—"}
          />

          <DetailItem
            label="Exit Price"
            value={trade.exitPrice ?? "—"}
          />

          <DetailItem
            label="Risk %"
            value={`${trade.riskPercent}%`}
          />

          <DetailItem
            label="Risk Amount"
            value={formatMoney(trade.riskAmount)}
          />

          <DetailItem
            label="Position Size"
            value={trade.positionSize ?? "—"}
          />

          <DetailItem
            label="Asset Class"
            value={trade.assetClass}
          />
        </div>
      </section>

      {/* Strategy */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Strategy & Market
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            label="Strategy"
            value={trade.strategy?.name ?? "—"}
          />

          <DetailItem
            label="Setup"
            value={trade.setup ?? "—"}
          />

          <DetailItem
            label="Market Condition"
            value={trade.marketCondition ?? "—"}
          />

          <DetailItem
            label="Timeframe"
            value={trade.timeframe ?? "—"}
          />

          <DetailItem
            label="Session"
            value={trade.session ?? "—"}
          />
        </div>
      </section>

      {/* Psychology */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Psychology
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Emotion Before"
            value={trade.emotionBefore ?? "—"}
          />

          <DetailItem
            label="Emotion During"
            value={trade.emotionDuring ?? "—"}
          />

          <DetailItem
            label="Emotion After"
            value={trade.emotionAfter ?? "—"}
          />

          <DetailItem
            label="Confidence"
            value={
              trade.confidence !== null
                ? `${trade.confidence}/10`
                : "—"
            }
          />

          <DetailItem
            label="Discipline Score"
            value={
              trade.disciplineScore !== null
                ? `${trade.disciplineScore}/10`
                : "—"
            }
          />
        </div>
      </section>

      {/* Journal */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Journal
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <DetailItem
            label="Entry Reason"
            value={trade.entryReason ?? "—"}
          />

          <DetailItem
            label="Exit Reason"
            value={trade.exitReason ?? "—"}
          />

          <DetailItem
            label="Mistake"
            value={trade.mistake ?? "—"}
          />

          <DetailItem
            label="Lesson"
            value={trade.lesson ?? "—"}
          />

          <div className="lg:col-span-2">
            <DetailItem
              label="Notes"
              value={trade.notes ?? "—"}
            />
          </div>
        </div>
      </section>

      {/* Media */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Screenshots
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-3 text-sm font-semibold">
              Before Trade
            </p>

            {trade.beforeScreenshotUrl ? (
              <img
                src={trade.beforeScreenshotUrl}
                alt="Trade setup before entry"
                className="w-full rounded-lg"
              />
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No screenshot uploaded.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-3 text-sm font-semibold">
              After Trade
            </p>

            {trade.afterScreenshotUrl ? (
              <img
                src={trade.afterScreenshotUrl}
                alt="Trade result after exit"
                className="w-full rounded-lg"
              />
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No screenshot uploaded.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}