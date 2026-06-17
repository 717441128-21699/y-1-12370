export const calculateReturnRate = (current: number, initial: number): number => {
  if (initial === 0) return 0;
  return ((current - initial) / initial) * 100;
};

export const calculateSharpeRatio = (
  returns: number[],
  riskFreeRate = 0.03,
  periodsPerYear = 252
): number => {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  const dailyRiskFree = riskFreeRate / periodsPerYear;
  const sharpe = ((mean - dailyRiskFree) / stdDev) * Math.sqrt(periodsPerYear);

  return Number(sharpe.toFixed(2));
};

export const calculateMaxDrawdown = (equityCurve: number[]): number => {
  if (equityCurve.length < 2) return 0;

  let peak = equityCurve[0];
  let maxDrawdown = 0;

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return Number(maxDrawdown.toFixed(2));
};

export const calculateWinRate = (trades: { profit: number }[]): number => {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.profit > 0).length;
  return Number(((wins / trades.length) * 100).toFixed(2));
};

export const calculateProfitLossRatio = (trades: { profit: number }[]): number => {
  const profits = trades.filter((t) => t.profit > 0).map((t) => t.profit);
  const losses = trades.filter((t) => t.profit < 0).map((t) => Math.abs(t.profit));

  if (profits.length === 0 || losses.length === 0) return 0;

  const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

  if (avgLoss === 0) return 0;

  return Number((avgProfit / avgLoss).toFixed(2));
};

export const calculateMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      result.push(Number(avg.toFixed(2)));
    }
  }
  return result;
};

export const calculateEMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const slice = data.slice(0, period);
      ema = slice.reduce((a, b) => a + b, 0) / period;
      result.push(Number(ema.toFixed(2)));
    } else {
      ema = (data[i] - (ema || 0)) * multiplier + (ema || 0);
      result.push(Number(ema.toFixed(2)));
    }
  }
  return result;
};

export const generateRandomWalk = (
  startValue: number,
  steps: number,
  volatility = 0.02
): number[] => {
  const result: number[] = [startValue];
  let value = startValue;

  for (let i = 1; i < steps; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * value;
    value = Math.max(value + change, 0.01);
    result.push(Number(value.toFixed(2)));
  }

  return result;
};
