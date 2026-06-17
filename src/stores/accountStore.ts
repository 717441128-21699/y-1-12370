import { create } from "zustand";
import type { BrokerAccount, Holding, Transaction } from "@/types";
import { mockBrokerAccounts, mockHoldings, mockTransactions } from "@/mock";

interface AccountState {
  accounts: BrokerAccount[];
  selectedAccountId: string | null;
  holdings: Holding[];
  transactions: Transaction[];
  loading: boolean;
  selectAccount: (accountId: string) => void;
  getAccountHoldings: (accountId: string) => Holding[];
  getAccountTransactions: (accountId: string) => Transaction[];
  getTotalAssets: () => number;
  getTotalCash: () => number;
  getTotalProfit: () => number;
  getTotalProfitRate: () => number;
  getAccountById: (id: string) => BrokerAccount | undefined;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: mockBrokerAccounts,
  selectedAccountId: mockBrokerAccounts[0]?.id || null,
  holdings: mockHoldings,
  transactions: mockTransactions,
  loading: false,

  selectAccount: (accountId: string) => {
    set({ selectedAccountId: accountId });
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
