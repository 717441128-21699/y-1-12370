import { create } from "zustand";
import type { StockQuote, WatchlistStock, News, Alert, KLineData } from "@/types";
import { mockStockQuotes, mockWatchlist, mockNews, mockAlerts, getKLineData } from "@/mock";

interface MarketState {
  quotes: StockQuote[];
  watchlist: WatchlistStock[];
  news: News[];
  alerts: Alert[];
  klineData: Record<string, KLineData[]>;
  selectedSymbol: string;
  alertThreshold: number;
  triggeredAlerts: Alert[];
  setSelectedSymbol: (symbol: string) => void;
  setAlertThreshold: (threshold: number) => void;
  getWatchlistQuotes: () => (StockQuote & { groupName: string })[];
  getKLineData: (symbol: string) => KLineData[];
  getQuoteBySymbol: (symbol: string) => StockQuote | undefined;
  toggleAlert: (alertId: string) => void;
  addAlert: (alert: Omit<Alert, "id">) => void;
  checkPriceAlerts: () => Alert[];
  getAnomalyStocks: () => StockQuote[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: mockStockQuotes,
  watchlist: mockWatchlist,
  news: mockNews,
  alerts: mockAlerts,
  klineData: {},
  selectedSymbol: "600519",
  alertThreshold: 3,
  triggeredAlerts: [],

  setSelectedSymbol: (symbol: string) => {
    set({ selectedSymbol: symbol });
  },

  setAlertThreshold: (threshold: number) => {
    set({ alertThreshold: threshold });
  },

  getWatchlistQuotes: () => {
    const { watchlist, quotes } = get();
    return watchlist
      .map((w) => {
        const quote = quotes.find((q) => q.symbol === w.symbol);
        if (quote) {
          return { ...quote, groupName: w.groupName };
        }
        return null;
      })
      .filter(Boolean) as (StockQuote & { groupName: string })[];
  },

  getKLineData: (symbol: string) => {
    const { klineData } = get();
    if (klineData[symbol]) {
      return klineData[symbol];
    }
    const data = getKLineData(symbol);
    set((state) => ({
      klineData: { ...state.klineData, [symbol]: data },
    }));
    return data;
  },

  getQuoteBySymbol: (symbol: string) => {
    return get().quotes.find((q) => q.symbol === symbol);
  },

  toggleAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, enabled: !a.enabled } : a
      ),
    }));
  },

  addAlert: (alert: Omit<Alert, "id">) => {
    const newAlert: Alert = {
      ...alert,
      id: `al${Date.now()}`,
    };
    set((state) => ({
      alerts: [...state.alerts, newAlert],
    }));
  },

  checkPriceAlerts: () => {
    const { alerts, quotes, alertThreshold } = get();
    const triggered: Alert[] = [];

    alerts
      .filter((a) => a.enabled)
      .forEach((alert) => {
        const quote = quotes.find((q) => q.symbol === alert.symbol);
        if (!quote) return;

        let isTriggered = false;
        switch (alert.alertType) {
          case "percent_up":
            isTriggered = quote.changePercent >= alertThreshold;
            break;
          case "percent_down":
            isTriggered = quote.changePercent <= -alertThreshold;
            break;
          case "price_up":
            isTriggered = quote.price >= alert.threshold;
            break;
          case "price_down":
            isTriggered = quote.price <= alert.threshold;
            break;
        }

        if (isTriggered) {
          triggered.push({ ...alert, triggeredAt: new Date().toISOString() });
        }
      });

    const uniqueTriggered = triggered.filter(
      (alert, index, self) =>
        index === self.findIndex((a) => a.symbol === alert.symbol && a.alertType === alert.alertType)
    );

    set({ triggeredAlerts: uniqueTriggered });
    return uniqueTriggered;
  },

  getAnomalyStocks: () => {
    const { quotes, alertThreshold } = get();
    return quotes.filter(
      (q) => Math.abs(q.changePercent) >= alertThreshold
    );
  },
}));
