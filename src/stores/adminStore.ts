import { create } from "zustand";
import type { AdminStats, MemberLevel } from "@/types";
import { mockAdminStats } from "@/mock";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "custom";

interface AdminState {
  stats: AdminStats;
  timeRange: TimeRange;
  loading: boolean;
  setTimeRange: (range: TimeRange) => void;
  getFilteredStats: () => {
    totalUsers: number;
    totalAssets: number;
    simTradeCount: number;
    adClickRate: number;
    newUsers: number;
    trendData: { date: string; users: number; assets: number; trades: number }[];
    memberDistribution: { level: MemberLevel; count: number }[];
  };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: mockAdminStats,
  timeRange: "30d",
  loading: false,

  setTimeRange: (range: TimeRange) => {
    set({ timeRange: range, loading: true });
    setTimeout(() => set({ loading: false }), 500);
  },

  getFilteredStats: () => {
    const { stats, timeRange } = get();

    const rangeMap: Record<TimeRange, number> = {
      today: 1,
      "7d": 7,
      "30d": 14,
      "90d": 14,
      custom: 14,
    };

    const days = rangeMap[timeRange];
    const trendData = stats.dailyTrend.slice(-days);

    const multiplier: Record<TimeRange, number> = {
      today: 0.1,
      "7d": 0.5,
      "30d": 1,
      "90d": 2,
      custom: 1,
    };

    const m = multiplier[timeRange];

    return {
      totalUsers: Math.floor(stats.totalUsers * m),
      totalAssets: Math.floor(stats.totalAssets * m),
      simTradeCount: Math.floor(stats.simTradeCount * m),
      adClickRate: stats.adClickRate + (Math.random() - 0.5) * 0.5,
      newUsers: Math.floor(stats.newUsersToday * days * m),
      trendData,
      memberDistribution: stats.membershipDistribution,
    };
  },
}));
