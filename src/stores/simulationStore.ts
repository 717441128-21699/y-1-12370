import { create } from "zustand";
import type { SimAccount, SimTrade, BacktestResult } from "@/types";
import { mockSimAccount, mockBacktestResult } from "@/mock";
import { storage } from "@/utils/storage";

export interface StrategyParams {
  shortPeriod: number;
  longPeriod: number;
  signalPeriod: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
}

interface SimulationState {
  simAccount: SimAccount;
  trades: SimTrade[];
  backtestResults: BacktestResult[];
  currentBacktest: BacktestResult | null;
  selectedBacktestId: string | null;
  compareBacktestId: string | null;
  isRunningBacktest: boolean;
  backtestProgress: number;
  strategyParams: StrategyParams;
  startBacktest: (strategyName: string, startDate: string, endDate: string, params?: Partial<StrategyParams>) => Promise<BacktestResult>;
  addTrade: (trade: Omit<SimTrade, "id">) => void;
  getCurrentBacktest: () => BacktestResult | null;
  setStrategyParams: (params: Partial<StrategyParams>) => void;
  setSelectedBacktest: (id: string | null) => void;
  setCompareBacktest: (id: string | null) => void;
  getBacktestById: (id: string) => BacktestResult | undefined;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  simAccount: mockSimAccount,
  trades: [],
  backtestResults: [mockBacktestResult],
  currentBacktest: mockBacktestResult,
  selectedBacktestId: mockBacktestResult.id,
  compareBacktestId: null,
  isRunningBacktest: false,
  backtestProgress: 0,
  strategyParams: storage.get("strategyParams", {
    shortPeriod: 5,
    longPeriod: 20,
    signalPeriod: 9,
    stopLoss: 5,
    takeProfit: 15,
    positionSize: 30,
  }),

  setStrategyParams: (params) => {
    set((state) => {
      const newParams = { ...state.strategyParams, ...params };
      storage.set("strategyParams", newParams);
      return { strategyParams: newParams };
    });
  },

  setSelectedBacktest: (id) => {
    set({ selectedBacktestId: id });
    if (id) {
      const result = get().backtestResults.find((r) => r.id === id);
      if (result) set({ currentBacktest: result });
    }
  },

  setCompareBacktest: (id) => {
    set({ compareBacktestId: id });
  },

  getBacktestById: (id) => {
    return get().backtestResults.find((r) => r.id === id);
  },

  startBacktest: async (strategyName: string, startDate: string, endDate: string, params?) => {
    set({ isRunningBacktest: true, backtestProgress: 0 });

    const strategyParams = { ...get().strategyParams, ...params };

    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      set({ backtestProgress: i });
    }

    const paramFactor = (strategyParams.shortPeriod / 5) * 0.8 + (strategyParams.longPeriod / 20) * 0.2;
    const baseReturn = mockBacktestResult.returnRate * paramFactor;
    const baseSharpe = mockBacktestResult.sharpeRatio * (1 + (strategyParams.shortPeriod - 5) / 50);
    const baseDrawdown = mockBacktestResult.maxDrawdown * (1 + (strategyParams.longPeriod - 20) / 100);

    const result: BacktestResult = {
      ...mockBacktestResult,
      id: `bt${Date.now()}`,
      strategyName,
      startDate,
      endDate,
      returnRate: parseFloat((baseReturn * (0.9 + Math.random() * 0.2)).toFixed(2)),
      annualReturnRate: parseFloat((baseReturn * (0.9 + Math.random() * 0.2)).toFixed(2)),
      sharpeRatio: parseFloat((baseSharpe * (0.9 + Math.random() * 0.2)).toFixed(2)),
      maxDrawdown: parseFloat((baseDrawdown * (0.9 + Math.random() * 0.2)).toFixed(2)),
      totalTrades: Math.floor(mockBacktestResult.totalTrades * (20 / strategyParams.longPeriod)),
      profitTrades: Math.floor(mockBacktestResult.profitTrades * (20 / strategyParams.longPeriod) * 0.6),
      lossTrades: Math.floor(mockBacktestResult.lossTrades * (20 / strategyParams.longPeriod) * 0.4),
      winRate: parseFloat(((mockBacktestResult.winRate || 50) + (Math.random() - 0.5) * 10).toFixed(2)),
      profitLossRatio: parseFloat((mockBacktestResult.profitLossRatio * (0.9 + Math.random() * 0.2)).toFixed(2)),
      strategyParams: strategyParams,
    };

    set((state) => ({
      isRunningBacktest: false,
      backtestProgress: 100,
      currentBacktest: result,
      selectedBacktestId: result.id,
      backtestResults: [result, ...state.backtestResults],
    }));

    return result;
  },

  addTrade: (trade: Omit<SimTrade, "id">) => {
    const newTrade: SimTrade = {
      ...trade,
      id: `st${Date.now()}`,
    };

    set((state) => {
      const account = { ...state.simAccount };
      if (trade.type === "buy") {
        account.availableCash -= trade.amount;
        account.holdingValue += trade.amount;
      } else {
        account.availableCash += trade.amount;
        account.holdingValue -= trade.amount;
      }
      account.currentNetValue = account.availableCash + account.holdingValue;
      account.totalReturn = account.currentNetValue - account.initialCapital;
      account.totalReturnRate =
        ((account.currentNetValue - account.initialCapital) / account.initialCapital) * 100;

      return {
        trades: [newTrade, ...state.trades],
        simAccount: account,
      };
    });
  },

  getCurrentBacktest: () => {
    return get().currentBacktest;
  },
}));
