"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  exitPrice: string;
  positionSize: string;
  riskPercent: string;
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

const initialForm: FormData = {
  symbol: "",
  direction: "LONG",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  exitPrice: "",
  positionSize: "",
  riskPercent: "1",
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

function numberValue(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

type InputFieldProps = {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: string;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  step,
  min,
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

type TextareaFieldProps = {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
};

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: TextareaFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export default function NewTradePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTextareaChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const entryPrice = numberValue(form.entryPrice);
    const stopLoss = numberValue(form.stopLoss);
    const takeProfit = numberValue(form.takeProfit);
    const exitPrice = numberValue(form.exitPrice);
    const positionSize = numberValue(form.positionSize);
    const riskPercent = numberValue(form.riskPercent);
    const fees = numberValue(form.fees) ?? 0;
    const confidence = numberValue(form.confidence);
    const disciplineScore = numberValue(form.disciplineScore);

    if (!form.symbol.trim()) {
      setError("Symbol is required.");
      return;
    }

    if (entryPrice === undefined || entryPrice <= 0) {
      setError("Entry Price must be greater than 0.");
      return;
    }

    if (stopLoss === undefined || stopLoss <= 0) {
      setError("Stop Loss must be greater than 0.");
      return;
    }

    if (positionSize === undefined || positionSize <= 0) {
      setError("Position Size must be greater than 0.");
      return;
    }

    if (riskPercent === undefined || riskPercent <= 0) {
      setError("Risk % must be greater than 0.");
      return;
    }

    if (form.direction === "LONG" && stopLoss >= entryPrice) {
      setError("For LONG, Stop Loss must be below Entry Price.");
      return;
    }

    if (form.direction === "SHORT" && stopLoss <= entryPrice) {
      setError("For SHORT, Stop Loss must be above Entry Price.");
      return;
    }

    if (
      takeProfit !== undefined &&
      form.direction === "LONG" &&
      takeProfit <= entryPrice
    ) {
      setError("For LONG, Take Profit must be above Entry Price.");
      return;
    }

    if (
      takeProfit !== undefined &&
      form.direction === "SHORT" &&
      takeProfit >= entryPrice
    ) {
      setError("For SHORT, Take Profit must be below Entry Price.");
      return;
    }

    if (
      confidence !== undefined &&
      (!Number.isInteger(confidence) ||
        confidence < 1 ||
        confidence > 10)
    ) {
      setError("Confidence must be a whole number from 1 to 10.");
      return;
    }

    if (
      disciplineScore !== undefined &&
      (!Number.isInteger(disciplineScore) ||
        disciplineScore < 1 ||
        disciplineScore > 10)
    ) {
      setError("Discipline Score must be a whole number from 1 to 10.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/trades/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: form.symbol.trim().toUpperCase(),
          direction: form.direction,

          entryPrice,
          stopLoss,
          takeProfit,
          exitPrice,

          positionSize,
          riskPercent,
          fees,

          session: form.session.trim() || undefined,
          timeframe: form.timeframe.trim() || undefined,
          setup: form.setup.trim() || undefined,
          marketCondition:
            form.marketCondition.trim() || undefined,

          emotionBefore:
            form.emotionBefore.trim() || undefined,
          emotionDuring:
            form.emotionDuring.trim() || undefined,
          emotionAfter:
            form.emotionAfter.trim() || undefined,

          confidence,
          disciplineScore,

          entryReason:
            form.entryReason.trim() || undefined,
          exitReason:
            form.exitReason.trim() || undefined,
          mistake: form.mistake.trim() || undefined,
          lesson: form.lesson.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });

      const result: {
        error?: string;
        message?: string;
      } = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Failed to create trade.");
        return;
      }

      setSuccess("Trade created successfully.");

      setTimeout(() => {
        router.push("/trades");
        router.refresh();
      }, 500);
    } catch {
      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Add Trade
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Record your trade with risk, strategy, psychology and
          journal details.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trade Identity */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Trade Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField
              label="Symbol"
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              placeholder="XAUUSD"
            />

            <div>
              <label
                htmlFor="direction"
                className="mb-2 block text-sm font-medium"
              >
                Direction
              </label>

              <select
                id="direction"
                name="direction"
                value={form.direction}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>

            <InputField
              label="Session"
              name="session"
              value={form.session}
              onChange={handleChange}
              placeholder="London / New York"
            />

            <InputField
              label="Timeframe"
              name="timeframe"
              value={form.timeframe}
              onChange={handleChange}
              placeholder="15M"
            />
          </div>
        </section>

        {/* Entry & Risk */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Entry & Risk
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField
              label="Entry Price"
              name="entryPrice"
              value={form.entryPrice}
              onChange={handleChange}
              type="number"
              step="any"
              placeholder="2650.00"
            />

            <InputField
              label="Stop Loss"
              name="stopLoss"
              value={form.stopLoss}
              onChange={handleChange}
              type="number"
              step="any"
              placeholder="2640.00"
            />

            <InputField
              label="Take Profit"
              name="takeProfit"
              value={form.takeProfit}
              onChange={handleChange}
              type="number"
              step="any"
              placeholder="2680.00"
            />

            <InputField
              label="Exit Price"
              name="exitPrice"
              value={form.exitPrice}
              onChange={handleChange}
              type="number"
              step="any"
              placeholder="2675.00"
            />

            <InputField
              label="Position Size"
              name="positionSize"
              value={form.positionSize}
              onChange={handleChange}
              type="number"
              step="any"
              min="0"
              placeholder="0.03"
            />

            <InputField
              label="Risk %"
              name="riskPercent"
              value={form.riskPercent}
              onChange={handleChange}
              type="number"
              step="any"
              min="0"
              placeholder="1"
            />

            <InputField
              label="Fees"
              name="fees"
              value={form.fees}
              onChange={handleChange}
              type="number"
              step="any"
              min="0"
              placeholder="0"
            />
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-[var(--muted)]">
            Position Size is required to calculate P&L and R
            multiple when an Exit Price is provided.
          </div>
        </section>

        {/* Strategy */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Strategy & Market
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Setup"
              name="setup"
              value={form.setup}
              onChange={handleChange}
              placeholder="Liquidity Sweep + MSS + FVG"
            />

            <InputField
              label="Market Condition"
              name="marketCondition"
              value={form.marketCondition}
              onChange={handleChange}
              placeholder="Trending / Ranging"
            />
          </div>
        </section>

        {/* Psychology */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Psychology
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField
              label="Emotion Before"
              name="emotionBefore"
              value={form.emotionBefore}
              onChange={handleChange}
              placeholder="Calm"
            />

            <InputField
              label="Emotion During"
              name="emotionDuring"
              value={form.emotionDuring}
              onChange={handleChange}
              placeholder="Focused"
            />

            <InputField
              label="Emotion After"
              name="emotionAfter"
              value={form.emotionAfter}
              onChange={handleChange}
              placeholder="Satisfied"
            />

            <InputField
              label="Confidence (1-10)"
              name="confidence"
              value={form.confidence}
              onChange={handleChange}
              type="number"
              min="1"
              placeholder="8"
            />

            <InputField
              label="Discipline Score (1-10)"
              name="disciplineScore"
              value={form.disciplineScore}
              onChange={handleChange}
              type="number"
              min="1"
              placeholder="9"
            />
          </div>
        </section>

        {/* Journal */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Trading Journal
          </h2>

          <div className="space-y-4">
            <TextareaField
              label="Entry Reason"
              name="entryReason"
              value={form.entryReason}
              onChange={handleTextareaChange}
              placeholder="Why did you enter this trade?"
            />

            <TextareaField
              label="Exit Reason"
              name="exitReason"
              value={form.exitReason}
              onChange={handleTextareaChange}
              placeholder="Why did you exit this trade?"
            />

            <TextareaField
              label="Mistake"
              name="mistake"
              value={form.mistake}
              onChange={handleTextareaChange}
              placeholder="What mistake did you make?"
            />

            <TextareaField
              label="Lesson"
              name="lesson"
              value={form.lesson}
              onChange={handleTextareaChange}
              placeholder="What did you learn?"
            />

            <TextareaField
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleTextareaChange}
              placeholder="Additional notes..."
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/trades")}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving Trade..." : "Save Trade"}
          </button>
        </div>
      </form>
    </div>
  );
}