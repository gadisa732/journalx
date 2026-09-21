import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("JournalX DEMO DATA seed started...");

  const passwordHash = await hash("Demo12345!", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "demo@journalx.com",
    },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Trader",
      email: "demo@journalx.com",
      passwordHash,
      tradingExperience: "Intermediate",
      defaultCurrency: "USD",
      defaultRisk: 1,
      timezone: "UTC",
    },
  });

  console.log(`Demo user: ${user.email}`);

  await prisma.subscription.upsert({
    where: {
      userId: user.id,
    },
    update: {},
    create: {
      userId: user.id,
      plan: "FREE",
      status: "ACTIVE",
    },
  });

  const strategy1 = await prisma.strategy.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: "Liquidity Sweep + FVG",
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: "Liquidity Sweep + FVG",
      description: "Liquidity sweep followed by M15 FVG confirmation.",
      rules:
        "Identify liquidity sweep, confirm MSS, find FVG, wait for retest, then enter.",
      market: "Forex / Gold",
      timeframes: "1H / 15M",
    },
  });

  const strategy2 = await prisma.strategy.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: "Breakout Retest",
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: "Breakout Retest",
      description: "Trade confirmed breakouts after a retest.",
      rules:
        "Wait for confirmed breakout, identify retest, confirm candle close, then enter.",
      market: "Forex",
      timeframes: "1H / 15M",
    },
  });

  console.log("Demo strategies created.");

  await prisma.trade.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const trades = [
    {
      symbol: "XAUUSD",
      assetClass: "GOLD" as const,
      direction: "LONG" as const,
      status: "WIN" as const,
      entryDate: new Date("2026-09-01T09:00:00Z"),
      exitDate: new Date("2026-09-01T11:30:00Z"),
      session: "London",
      timeframe: "15M",
      entryPrice: 3450,
      stopLoss: 3440,
      takeProfit: 3480,
      exitPrice: 3480,
      riskPercent: 1,
      riskAmount: 100,
      positionSize: 1,
      rMultiple: 3,
      pnl: 300,
      fees: 5,
      netPnl: 295,
      strategyId: strategy1.id,
      setup: "Liquidity Sweep + FVG",
      marketCondition: "Bullish",
      emotionBefore: "Calm",
      emotionDuring: "Focused",
      emotionAfter: "Confident",
      confidence: 8,
      disciplineScore: 9,
      entryReason: "Sell-side liquidity sweep followed by bullish FVG.",
      exitReason: "Take profit reached.",
      mistake: null,
      lesson: "Wait for confirmation instead of entering early.",
      notes: "Clean London session setup.",
    },
    {
      symbol: "EURUSD",
      assetClass: "FOREX" as const,
      direction: "SHORT" as const,
      status: "LOSS" as const,
      entryDate: new Date("2026-09-02T14:00:00Z"),
      exitDate: new Date("2026-09-02T15:00:00Z"),
      session: "New York",
      timeframe: "15M",
      entryPrice: 1.175,
      stopLoss: 1.176,
      takeProfit: 1.172,
      exitPrice: 1.176,
      riskPercent: 1,
      riskAmount: 100,
      positionSize: 1,
      rMultiple: -1,
      pnl: -100,
      fees: 3,
      netPnl: -103,
      strategyId: strategy2.id,
      setup: "Breakout Retest",
      marketCondition: "Bearish",
      emotionBefore: "Impatient",
      emotionDuring: "Anxious",
      emotionAfter: "Frustrated",
      confidence: 5,
      disciplineScore: 5,
      entryReason: "Expected continuation after breakout.",
      exitReason: "Stop loss hit.",
      mistake: "Entered before proper retest confirmation.",
      lesson: "Do not chase breakout candles.",
      notes: "Need stronger confirmation.",
    },
    {
      symbol: "XAUUSD",
      assetClass: "GOLD" as const,
      direction: "LONG" as const,
      status: "WIN" as const,
      entryDate: new Date("2026-09-04T13:30:00Z"),
      exitDate: new Date("2026-09-04T16:00:00Z"),
      session: "New York",
      timeframe: "15M",
      entryPrice: 3460,
      stopLoss: 3450,
      takeProfit: 3490,
      exitPrice: 3490,
      riskPercent: 1,
      riskAmount: 100,
      positionSize: 1,
      rMultiple: 3,
      pnl: 300,
      fees: 5,
      netPnl: 295,
      strategyId: strategy1.id,
      setup: "Liquidity Sweep + FVG",
      marketCondition: "Bullish",
      emotionBefore: "Calm",
      emotionDuring: "Focused",
      emotionAfter: "Satisfied",
      confidence: 9,
      disciplineScore: 9,
      entryReason: "Liquidity sweep and confirmed bullish FVG retest.",
      exitReason: "Target reached.",
      mistake: null,
      lesson: "Patience improved execution.",
      notes: "High-quality setup.",
    },
    {
      symbol: "GBPUSD",
      assetClass: "FOREX" as const,
      direction: "SHORT" as const,
      status: "BREAKEVEN" as const,
      entryDate: new Date("2026-09-05T10:00:00Z"),
      exitDate: new Date("2026-09-05T12:00:00Z"),
      session: "London",
      timeframe: "15M",
      entryPrice: 1.35,
      stopLoss: 1.351,
      takeProfit: 1.347,
      exitPrice: 1.35,
      riskPercent: 1,
      riskAmount: 100,
      positionSize: 1,
      rMultiple: 0,
      pnl: 0,
      fees: 2,
      netPnl: -2,
      strategyId: strategy2.id,
      setup: "Breakout Retest",
      marketCondition: "Bearish",
      emotionBefore: "Calm",
      emotionDuring: "Neutral",
      emotionAfter: "Neutral",
      confidence: 7,
      disciplineScore: 8,
      entryReason: "Confirmed bearish retest.",
      exitReason: "Closed at breakeven.",
      mistake: null,
      lesson: "Protecting capital is part of trading.",
      notes: "Trade moved against entry before returning.",
    },
  ];

  for (const trade of trades) {
    await prisma.trade.create({
      data: {
        userId: user.id,
        ...trade,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      title: "Welcome to JournalX",
      message: "Your demo trading journal is ready.",
    },
  });

  console.log(`${trades.length} demo trades created.`);
  console.log("Demo notification created.");
  console.log("JournalX DEMO DATA seed completed successfully!");
  console.log("Demo email: demo@journalx.com");
  console.log("Demo password: Demo12345!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });