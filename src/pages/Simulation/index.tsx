import { useState } from "react";
import ReactECharts from "echarts-for-react";
import PageContainer from "@/components/layout/PageContainer";
import { useSimulationStore } from "@/stores/simulationStore";
import {
  Play,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BarChart3,
  LineChart,
  RefreshCw,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { formatMoney, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function SimulationPage() {
  const {
    simAccount,
    backtestResults,
    currentBacktest,
    isRunningBacktest,
    backtestProgress,
    startBacktest,
  } = useSimulationStore();

  const [showBacktestModal, setShowBacktestModal] = useState(false);
  const [strategyName, setStrategyName] = useState("双均线策略");
  const [startDate, setStartDate] = useState("2024-06-01");
  const [endDate, setEndDate] = useState("2025-06-01");

  const handleStartBacktest = async () => {
    await startBacktest(strategyName, startDate, endDate);
    setShowBacktestModal(false);
  };

  const equityCurveOption = currentBacktest
    ? {
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
          formatter: (params: any) => {
            if (!params || params.length === 0) return "";
            let html = `<div style="padding: 8px;">`;
            html += `<div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px;">${params[0].axisValue}</div>`;
            params.forEach((p: any) => {
              const color = p.seriesName === "策略净值" ? "#D4AF37" : "#64748B";
              html += `<div style="font-size: 12px; margin-bottom: 4px;"><span style="color: ${color};">${p.seriesName}: ${formatMoney(p.value)}</span></div>`;
            });
            html += `</div>`;
            return html;
          },
        },
        legend: {
          data: ["策略净值", "基准净值"],
          textStyle: { color: "#94A3B8", fontSize: 11 },
          top: 0,
          right: 0,
        },
        xAxis: {
          type: "category",
          data: currentBacktest.equityCurve.map((d) => d.date),
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: { color: "#94A3B8", fontSize: 10 },
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          scale: true,
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: {
            color: "#94A3B8",
            fontSize: 10,
            formatter: (v: number) => formatMoney(v),
          },
          splitLine: { lineStyle: { color: "#1E293B" } },
        },
        series: [
          {
            name: "策略净值",
            type: "line",
            data: currentBacktest.equityCurve.map((d) => d.value),
            smooth: true,
            symbol: "none",
            lineStyle: { color: "#D4AF37", width: 2 },
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
            name: "基准净值",
            type: "line",
            data: currentBacktest.benchmarkCurve.map((d) => d.value),
            smooth: true,
            symbol: "none",
            lineStyle: { color: "#64748B", width: 1.5, type: "dashed" },
          },
        ],
      }
    : null;

  const statsCards = currentBacktest
    ? [
        {
          label: "总收益率",
          value: formatPercent(currentBacktest.returnRate),
          icon: Percent,
          color: "text-profit",
          bgColor: "bg-profit/10",
          valueColor:
            currentBacktest.returnRate >= 0 ? "text-profit" : "text-loss",
        },
        {
          label: "年化收益率",
          value: formatPercent(currentBacktest.annualReturnRate),
          icon: TrendingUp,
          color: "text-gold-400",
          bgColor: "bg-gold-500/10",
          valueColor:
            currentBacktest.annualReturnRate >= 0 ? "text-profit" : "text-loss",
        },
        {
          label: "夏普比率",
          value: currentBacktest.sharpeRatio.toFixed(2),
          icon: Target,
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          valueColor: "text-navy-100",
        },
        {
          label: "最大回撤",
          value: formatPercent(currentBacktest.maxDrawdown),
          icon: TrendingDown,
          color: "text-loss",
          bgColor: "bg-loss/10",
          valueColor: "text-loss",
        },
      ]
    : [];

  const tradeStats = currentBacktest
    ? [
        {
          label: "总交易次数",
          value: currentBacktest.totalTrades,
          icon: BarChart3,
          color: "text-navy-300",
        },
        {
          label: "盈利交易",
          value: currentBacktest.profitTrades,
          icon: CheckCircle2,
          color: "text-profit",
        },
        {
          label: "亏损交易",
          value: currentBacktest.lossTrades,
          icon: XCircle,
          color: "text-loss",
        },
        {
          label: "胜率",
          value: formatPercent(currentBacktest.winRate, 2, false),
          icon: Award,
          color: "text-gold-400",
        },
        {
          label: "盈亏比",
          value: currentBacktest.profitLossRatio.toFixed(2),
          icon: DollarSign,
          color: "text-blue-400",
        },
      ]
    : [];

  return (
    <PageContainer
      title="模拟交易"
      subtitle="策略回测与模拟交易，验证您的投资策略"
      action={
        <button
          onClick={() => setShowBacktestModal(true)}
          disabled={isRunningBacktest}
          className="btn-primary flex items-center gap-2"
        >
          {isRunningBacktest ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              回测中...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              开始回测
            </>
          )}
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-xs text-navy-500">初始资金</p>
                <p className="text-xl font-bold text-navy-100 font-mono">
                  {formatMoney(simAccount.initialCapital)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  simAccount.totalReturn >= 0 ? "bg-profit/15" : "bg-loss/15"
                )}
              >
                {simAccount.totalReturn >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-profit" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-loss" />
                )}
              </div>
              <div>
                <p className="text-xs text-navy-500">当前净值</p>
                <p className="text-xl font-bold font-mono text-navy-100">
                  {formatMoney(simAccount.currentNetValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-navy-500">可用现金</p>
                <p className="text-xl font-bold font-mono text-navy-100">
                  {formatMoney(simAccount.availableCash)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  simAccount.totalReturnRate >= 0 ? "bg-profit/15" : "bg-loss/15"
                )}
              >
                <Percent
                  className={cn(
                    "w-5 h-5",
                    simAccount.totalReturnRate >= 0
                      ? "text-profit"
                      : "text-loss"
                  )}
                />
              </div>
              <div>
                <p className="text-xs text-navy-500">累计收益</p>
                <p
                  className={cn(
                    "text-xl font-bold font-mono",
                    simAccount.totalReturnRate >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {simAccount.totalReturnRate >= 0 ? "+" : ""}
                  {formatPercent(simAccount.totalReturnRate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isRunningBacktest && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-navy-100">
                <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                回测进行中...
              </h3>
              <span className="text-gold-400 font-mono">
                {backtestProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-gold transition-all duration-300"
                style={{ width: `${backtestProgress}%` }}
              />
            </div>
          </div>
        )}

        {currentBacktest && (
          <>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <LineChart className="w-6 h-6 text-gold-400" />
                  <div>
                    <h3 className="font-serif font-semibold text-navy-100">
                      {currentBacktest.strategyName}
                    </h3>
                    <p className="text-sm text-navy-500">
                      回测周期: {currentBacktest.startDate} ~{" "}
                      {currentBacktest.endDate}
                    </p>
                  </div>
                </div>
                <span className="badge-gold">回测完成</span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {statsCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="glass-card p-5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            stat.bgColor
                          )}
                        >
                          <Icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                      </div>
                      <p className="text-xs text-navy-500 mb-1">
                        {stat.label}
                      </p>
                      <p
                        className={cn(
                          "text-2xl font-bold font-mono",
                          stat.valueColor
                        )}
                      >
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-5 gap-4 mb-6">
                {tradeStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="glass-card p-4 text-center"
                      style={{
                        animationDelay: `${(index + 4) * 50}ms`,
                      }}
                    >
                      <Icon
                        className={cn("w-5 h-5 mx-auto mb-2", stat.color)}
                      />
                      <p className="text-xs text-navy-500 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-lg font-bold font-mono text-navy-100">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="h-[400px]">
                {equityCurveOption && (
                  <ReactECharts
                    option={equityCurveOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                  />
                )}
              </div>
            </div>

            {backtestResults.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-serif font-semibold text-navy-100 mb-4">
                  历史回测记录
                </h3>
                <div className="space-y-3">
                  {backtestResults.map((result, index) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 transition-colors cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            result.returnRate >= 0
                              ? "bg-profit/15"
                              : "bg-loss/15"
                          )}
                        >
                          {result.returnRate >= 0 ? (
                            <ArrowUpRight className="w-5 h-5 text-profit" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-loss" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-navy-100">
                            {result.strategyName}
                          </p>
                          <p className="text-xs text-navy-500">
                            {result.startDate} ~ {result.endDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xs text-navy-500">收益率</p>
                          <p
                            className={cn(
                              "font-mono font-medium",
                              result.returnRate >= 0
                                ? "text-profit"
                                : "text-loss"
                            )}
                          >
                            {result.returnRate >= 0 ? "+" : ""}
                            {formatPercent(result.returnRate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-navy-500">夏普比率</p>
                          <p className="font-mono font-medium text-navy-200">
                            {result.sharpeRatio.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-navy-500">最大回撤</p>
                          <p className="font-mono font-medium text-loss">
                            {formatPercent(result.maxDrawdown)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showBacktestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-lg font-serif font-semibold text-navy-100 mb-6">
              新建回测任务
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-navy-400 block mb-2">
                  策略名称
                </label>
                <select
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  className="input-field"
                >
                  <option value="双均线策略">双均线策略</option>
                  <option value="MACD策略">MACD策略</option>
                  <option value="RSI策略">RSI策略</option>
                  <option value="布林带策略">布林带策略</option>
                  <option value="动量策略">动量策略</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-navy-400 block mb-2">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-navy-400 block mb-2">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-navy-700">
              <button
                onClick={() => setShowBacktestModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleStartBacktest}
                className="btn-primary flex-1"
              >
                开始回测
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
