import { create } from "zustand";
import type { AdminStats, MemberLevel } from "@/types";
import { mockAdminStats } from "@/mock";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "custom";

export type MetricType = "users" | "assets" | "trades" | "adClick";

interface AdminState {
  stats: AdminStats;
  timeRange: TimeRange;
  loading: boolean;
  selectedMetric: MetricType | null;
  showMetricDetail: boolean;
  setTimeRange: (range: TimeRange) => void;
  setSelectedMetric: (metric: MetricType | null) => void;
  setShowMetricDetail: (show: boolean) => void;
  getFilteredStats: () => {
    totalUsers: number;
    totalAssets: number;
    simTradeCount: number;
    adClickRate: number;
    newUsers: number;
    trendData: { date: string; users: number; assets: number; trades: number; adClick?: number }[];
    memberDistribution: { level: MemberLevel; count: number }[];
  };
  getMetricTrendData: (metric: MetricType) => { date: string; value: number }[];
  getMetricInfo: (metric: MetricType) => { label: string; unit: string; color: string };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: mockAdminStats,
  timeRange: "30d",
  loading: false,
  selectedMetric: null,
  showMetricDetail: false,

  setTimeRange: (range: TimeRange) => {
    set({ timeRange: range, loading: true });
    setTimeout(() => set({ loading: false }), 500);
  },

  setSelectedMetric: (metric) => {
    set({ selectedMetric: metric });
  },

  setShowMetricDetail: (show) => {
    set({ showMetricDetail: show });
  },

  getMetricInfo: (metric) => {
    const infoMap: Record<MetricType, { label: string; unit: string; color: string }> = {
      users: { label: "注册用户数", unit: "人", color: "#D4AF37" },
      assets: { label: "绑定资产", unit: "元", color: "#3B82F6" },
      trades: { label: "模拟交易活跃度", unit: "次", color: "#10B981" },
      adClick: { label: "广告点击率", unit: "%", color: "#F59E0B" },
    };
    return infoMap[metric];
  },

  getMetricTrendData: (metric) => {
    const { getFilteredStats } = get();
    const stats = getFilteredStats();

    const metricMap: Record<MetricType, keyof typeof stats.trendData[0]> = {
      users: "users",
      assets: "assets",
      trades: "trades",
      adClick: "adClick",
    };

    const key = metricMap[metric];
    return stats.trendData.map((d) => ({
      date: d.date,
      value: (d as any)[key] || 0,
    }));
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
