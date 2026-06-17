import { create } from "zustand";
import type { StockQuote, WatchlistStock, News, Alert, KLineData } from "@/types";
import { mockStockQuotes, mockWatchlist, mockNews, mockAlerts, getKLineData } from "@/mock";
import { storage } from "@/utils/storage";

interface MarketState {
  quotes: StockQuote[];
  watchlist: WatchlistStock[];
  news: News[];
  alerts: Alert[];
  klineData: Record<string, KLineData[]>;
  selectedSymbol: string;
  alertThreshold: number;
  triggeredAlerts: Alert[];
  alertHistory: Alert[];
  loading: boolean;
  setSelectedSymbol: (symbol: string) => void;
  setAlertThreshold: (threshold: number) => void;
  getWatchlistQuotes: () => (StockQuote & { groupName: string })[];
  getKLineData: (symbol: string) => KLineData[];
  getQuoteBySymbol: (symbol: string) => StockQuote | undefined;
  toggleAlert: (alertId: string) => void;
  addAlert: (alert: Omit<Alert, "id">) => void;
  checkPriceAlerts: () => Alert[];
  getAnomalyStocks: () => StockQuote[];
  clearAlertHistory: () => void;
  refreshMarketData: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: mockStockQuotes,
  watchlist: mockWatchlist,
  news: mockNews,
  alerts: mockAlerts,
  klineData: {},
  selectedSymbol: "600519",
  alertThreshold: storage.get<number>("alertThreshold", 3),
  triggeredAlerts: [],
  alertHistory: storage.get<Alert[]>("alertHistory", []),
  loading: false,

  setSelectedSymbol: (symbol) => {
    set({ selectedSymbol: symbol });
  },

  setAlertThreshold: (threshold) => {
    set({ alertThreshold: threshold });
    storage.set("alertThreshold", threshold);
    get().checkPriceAlerts();
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
    const { watchlist, quotes, alertThreshold, alertHistory } = get();
    const triggered: Alert[] = [];

    const watchlistSymbols = watchlist.map((w) => w.symbol);

    watchlistSymbols.forEach((symbol) => {
      const quote = quotes.find((q) => q.symbol === symbol);
      if (!quote) return;

      if (quote.changePercent >= alertThreshold) {
        triggered.push({
          id: `al_${symbol}_up_${Date.now()}`,
          symbol,
          stockName: quote.name,
          alertType: "percent_up" as const,
          threshold: alertThreshold,
          currentPrice: quote.price,
          changePercent: quote.changePercent,
          enabled: true,
          triggeredAt: new Date().toISOString(),
        });
      }
      if (quote.changePercent <= -alertThreshold) {
        triggered.push({
          id: `al_${symbol}_down_${Date.now()}`,
          symbol,
          stockName: quote.name,
          alertType: "percent_down" as const,
          threshold: alertThreshold,
          currentPrice: quote.price,
          changePercent: quote.changePercent,
          enabled: true,
          triggeredAt: new Date().toISOString(),
        });
      }
    });

    if (triggered.length > 0) {
      const newHistory = [...triggered, ...alertHistory].slice(0, 50);
      set({ alertHistory: newHistory });
      storage.set("alertHistory", newHistory);
    }

    set({ triggeredAlerts: triggered });
    return triggered;
  },

  getAnomalyStocks: () => {
    const { quotes, alertThreshold } = get();
    return quotes.filter(
      (q) => Math.abs(q.changePercent) >= alertThreshold
    );
  },

  clearAlertHistory: () => {
    set({ alertHistory: [] });
    storage.set("alertHistory", []);
  },

  refreshMarketData: () => {
    set({ loading: true });
    const { quotes } = get();
    const updatedQuotes = quotes.map((q) => {
      const change = (Math.random() - 0.5) * 4;
      const newPrice = q.price * (1 + change / 100);
      return {
        ...q,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat((newPrice - q.prevClose).toFixed(2)),
        changePercent: parseFloat(change.toFixed(2)),
        high: parseFloat((newPrice * (1 + Math.random() * 0.02)).toFixed(2)),
        low: parseFloat((newPrice * (1 - Math.random() * 0.02)).toFixed(2)),
        volume: Math.floor(q.volume * (0.9 + Math.random() * 0.2)),
        amount: Math.floor(q.amount * (0.9 + Math.random() * 0.2)),
      };
    });
    set({ quotes: updatedQuotes });
    get().checkPriceAlerts();
    setTimeout(() => set({ loading: false }), 500);
  },
}));
