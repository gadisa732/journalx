export type TradeCalculationInput = {
  direction: "LONG" | "SHORT";
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  exitPrice?: number;
  fees?: number;
  positionSize?: number;
};

export type TradeCalculationResult = {
  riskPerUnit: number;
  rewardPerUnit: number | null;
  riskRewardRatio: number | null;
  initialRisk: number | null;
  pnl: number | null;
  fees: number;
  netPnl: number | null;
  rMultiple: number | null;
  status: "OPEN" | "WIN" | "LOSS" | "BREAKEVEN";
};

export function calculateTrade(
  input: TradeCalculationInput,
): TradeCalculationResult {
  const {
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
    exitPrice,
    fees = 0,
    positionSize,
  } = input;

  const riskPerUnit =
    direction === "LONG"
      ? entryPrice - stopLoss
      : stopLoss - entryPrice;

  const rewardPerUnit =
    takeProfit === undefined
      ? null
      : direction === "LONG"
        ? takeProfit - entryPrice
        : entryPrice - takeProfit;

  const riskRewardRatio =
    rewardPerUnit !== null && riskPerUnit > 0
      ? rewardPerUnit / riskPerUnit
      : null;

  const initialRisk =
    positionSize !== undefined && riskPerUnit > 0
      ? riskPerUnit * positionSize
      : null;

  let pnl: number | null = null;
  let netPnl: number | null = null;
  let rMultiple: number | null = null;

  let status: TradeCalculationResult["status"] = "OPEN";

  if (exitPrice !== undefined && positionSize !== undefined) {
    pnl =
      direction === "LONG"
        ? (exitPrice - entryPrice) * positionSize
        : (entryPrice - exitPrice) * positionSize;

    netPnl = pnl - fees;

    if (netPnl > 0) {
      status = "WIN";
    } else if (netPnl < 0) {
      status = "LOSS";
    } else {
      status = "BREAKEVEN";
    }

    if (initialRisk !== null && initialRisk > 0) {
      rMultiple = netPnl / initialRisk;
    }
  }

  return {
    riskPerUnit,
    rewardPerUnit,
    riskRewardRatio,
    initialRisk,
    pnl,
    fees,
    netPnl,
    rMultiple,
    status,
  };
}