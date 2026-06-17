import { create } from "zustand";
import type { MonthlyReport } from "@/types";
import { mockMonthlyReports } from "@/mock";

interface ReportState {
  reports: MonthlyReport[];
  selectedReport: MonthlyReport | null;
  loading: boolean;
  monthlyReports: MonthlyReport[];
  selectedHoldingSymbol: string | null;
  showHoldingDetail: boolean;
  selectReport: (month: string) => void;
  getMonthlyReport: (month: string) => MonthlyReport | undefined;
  generateReport: (month: string) => Promise<MonthlyReport>;
  exportReport: (month: string, format: "pdf" | "excel") => Promise<boolean>;
  setSelectedHolding: (symbol: string | null) => void;
  setShowHoldingDetail: (show: boolean) => void;
  getTradesBySymbol: (symbol: string) => MonthlyReport["tradeHistory"];
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: mockMonthlyReports,
  monthlyReports: mockMonthlyReports,
  selectedReport: mockMonthlyReports[0],
  loading: false,
  selectedHoldingSymbol: null,
  showHoldingDetail: false,

  selectReport: (month: string) => {
    const report = get().reports.find((r) => r.month === month);
    set({ selectedReport: report || null, selectedHoldingSymbol: null, showHoldingDetail: false });
  },

  setSelectedHolding: (symbol) => {
    set({ selectedHoldingSymbol: symbol });
  },

  setShowHoldingDetail: (show) => {
    set({ showHoldingDetail: show });
  },

  getTradesBySymbol: (symbol) => {
    const report = get().selectedReport;
    if (!report) return [];
    return report.tradeHistory.filter((t) => t.symbol === symbol);
  },

  getMonthlyReport: (month: string) => {
    return get().reports.find((r) => r.month === month);
  },

  generateReport: async (month: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const template = get().reports[0];
    const newReport: MonthlyReport = {
      ...template,
      month,
      status: "ready",
      netProfit: template.netProfit * (0.8 + Math.random() * 0.4),
      profitRate: template.profitRate * (0.8 + Math.random() * 0.4),
    };

    set((state) => ({
      loading: false,
      reports: [newReport, ...state.reports],
      selectedReport: newReport,
    }));

    return newReport;
  },

  exportReport: async (month: string, format: "pdf" | "excel") => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ loading: false });

    const report = get().reports.find((r) => r.month === month);
    if (report) {
      const dataStr = JSON.stringify(report, null, 2);
      const blob = new Blob([dataStr], {
        type: format === "pdf" ? "application/pdf" : "application/vnd.ms-excel",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `投资报告_${month}.${format === "pdf" ? "json" : "csv"}`;
      link.click();
      URL.revokeObjectURL(url);
    }

    return true;
  },
}));
