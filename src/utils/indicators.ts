import { KLineData } from "@/types";

export const calculateMACD = (
  data: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { dif: (number | null)[]; dea: (number | null)[]; macd: (number | null)[] } => {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  const dif: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      dif.push(Number(((emaFast[i] as number) - (emaSlow[i] as number)).toFixed(4)));
    } else {
      dif.push(null);
    }
  }

  const validDif = dif.map((d) => (d === null ? 0 : d));
  const dea = calculateEMA(validDif, signalPeriod);

  const macd: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (dif[i] !== null && dea[i] !== null) {
      macd.push(Number((((dif[i] as number) - (dea[i] as number)) * 2).toFixed(4)));
    } else {
      macd.push(null);
    }
  }

  return { dif, dea, macd };
};

export const calculateRSI = (data: number[], period = 14): (number | null)[] => {
  const result: (number | null)[] = [];

  if (data.length < period + 1) {
    return Array(data.length).fill(null);
  }

  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
    } else if (i === period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
    } else {
      const change = changes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
    }
  }

  return result;
};

export const calculateKDJ = (
  high: number[],
  low: number[],
  close: number[],
  n = 9,
  m1 = 3,
  m2 = 3
): { k: (number | null)[]; d: (number | null)[]; j: (number | null)[] } => {
  const resultK: (number | null)[] = [];
  const resultD: (number | null)[] = [];
  const resultJ: (number | null)[] = [];

  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < close.length; i++) {
    if (i < n - 1) {
      resultK.push(null);
      resultD.push(null);
      resultJ.push(null);
    } else {
      const sliceHigh = high.slice(i - n + 1, i + 1);
      const sliceLow = low.slice(i - n + 1, i + 1);
      const highest = Math.max(...sliceHigh);
      const lowest = Math.min(...sliceLow);
      const range = highest - lowest;

      let rsv: number;
      if (range === 0) {
        rsv = 50;
      } else {
        rsv = ((close[i] - lowest) / range) * 100;
      }

      const k = (prevK * (m1 - 1) + rsv) / m1;
      const d = (prevD * (m2 - 1) + k) / m2;
      const j = 3 * k - 2 * d;

      resultK.push(Number(k.toFixed(2)));
      resultD.push(Number(d.toFixed(2)));
      resultJ.push(Number(j.toFixed(2)));

      prevK = k;
      prevD = d;
    }
  }

  return { k: resultK, d: resultD, j: resultJ };
};

export const enrichKLineData = (rawData: KLineData[]): KLineData[] => {
  const closes = rawData.map((d) => d.close);
  const highs = rawData.map((d) => d.high);
  const lows = rawData.map((d) => d.low);

  const ma5 = calculateMA(closes, 5);
  const ma10 = calculateMA(closes, 10);
  const ma20 = calculateMA(closes, 20);
  const ma60 = calculateMA(closes, 60);

  const { dif, dea, macd } = calculateMACD(closes);
  const rsi = calculateRSI(closes);
  const { k, d, j } = calculateKDJ(highs, lows, closes);

  return rawData.map((item, index) => ({
    ...item,
    ma5: ma5[index] ?? undefined,
    ma10: ma10[index] ?? undefined,
    ma20: ma20[index] ?? undefined,
    ma60: ma60[index] ?? undefined,
    dif: dif[index] ?? undefined,
    dea: dea[index] ?? undefined,
    macd: macd[index] ?? undefined,
    rsi: rsi[index] ?? undefined,
    kdj_k: k[index] ?? undefined,
    kdj_d: d[index] ?? undefined,
    kdj_j: j[index] ?? undefined,
  }));
};

function calculateEMA(data: number[], period: number): (number | null)[] {
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
}

function calculateMA(data: number[], period: number): (number | null)[] {
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
}
