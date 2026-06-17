import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import PageContainer from "@/components/layout/PageContainer";
import { useAdminStore } from "@/stores/adminStore";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  RefreshCw,
  Activity,
  Crown,
} from "lucide-react";
import { formatMoney, formatPercent, formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { MemberLevel } from "@/types";
import type { TimeRange } from "@/stores/adminStore";

export default function AdminPage() {
  const { stats, timeRange, loading, setTimeRange, getFilteredStats } =
    useAdminStore();
  const filteredStats = useMemo(() => getFilteredStats(), [getFilteredStats, timeRange]);

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: "today", label: "今天" },
    { key: "7d", label: "近7天" },
    { key: "30d", label: "近30天" },
    { key: "90d", label: "近90天" },
  ];

  const memberColors: Record<MemberLevel, string> = {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#D4AF37",
    platinum: "#E5E4E2",
    diamond: "#B9F2FF",
  };

  const memberLabels: Record<MemberLevel, string> = {
    bronze: "青铜",
    silver: "白银",
    gold: "黄金",
    platinum: "铂金",
    diamond: "钻石",
  };

  const statsCards = [
    {
      label: "注册用户数",
      value: formatNumber(filteredStats.totalUsers),
      icon: Users,
      color: "text-gold-400",
      bgColor: "bg-gold-500/10",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      label: "绑定资产",
      value: formatMoney(filteredStats.totalAssets),
      icon: DollarSign,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: "+8.3%",
      trendUp: true,
    },
    {
      label: "模拟交易活跃度",
      value: formatNumber(filteredStats.simTradeCount),
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      trend: "+15.2%",
      trendUp: true,
    },
    {
      label: "广告点击率",
      value: formatPercent(filteredStats.adClickRate, 2, false),
      icon: MousePointerClick,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      trend: "-0.3%",
      trendUp: false,
    },
  ];

  const trendOption = {
    backgroundColor: "transparent",
    animation: true,
    grid: {
      left: "60px",
      right: "20px",
      top: "40px",
      bottom: "30px",
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#334155",
      textStyle: { color: "#E2E8F0", fontSize: 12 },
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["注册用户", "绑定资产", "模拟交易"],
      textStyle: { color: "#94A3B8", fontSize: 11 },
      top: 0,
      right: 0,
    },
    xAxis: {
      type: "category",
      data: filteredStats.trendData.map((d) => d.date),
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#94A3B8", fontSize: 10 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: "value",
        position: "left",
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 10,
          formatter: (v: number) => formatNumber(v),
        },
        splitLine: { lineStyle: { color: "#1E293B" } },
      },
      {
        type: "value",
        position: "right",
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 10,
          formatter: (v: number) => formatMoney(v),
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "注册用户",
        type: "line",
        data: filteredStats.trendData.map((d) => d.users),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#D4AF37", width: 2 },
        itemStyle: { color: "#D4AF37" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(212, 175, 55, 0.3)" },
              { offset: 1, color: "rgba(212, 175, 55, 0)" },
            ],
          },
        },
      },
      {
        name: "绑定资产",
        type: "line",
        yAxisIndex: 1,
        data: filteredStats.trendData.map((d) => d.assets),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#60A5FA", width: 2 },
        itemStyle: { color: "#60A5FA" },
      },
      {
        name: "模拟交易",
        type: "bar",
        data: filteredStats.trendData.map((d) => d.trades),
        itemStyle: {
          color: "rgba(16, 185, 129, 0.6)",
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 12,
      },
    ],
  };

  const memberDistributionOption = {
    backgroundColor: "transparent",
    animation: true,
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#334155",
      textStyle: { color: "#E2E8F0", fontSize: 12 },
      formatter: (params: any) => {
        return `<div style="padding: 4px;"><strong>${memberLabels[params.name as MemberLevel]}</strong><br/>用户数: ${formatNumber(
          params.value
        )}<br/>占比: ${params.percent}%</div>`;
      },
    },
    legend: {
      orient: "vertical",
      right: "5%",
      top: "center",
      textStyle: { color: "#94A3B8", fontSize: 11 },
      formatter: (name: string) => memberLabels[name as MemberLevel],
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#0F172A",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
            formatter: (params: any) =>
              `${memberLabels[params.name as MemberLevel]}\n${params.percent}%`,
          },
        },
        labelLine: {
          show: false,
        },
        data: filteredStats.memberDistribution.map((item) => ({
          value: item.count,
          name: item.level,
          itemStyle: {
            color: memberColors[item.level],
          },
        })),
      },
    ],
  };

  return (
    <PageContainer
      title="管理员看板"
      subtitle="平台运营数据概览，实时监控核心指标"
      action={
        <button
          onClick={() => setTimeRange(timeRange)}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          刷新数据
        </button>
      }
    >
      <div className="space-y-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-400" />
              <span className="text-sm font-medium text-navy-300">
                时间筛选
              </span>
            </div>
            <div className="flex gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    timeRange === range.key
                      ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                      : "bg-navy-800/50 text-navy-400 hover:text-navy-200 border border-navy-700"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass-card p-5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      stat.bgColor
                    )}
                  >
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                      stat.trendUp
                        ? "bg-profit/10 text-profit"
                        : "bg-loss/10 text-loss"
                    )}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs text-navy-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold font-mono text-navy-100">
                  {loading ? "--" : stat.value}
                </p>
                {stat.label === "注册用户数" && (
                  <p className="text-xs text-navy-500 mt-2">
                    新增用户:{" "}
                    <span className="text-profit font-mono">
                      +{formatNumber(filteredStats.newUsers)}
                    </span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-6">
            <LineChart className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif font-semibold text-navy-100">
              核心指标趋势
            </h3>
          </div>
          <div className="h-[400px]">
            <ReactECharts
              option={trendOption}
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "canvas" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif font-semibold text-navy-100">
                会员分布
              </h3>
            </div>
            <div className="h-[300px]">
              <ReactECharts
                option={memberDistributionOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif font-semibold text-navy-100">
                快速统计
              </h3>
            </div>
            <div className="space-y-4">
              {filteredStats.memberDistribution.map((item, index) => {
                const total = filteredStats.memberDistribution.reduce(
                  (sum, i) => sum + i.count,
                  0
                );
                const percent = (item.count / total) * 100;
                return (
                  <div key={item.level}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: memberColors[item.level] }}
                        />
                        <span className="text-sm text-navy-300">
                          {memberLabels[item.level]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono text-navy-200">
                          {formatNumber(item.count)}
                        </span>
                        <span className="text-xs text-navy-500 ml-2">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: memberColors[item.level],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-navy-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-navy-800/50">
                  <p className="text-xs text-navy-500 mb-1">总用户数</p>
                  <p className="text-xl font-bold font-mono text-navy-100">
                    {formatNumber(stats.totalUsers)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-navy-800/50">
                  <p className="text-xs text-navy-500 mb-1">活跃用户</p>
                  <p className="text-xl font-bold font-mono text-profit">
                    {formatNumber(stats.activeUsers)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-navy-800/50">
                  <p className="text-xs text-navy-500 mb-1">绑定账户数</p>
                  <p className="text-xl font-bold font-mono text-blue-400">
                    {formatNumber(stats.boundAccounts)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-navy-800/50">
                  <p className="text-xs text-navy-500 mb-1">总资产规模</p>
                  <p className="text-xl font-bold font-mono text-gold-400">
                    {formatMoney(stats.totalAssets)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
