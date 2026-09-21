import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateTrade } from "@/lib/calculations/trade";

const updateTradeSchema = z.object({
  symbol: z.string().trim().min(1).max(30),
  direction: z.enum(["LONG", "SHORT"]),

  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive().optional(),
  exitPrice: z.number().positive().optional(),

  riskPercent: z.number().positive().max(100),
  riskAmount: z.number().positive().optional(),
  positionSize: z.number().positive().optional(),

  fees: z.number().min(0).default(0),

  session: z.string().trim().max(50).optional(),
  timeframe: z.string().trim().max(20).optional(),
  setup: z.string().trim().max(100).optional(),
  marketCondition: z.string().trim().max(100).optional(),

  emotionBefore: z.string().trim().max(100).optional(),
  emotionDuring: z.string().trim().max(100).optional(),
  emotionAfter: z.string().trim().max(100).optional(),

  confidence: z.number().int().min(1).max(10).optional(),
  disciplineScore: z.number().int().min(1).max(10).optional(),

  entryReason: z.string().trim().max(5000).optional(),
  exitReason: z.string().trim().max(5000).optional(),
  mistake: z.string().trim().max(5000).optional(),
  lesson: z.string().trim().max(5000).optional(),
  notes: z.string().trim().max(10000).optional(),

  entryDate: z.string().datetime().optional(),
});

function detectAssetClass(symbol: string) {
  const normalized = symbol.toUpperCase();

  if (
    normalized === "XAUUSD" ||
    normalized === "XAGUSD" ||
    normalized.includes("GOLD")
  ) {
    return "GOLD" as const;
  }

  if (
    normalized.includes("BTC") ||
    normalized.includes("ETH") ||
    normalized.includes("SOL")
  ) {
    return "CRYPTO" as const;
  }

  if (normalized.length === 6 && /^[A-Z]+$/.test(normalized)) {
    return "FOREX" as const;
  }

  return "OTHER" as const;
}

/* =========================================================
   GET SINGLE TRADE
========================================================= */

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const trade = await prisma.trade.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        strategy: true,
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      trade,
    });
  } catch (error) {
    console.error("Get trade error:", error);

    return NextResponse.json(
      { error: "Failed to load trade" },
      { status: 500 },
    );
  }
}

/* =========================================================
   UPDATE TRADE
========================================================= */

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const existingTrade = await prisma.trade.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 },
      );
    }

    const body: unknown = await request.json();

    const parsed = updateTradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid trade data",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const symbol = data.symbol.toUpperCase();

    /* =====================================================
       LONG STOP LOSS VALIDATION
    ===================================================== */

    if (
      data.direction === "LONG" &&
      data.stopLoss >= data.entryPrice
    ) {
      return NextResponse.json(
        {
          error:
            "For a LONG trade, Stop Loss must be below Entry Price.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       SHORT STOP LOSS VALIDATION
    ===================================================== */

    if (
      data.direction === "SHORT" &&
      data.stopLoss <= data.entryPrice
    ) {
      return NextResponse.json(
        {
          error:
            "For a SHORT trade, Stop Loss must be above Entry Price.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       LONG TAKE PROFIT VALIDATION
    ===================================================== */

    if (
      data.takeProfit !== undefined &&
      data.direction === "LONG" &&
      data.takeProfit <= data.entryPrice
    ) {
      return NextResponse.json(
        {
          error:
            "For a LONG trade, Take Profit must be above Entry Price.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       SHORT TAKE PROFIT VALIDATION
    ===================================================== */

    if (
      data.takeProfit !== undefined &&
      data.direction === "SHORT" &&
      data.takeProfit >= data.entryPrice
    ) {
      return NextResponse.json(
        {
          error:
            "For a SHORT trade, Take Profit must be below Entry Price.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       CALCULATE TRADE
    ===================================================== */

    const calculation = calculateTrade({
      direction: data.direction,
      entryPrice: data.entryPrice,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      exitPrice: data.exitPrice,
      fees: data.fees,
      positionSize: data.positionSize,
    });

    /* =====================================================
       UPDATE DATABASE
    ===================================================== */

    const trade = await prisma.trade.update({
      where: {
        id: existingTrade.id,
      },

      data: {
        symbol,

        assetClass: detectAssetClass(symbol),

        direction: data.direction,

        status: calculation.status,

        entryDate: data.entryDate
          ? new Date(data.entryDate)
          : existingTrade.entryDate,

        exitDate: data.exitPrice
          ? existingTrade.exitDate ?? new Date()
          : null,

        session: data.session,

        timeframe: data.timeframe,

        entryPrice: data.entryPrice,

        stopLoss: data.stopLoss,

        takeProfit: data.takeProfit,

        exitPrice: data.exitPrice,

        riskPercent: data.riskPercent,

        riskAmount:
          data.riskAmount ??
          calculation.initialRisk ??
          null,

        positionSize:
          data.positionSize ?? null,

        rMultiple:
          calculation.rMultiple ?? null,

        pnl:
          calculation.pnl ?? null,

        fees: data.fees,

        netPnl:
          calculation.netPnl ?? null,

        setup: data.setup,

        marketCondition: data.marketCondition,

        emotionBefore: data.emotionBefore,

        emotionDuring: data.emotionDuring,

        emotionAfter: data.emotionAfter,

        confidence: data.confidence,

        disciplineScore: data.disciplineScore,

        entryReason: data.entryReason,

        exitReason: data.exitReason,

        mistake: data.mistake,

        lesson: data.lesson,

        notes: data.notes,
      },

      include: {
        strategy: true,
      },
    });

    return NextResponse.json({
      message: "Trade updated successfully",

      trade,
    });
  } catch (error) {
    console.error("Update trade error:", error);

    return NextResponse.json(
      {
        error: "Failed to update trade",
      },
      { status: 500 },
    );
  }
}