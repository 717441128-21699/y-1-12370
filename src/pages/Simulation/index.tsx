import { useState, useMemo } from "react";
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
  GitCompare,
  Settings,
  Zap,
} from "lucide-react";
import { formatMoney, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function SimulationPage() {
  const {
    simAccount,
    backtestResults,
    currentBacktest,
    selectedBacktestId,
    compareBacktestId,
    isRunningBacktest,
    backtestProgress,
    strategyParams,
    startBacktest,
    setStrategyParams,
    setSelectedBacktest,
    setCompareBacktest,
    getBacktestById,
  } = useSimulationStore();

  const [showBacktestModal, setShowBacktestModal] = useState(false);
  const [strategyName, setStrategyName] = useState("双均线策略");
  const [startDate, setStartDate] = useState("2024-06-01");
  const [endDate, setEndDate] = useState("2025-06-01");
  const [showCompareMode, setShowCompareMode] = useState(false);

  const compareBacktest = compareBacktestId ? getBacktestById(compareBacktestId) : null;

  const handleStartBacktest = async () => {
    await startBacktest(strategyName, startDate, endDate, strategyParams);
    setShowBacktestModal(false);
  };

  const equityCurveOption = useMemo(() => {
    if (!currentBacktest) return null;

    const legendData = ["策略净值(当前)", "基准净值"];
    const series: any[] = [
      {
        name: "策略净值(当前)",
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
    ];

    if (compareBacktest) {
      legendData.push("策略净值(对比)");
      series.push({
        name: "策略净值(对比)",
        type: "line",
        data: compareBacktest.equityCurve.map((d) => d.value),
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#3B82F6", width: 2 },
      });
    }

    return {
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
            let color = "#64748B";
            if (p.seriesName === "策略净值(当前)") color = "#D4AF37";
            if (p.seriesName === "策略净值(对比)") color = "#3B82F6";
            html += `<div style="font-size: 12px; margin-bottom: 4px;"><span style="color: ${color};">${p.seriesName}: ${formatMoney(p.value)}</span></div>`;
          });
          html += `</div>`;
          return html;
        },
      },
      legend: {
        data: legendData,
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
      series,
    };
  }, [currentBacktest, compareBacktest]);

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCompareMode(!showCompareMode)}
            className={cn(
              "btn-secondary flex items-center gap-2",
              showCompareMode && "ring-2 ring-gold-500/50"
            )}
          >
            <GitCompare className="w-4 h-4" />
            对比模式
          </button>
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
        </div>
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

            {currentBacktest?.strategyParams && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-5 h-5 text-gold-400" />
                  <h3 className="font-serif font-semibold text-navy-100">
                    策略参数配置
                  </h3>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-navy-500 mb-1">短期均线</p>
                    <p className="text-lg font-bold font-mono text-navy-100">
                      {currentBacktest.strategyParams.shortPeriod}日
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy-500 mb-1">长期均线</p>
                    <p className="text-lg font-bold font-mono text-navy-100">
                      {currentBacktest.strategyParams.longPeriod}日
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy-500 mb-1">信号周期</p>
                    <p className="text-lg font-bold font-mono text-navy-100">
                      {currentBacktest.strategyParams.signalPeriod}日
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy-500 mb-1">止损比例</p>
                    <p className="text-lg font-bold font-mono text-loss">
                      {currentBacktest.strategyParams.stopLoss}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy-500 mb-1">止盈比例</p>
                    <p className="text-lg font-bold font-mono text-profit">
                      {currentBacktest.strategyParams.takeProfit}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy-500 mb-1">仓位比例</p>
                    <p className="text-lg font-bold font-mono text-gold-400">
                      {currentBacktest.strategyParams.positionSize}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showCompareMode && compareBacktest && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <GitCompare className="w-5 h-5 text-blue-400" />
                  <h3 className="font-serif font-semibold text-navy-100">
                    回测结果对比
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-navy-700">
                        <th className="text-left py-3 px-4 text-xs text-navy-500 font-medium">
                          指标
                        </th>
                        <th className="text-right py-3 px-4 text-xs text-navy-500 font-medium">
                          当前回测
                        </th>
                        <th className="text-right py-3 px-4 text-xs text-navy-500 font-medium">
                          对比回测
                        </th>
                        <th className="text-right py-3 px-4 text-xs text-navy-500 font-medium">
                          差异
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          label: "总收益率",
                          current: currentBacktest.returnRate,
                          compare: compareBacktest.returnRate,
                          format: (v: number) => formatPercent(v),
                          isGood: (c: number, b: number) => c > b,
                        },
                        {
                          label: "年化收益率",
                          current: currentBacktest.annualReturnRate,
                          compare: compareBacktest.annualReturnRate,
                          format: (v: number) => formatPercent(v),
                          isGood: (c: number, b: number) => c > b,
                        },
                        {
                          label: "夏普比率",
                          current: currentBacktest.sharpeRatio,
                          compare: compareBacktest.sharpeRatio,
                          format: (v: number) => v.toFixed(2),
                          isGood: (c: number, b: number) => c > b,
                        },
                        {
                          label: "最大回撤",
                          current: currentBacktest.maxDrawdown,
                          compare: compareBacktest.maxDrawdown,
                          format: (v: number) => formatPercent(v),
                          isGood: (c: number, b: number) => c > b,
                        },
                        {
                          label: "胜率",
                          current: currentBacktest.winRate,
                          compare: compareBacktest.winRate,
                          format: (v: number) => formatPercent(v, 2, false),
                          isGood: (c: number, b: number) => c > b,
                        },
                        {
                          label: "盈亏比",
                          current: currentBacktest.profitLossRatio,
                          compare: compareBacktest.profitLossRatio,
                          format: (v: number) => v.toFixed(2),
                          isGood: (c: number, b: number) => c > b,
                        },
                        {
                          label: "总交易次数",
                          current: currentBacktest.totalTrades,
                          compare: compareBacktest.totalTrades,
                          format: (v: number) => v.toString(),
                          isGood: () => true,
                        },
                      ].map((item, index) => {
                        const diff = item.current - item.compare;
                        const isBetter = item.isGood(item.current, item.compare);
                        return (
                          <tr
                            key={index}
                            className="border-b border-navy-800/50 hover:bg-navy-800/30"
                          >
                            <td className="py-3 px-4 text-sm text-navy-300">
                              {item.label}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-mono text-gold-400">
                              {item.format(item.current)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-mono text-blue-400">
                              {item.format(item.compare)}
                            </td>
                            <td
                              className={cn(
                                "py-3 px-4 text-right text-sm font-mono",
                                isBetter ? "text-profit" : "text-loss"
                              )}
                            >
                              {diff >= 0 ? "+" : ""}
                              {item.format(diff)}
                              <span className="ml-1 text-xs">
                                {isBetter ? "↑" : "↓"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {backtestResults.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold text-navy-100">
                    历史回测记录
                  </h3>
                  {showCompareMode && (
                    <span className="text-xs text-navy-500">
                      点击选择对比回测
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {backtestResults.map((result, index) => {
                    const isSelected = selectedBacktestId === result.id;
                    const isCompare = compareBacktestId === result.id;
                    return (
                      <div
                        key={result.id}
                        onClick={() => {
                          if (showCompareMode) {
                            if (isCompare) {
                              setCompareBacktest(null);
                            } else if (!isSelected) {
                              setCompareBacktest(result.id);
                            }
                          } else {
                            setSelectedBacktest(result.id);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer",
                          isSelected && "ring-2 ring-gold-500/50",
                          isCompare && "ring-2 ring-blue-500/50",
                          "bg-navy-800/50 hover:bg-navy-700/50"
                        )}
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
                              {isSelected && (
                                <span className="ml-2 text-xs text-gold-400">
                                  [当前]
                                </span>
                              )}
                              {isCompare && (
                                <span className="ml-2 text-xs text-blue-400">
                                  [对比]
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-navy-500">
                              {result.startDate} ~ {result.endDate}
                              {result.strategyParams && ` · ${result.strategyParams.shortPeriod}/${result.strategyParams.longPeriod}均线`}
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
                    );
                  })}
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

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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

              <div className="pt-2 border-t border-navy-700">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-gold-400" />
                  <h4 className="text-sm font-medium text-navy-200">
                    策略参数
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-navy-500 block mb-1">
                        短期均线周期
                      </label>
                      <input
                        type="number"
                        value={strategyParams.shortPeriod}
                        onChange={(e) =>
                          setStrategyParams({
                            shortPeriod: parseInt(e.target.value) || 5,
                          })
                        }
                        className="input-field text-sm"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-navy-500 block mb-1">
                        长期均线周期
                      </label>
                      <input
                        type="number"
                        value={strategyParams.longPeriod}
                        onChange={(e) =>
                          setStrategyParams({
                            longPeriod: parseInt(e.target.value) || 20,
                          })
                        }
                        className="input-field text-sm"
                        min="10"
                        max="200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-navy-500 block mb-1">
                        信号周期
                      </label>
                      <input
                        type="number"
                        value={strategyParams.signalPeriod}
                        onChange={(e) =>
                          setStrategyParams({
                            signalPeriod: parseInt(e.target.value) || 9,
                          })
                        }
                        className="input-field text-sm"
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-navy-500 block mb-1">
                        仓位比例(%)
                      </label>
                      <input
                        type="number"
                        value={strategyParams.positionSize}
                        onChange={(e) =>
                          setStrategyParams({
                            positionSize: parseInt(e.target.value) || 30,
                          })
                        }
                        className="input-field text-sm"
                        min="5"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-navy-500 block mb-1">
                        止损比例(%)
                      </label>
                      <input
                        type="number"
                        value={strategyParams.stopLoss}
                        onChange={(e) =>
                          setStrategyParams({
                            stopLoss: parseInt(e.target.value) || 5,
                          })
                        }
                        className="input-field text-sm"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-navy-500 block mb-1">
                        止盈比例(%)
                      </label>
                      <input
                        type="number"
                        value={strategyParams.takeProfit}
                        onChange={(e) =>
                          setStrategyParams({
                            takeProfit: parseInt(e.target.value) || 15,
                          })
                        }
                        className="input-field text-sm"
                        min="5"
                        max="100"
                      />
                    </div>
                  </div>
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
