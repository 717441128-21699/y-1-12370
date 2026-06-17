import { create } from "zustand";
import type { SimAccount, SimTrade, BacktestResult } from "@/types";
import { mockSimAccount, mockBacktestResult } from "@/mock";

interface SimulationState {
  simAccount: SimAccount;
  trades: SimTrade[];
  backtestResults: BacktestResult[];
  currentBacktest: BacktestResult | null;
  isRunningBacktest: boolean;
  backtestProgress: number;
  startBacktest: (strategyName: string, startDate: string, endDate: string) => Promise<BacktestResult>;
  addTrade: (trade: Omit<SimTrade, "id">) => void;
  getCurrentBacktest: () => BacktestResult | null;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  simAccount: mockSimAccount,
  trades: [],
  backtestResults: [mockBacktestResult],
  currentBacktest: mockBacktestResult,
  isRunningBacktest: false,
  backtestProgress: 0,

  startBacktest: async (strategyName: string, startDate: string, endDate: string) => {
    set({ isRunningBacktest: true, backtestProgress: 0 });

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      set({ backtestProgress: i });
    }

    const result: BacktestResult = {
      ...mockBacktestResult,
      id: `bt${Date.now()}`,
      strategyName,
      startDate,
      endDate,
    };

    set((state) => ({
      isRunningBacktest: false,
      backtestProgress: 100,
      currentBacktest: result,
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
