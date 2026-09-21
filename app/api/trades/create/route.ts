import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateTrade } from "@/lib/calculations/trade";

const createTradeSchema = z.object({
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

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. AUTHENTICATION
    // --------------------------------------------------

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------------------------
    // 2. READ REQUEST BODY
    // --------------------------------------------------

    const body: unknown = await request.json();

    // --------------------------------------------------
    // 3. VALIDATE REQUEST
    // --------------------------------------------------

    const parsed = createTradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid trade data",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = parsed.data;

    // --------------------------------------------------
    // 4. NORMALIZE SYMBOL
    // --------------------------------------------------

    const symbol = data.symbol.toUpperCase();

    // --------------------------------------------------
    // 5. VALIDATE LONG / SHORT STOP LOSS
    // --------------------------------------------------

    if (
      data.direction === "LONG" &&
      data.stopLoss >= data.entryPrice
    ) {
      return NextResponse.json(
        {
          error:
            "For a LONG trade, Stop Loss must be below Entry Price.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      data.direction === "SHORT" &&
      data.stopLoss <= data.entryPrice
    ) {
      return NextResponse.json(
        {
          error:
            "For a SHORT trade, Stop Loss must be above Entry Price.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 6. VALIDATE TAKE PROFIT
    // --------------------------------------------------

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
        {
          status: 400,
        },
      );
    }

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
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 7. CALCULATE TRADE METRICS
    // --------------------------------------------------

    const calculation = calculateTrade({
      direction: data.direction,
      entryPrice: data.entryPrice,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      exitPrice: data.exitPrice,
      fees: data.fees,
      positionSize: data.positionSize,
    });

    // --------------------------------------------------
    // 8. DETERMINE DATABASE VALUES
    // --------------------------------------------------

    const calculatedRiskAmount =
      data.riskAmount ?? calculation.initialRisk ?? undefined;

    const calculatedPositionSize =
      data.positionSize ?? undefined;

    const calculatedPnl = calculation.pnl ?? undefined;

    const calculatedNetPnl =
      calculation.netPnl ?? undefined;

    const calculatedRMultiple =
      calculation.rMultiple ?? undefined;

    const calculatedStatus = calculation.status;

    // --------------------------------------------------
    // 9. CREATE TRADE
    // --------------------------------------------------

    const trade = await prisma.trade.create({
      data: {
        userId: session.userId,

        symbol,
        assetClass: detectAssetClass(symbol),

        direction: data.direction,
        status: calculatedStatus,

        entryDate: data.entryDate
          ? new Date(data.entryDate)
          : new Date(),

        session: data.session,
        timeframe: data.timeframe,

        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        exitPrice: data.exitPrice,

        riskPercent: data.riskPercent,
        riskAmount: calculatedRiskAmount,
        positionSize: calculatedPositionSize,

        rMultiple: calculatedRMultiple,

        pnl: calculatedPnl,

        fees: data.fees,

        netPnl: calculatedNetPnl,

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
    });

    // --------------------------------------------------
    // 10. RESPONSE
    // --------------------------------------------------

    return NextResponse.json(
      {
        message: "Trade created successfully",

        trade: {
          id: trade.id,
          symbol: trade.symbol,
          direction: trade.direction,
          status: trade.status,

          entryPrice: trade.entryPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          exitPrice: trade.exitPrice,

          riskPercent: trade.riskPercent,
          riskAmount: trade.riskAmount,
          positionSize: trade.positionSize,

          pnl: trade.pnl,
          fees: trade.fees,
          netPnl: trade.netPnl,
          rMultiple: trade.rMultiple,

          createdAt: trade.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create trade error:", error);

    return NextResponse.json(
      {
        error: "Failed to create trade",
      },
      {
        status: 500,
      },
    );
  }
}