"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number | null;
  exitPrice: number | null;
  riskPercent: number;
  riskAmount: number | null;
  positionSize: number | null;
  fees: number;
  session: string | null;
  timeframe: string | null;
  setup: string | null;
  marketCondition: string | null;
  emotionBefore: string | null;
  emotionDuring: string | null;
  emotionAfter: string | null;
  confidence: number | null;
  disciplineScore: number | null;
  entryReason: string | null;
  exitReason: string | null;
  mistake: string | null;
  lesson: string | null;
  notes: string | null;
  entryDate: string;
};

type FormData = {
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  exitPrice: string;
  riskPercent: string;
  riskAmount: string;
  positionSize: string;
  fees: string;
  session: string;
  timeframe: string;
  setup: string;
  marketCondition: string;
  emotionBefore: string;
  emotionDuring: string;
  emotionAfter: string;
  confidence: string;
  disciplineScore: string;
  entryReason: string;
  exitReason: string;
  mistake: string;
  lesson: string;
  notes: string;
};

const emptyForm: FormData = {
  symbol: "",
  direction: "LONG",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  exitPrice: "",
  riskPercent: "",
  riskAmount: "",
  positionSize: "",
  fees: "0",
  session: "",
  timeframe: "",
  setup: "",
  marketCondition: "",
  emotionBefore: "",
  emotionDuring: "",
  emotionAfter: "",
  confidence: "",
  disciplineScore: "",
  entryReason: "",
  exitReason: "",
  mistake: "",
  lesson: "",
  notes: "",
};

function numberOrUndefined(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
      />
    </label>
  );
}

export default function EditTradePage() {
  const params = useParams();
  const router = useRouter();

  const tradeId = params.id as string;

  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrade() {
      try {
        const response = await fetch(`/api/trades/${tradeId}`);

        if (!response.ok) {
          throw new Error("Failed to load trade");
        }

        const data = (await response.json()) as {
          trade: Trade;
        };

        const trade = data.trade;

        setForm({
          symbol: trade.symbol,
          direction: trade.direction,
          entryPrice: String(trade.entryPrice),
          stopLoss: String(trade.stopLoss),
          takeProfit:
            trade.takeProfit !== null
              ? String(trade.takeProfit)
              : "",
          exitPrice:
            trade.exitPrice !== null
              ? String(trade.exitPrice)
              : "",
          riskPercent: String(trade.riskPercent),
          riskAmount:
            trade.riskAmount !== null
              ? String(trade.riskAmount)
              : "",
          positionSize:
            trade.positionSize !== null
              ? String(trade.positionSize)
              : "",
          fees: String(trade.fees),
          session: trade.session ?? "",
          timeframe: trade.timeframe ?? "",
          setup: trade.setup ?? "",
          marketCondition: trade.marketCondition ?? "",
          emotionBefore: trade.emotionBefore ?? "",
          emotionDuring: trade.emotionDuring ?? "",
          emotionAfter: trade.emotionAfter ?? "",
          confidence:
            trade.confidence !== null
              ? String(trade.confidence)
              : "",
          disciplineScore:
            trade.disciplineScore !== null
              ? String(trade.disciplineScore)
              : "",
          entryReason: trade.entryReason ?? "",
          exitReason: trade.exitReason ?? "",
          mistake: trade.mistake ?? "",
          lesson: trade.lesson ?? "",
          notes: trade.notes ?? "",
        });
      } catch {
        setError("Failed to load trade.");
      } finally {
        setLoading(false);
      }
    }

    void loadTrade();
  }, [tradeId]);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const entryPrice = numberOrUndefined(form.entryPrice);
    const stopLoss = numberOrUndefined(form.stopLoss);
    const riskPercent = numberOrUndefined(form.riskPercent);

    if (
      entryPrice === undefined ||
      stopLoss === undefined ||
      riskPercent === undefined
    ) {
      setError(
        "Entry Price, Stop Loss and Risk % are required.",
      );
      return;
    }

    const payload = {
      symbol: form.symbol,
      direction: form.direction,
      entryPrice,
      stopLoss,

      takeProfit: numberOrUndefined(form.takeProfit),
      exitPrice: numberOrUndefined(form.exitPrice),

      riskPercent,
      riskAmount: numberOrUndefined(form.riskAmount),
      positionSize: numberOrUndefined(form.positionSize),

      fees: numberOrUndefined(form.fees) ?? 0,

      session: form.session || undefined,
      timeframe: form.timeframe || undefined,
      setup: form.setup || undefined,
      marketCondition:
        form.marketCondition || undefined,

      emotionBefore:
        form.emotionBefore || undefined,
      emotionDuring:
        form.emotionDuring || undefined,
      emotionAfter:
        form.emotionAfter || undefined,

      confidence:
        numberOrUndefined(form.confidence),
      disciplineScore:
        numberOrUndefined(form.disciplineScore),

      entryReason:
        form.entryReason || undefined,
      exitReason:
        form.exitReason || undefined,
      mistake: form.mistake || undefined,
      lesson: form.lesson || undefined,
      notes: form.notes || undefined,
    };

    setSaving(true);

    try {
      const response = await fetch(
        `/api/trades/${tradeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to update trade",
        );
      }

      router.push(`/trades/${tradeId}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update trade.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
          Loading trade...
        </div>
      </div>
    );
  }

  if (error && form.symbol === "") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-400">{error}</p>

          <Link
            href={`/trades/${tradeId}`}
            className="mt-4 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Trade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/trades/${tradeId}`}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Trade
        </Link>

        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
          Edit Trade
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Update your trading journal entry.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Trade Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InputField
              label="Symbol"
              value={form.symbol}
              onChange={(value) =>
                updateField("symbol", value)
              }
              placeholder="XAUUSD"
            />

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Direction
              </span>

              <select
                value={form.direction}
                onChange={(event) =>
                  updateField(
                    "direction",
                    event.target.value as
                      | "LONG"
                      | "SHORT",
                  )
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </label>

            <InputField
              label="Entry Price"
              type="number"
              value={form.entryPrice}
              onChange={(value) =>
                updateField("entryPrice", value)
              }
            />

            <InputField
              label="Stop Loss"
              type="number"
              value={form.stopLoss}
              onChange={(value) =>
                updateField("stopLoss", value)
              }
            />

            <InputField
              label="Take Profit"
              type="number"
              value={form.takeProfit}
              onChange={(value) =>
                updateField("takeProfit", value)
              }
            />

            <InputField
              label="Exit Price"
              type="number"
              value={form.exitPrice}
              onChange={(value) =>
                updateField("exitPrice", value)
              }
            />

            <InputField
              label="Risk %"
              type="number"
              value={form.riskPercent}
              onChange={(value) =>
                updateField("riskPercent", value)
              }
            />

            <InputField
              label="Risk Amount"
              type="number"
              value={form.riskAmount}
              onChange={(value) =>
                updateField("riskAmount", value)
              }
            />

            <InputField
              label="Position Size"
              type="number"
              value={form.positionSize}
              onChange={(value) =>
                updateField("positionSize", value)
              }
            />

            <InputField
              label="Fees"
              type="number"
              value={form.fees}
              onChange={(value) =>
                updateField("fees", value)
              }
            />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Market Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InputField
              label="Session"
              value={form.session}
              onChange={(value) =>
                updateField("session", value)
              }
              placeholder="London / New York"
            />

            <InputField
              label="Timeframe"
              value={form.timeframe}
              onChange={(value) =>
                updateField("timeframe", value)
              }
              placeholder="15M / 1H / 4H"
            />

            <InputField
              label="Setup"
              value={form.setup}
              onChange={(value) =>
                updateField("setup", value)
              }
              placeholder="FVG / MSS / Liquidity Sweep"
            />

            <InputField
              label="Market Condition"
              value={form.marketCondition}
              onChange={(value) =>
                updateField("marketCondition", value)
              }
              placeholder="Trending / Ranging"
            />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Psychology
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InputField
              label="Emotion Before"
              value={form.emotionBefore}
              onChange={(value) =>
                updateField("emotionBefore", value)
              }
            />

            <InputField
              label="Emotion During"
              value={form.emotionDuring}
              onChange={(value) =>
                updateField("emotionDuring", value)
              }
            />

            <InputField
              label="Emotion After"
              value={form.emotionAfter}
              onChange={(value) =>
                updateField("emotionAfter", value)
              }
            />

            <InputField
              label="Confidence (1-10)"
              type="number"
              value={form.confidence}
              onChange={(value) =>
                updateField("confidence", value)
              }
            />

            <InputField
              label="Discipline Score (1-10)"
              type="number"
              value={form.disciplineScore}
              onChange={(value) =>
                updateField(
                  "disciplineScore",
                  value,
                )
              }
            />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Journal
          </h2>

          <div className="mt-5 space-y-4">
            <TextareaField
              label="Entry Reason"
              value={form.entryReason}
              onChange={(value) =>
                updateField("entryReason", value)
              }
            />

            <TextareaField
              label="Exit Reason"
              value={form.exitReason}
              onChange={(value) =>
                updateField("exitReason", value)
              }
            />

            <TextareaField
              label="Mistake"
              value={form.mistake}
              onChange={(value) =>
                updateField("mistake", value)
              }
            />

            <TextareaField
              label="Lesson"
              value={form.lesson}
              onChange={(value) =>
                updateField("lesson", value)
              }
            />

            <TextareaField
              label="Notes"
              value={form.notes}
              onChange={(value) =>
                updateField("notes", value)
              }
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/trades/${tradeId}`}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:bg-white/5"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}