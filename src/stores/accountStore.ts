import { create } from "zustand";
import type { BrokerAccount, Holding, Transaction } from "@/types";
import { mockBrokerAccounts, mockHoldings, mockTransactions } from "@/mock";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface AccountState {
  accounts: BrokerAccount[];
  selectedAccountId: string | null;
  holdings: Holding[];
  transactions: Transaction[];
  loading: boolean;
  syncStatus: SyncStatus;
  syncProgress: number;
  lastSyncTime: string | null;
  selectAccount: (accountId: string) => void;
  getAccountHoldings: (accountId: string) => Holding[];
  getAccountTransactions: (accountId: string) => Transaction[];
  getTotalAssets: () => number;
  getTotalCash: () => number;
  getTotalProfit: () => number;
  getTotalProfitRate: () => number;
  getAccountById: (id: string) => BrokerAccount | undefined;
  syncAccountData: (accountId?: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: mockBrokerAccounts,
  selectedAccountId: mockBrokerAccounts[0]?.id || null,
  holdings: mockHoldings,
  transactions: mockTransactions,
  loading: false,
  syncStatus: "idle",
  syncProgress: 0,
  lastSyncTime: null,

  selectAccount: (accountId: string) => {
    set({ selectedAccountId: accountId });
  },

  syncAccountData: async (accountId?: string) => {
    set({ syncStatus: "syncing", syncProgress: 0 });

    const steps = [
      { progress: 20, label: "连接券商服务器" },
      { progress: 40, label: "获取账户信息" },
      { progress: 60, label: "同步持仓数据" },
      { progress: 80, label: "同步交易记录" },
      { progress: 100, label: "完成同步" },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set({ syncProgress: step.progress });
    }

    const fluctuation = () => 1 + (Math.random() - 0.5) * 0.05;

    const updatedAccounts = get().accounts.map((acc) => {
      if (accountId && acc.id !== accountId) return acc;
      const fluct = fluctuation();
      return {
        ...acc,
        totalAssets: Math.floor(acc.totalAssets * fluct),
        cashBalance: Math.floor(acc.cashBalance * fluct),
        marketValue: Math.floor(acc.marketValue * fluct),
        totalProfit: Math.floor(acc.totalProfit * fluct),
        totalProfitRate: acc.totalProfitRate + (Math.random() - 0.5) * 2,
        status: "active" as const,
      };
    });

    const updatedHoldings = get().holdings.map((h) => {
      if (accountId && h.accountId !== accountId) return h;
      const fluct = fluctuation();
      const newPrice = h.currentPrice * fluct;
      const profit = (newPrice - h.costPrice) * h.quantity;
      return {
        ...h,
        currentPrice: parseFloat(newPrice.toFixed(2)),
        marketValue: Math.floor(h.quantity * newPrice),
        profit: Math.floor(profit),
        profitRate: parseFloat(((profit / (h.costPrice * h.quantity)) * 100).toFixed(2)),
      };
    });

    set({
      accounts: updatedAccounts,
      holdings: updatedHoldings,
      syncStatus: "success",
      lastSyncTime: new Date().toISOString(),
    });

    setTimeout(() => set({ syncStatus: "idle" }), 2000);
  },

  getAccountHoldings: (accountId: string) => {
    return get().holdings.filter((h) => h.accountId === accountId);
  },

  getAccountTransactions: (accountId: string) => {
    return get()
      .transactions.filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.tradeAt).getTime() - new Date(a.tradeAt).getTime());
  },

  getTotalAssets: () => {
    return get().accounts.reduce((sum, acc) => sum + acc.totalAssets, 0);
  },

  getTotalCash: () => {
    return get().accounts.reduce((sum, acc) => sum + acc.cashBalance, 0);
  },

  getTotalProfit: () => {
    return get().accounts.reduce((sum, acc) => sum + acc.totalProfit, 0);
  },

  getTotalProfitRate: () => {
    const totalAssets = get().getTotalAssets();
    const totalCost = totalAssets - get().getTotalProfit();
    if (totalCost === 0) return 0;
    return (get().getTotalProfit() / totalCost) * 100;
  },

  getAccountById: (id: string) => {
    return get().accounts.find((acc) => acc.id === id);
  },
}));
