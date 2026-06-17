import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import PageContainer from "@/components/layout/PageContainer";
import { useMarketStore } from "@/stores/marketStore";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Activity,
  LineChart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Info,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  formatMoney,
  formatPercent,
  formatVolume,
  getProfitColor,
} from "@/utils/format";
import { cn } from "@/lib/utils";
import { storage } from "@/utils/storage";
import type { KLineType, KLineData } from "@/types";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { symbol = "600519" } = useParams<{ symbol: string }>();

  const {
    getKLineData,
    getQuoteBySymbol,
    quotes,
    selectedSymbol,
    setSelectedSymbol,
  } = useMarketStore();

  const [klineType, setKlineType] = useState<KLineType>("day");
  const [showSettings, setShowSettings] = useState(false);
  const [maParams, setMaParams] = useState(() => {
    return storage.get("maParams", {
      ma5: { enabled: true, period: 5 },
      ma10: { enabled: true, period: 10 },
      ma20: { enabled: true, period: 20 },
      ma60: { enabled: false, period: 60 },
    });
  });

  useEffect(() => {
    storage.set("maParams", maParams);
  }, [maParams]);

  const quote = getQuoteBySymbol(symbol) || quotes[0];
  const klineData = useMemo(() => getKLineData(symbol), [symbol, getKLineData]);

  const currentIndex = quotes.findIndex((q) => q.symbol === symbol);

  const handlePrevStock = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : quotes.length - 1;
    navigate(`/analysis/${quotes[prevIndex].symbol}`);
    setSelectedSymbol(quotes[prevIndex].symbol);
  };

  const handleNextStock = () => {
    const nextIndex = currentIndex < quotes.length - 1 ? currentIndex + 1 : 0;
    navigate(`/analysis/${quotes[nextIndex].symbol}`);
    setSelectedSymbol(quotes[nextIndex].symbol);
  };

  const handleStockSelect = (sym: string) => {
    navigate(`/analysis/${sym}`);
    setSelectedSymbol(sym);
  };

  const handleMaParamChange = (
    key: keyof typeof maParams,
    field: "enabled" | "period",
    value: boolean | number
  ) => {
    setMaParams((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const klineOption = useMemo(() => {
    const dates = klineData.map((d) => d.time);
    const klineValues = klineData.map((d) => [d.open, d.close, d.low, d.high]);
    const volumes = klineData.map((d) => d.volume);

    const series: any[] = [
      {
        name: "K线",
        type: "candlestick",
        data: klineValues,
        itemStyle: {
          color: "#10B981",
          color0: "#EF4444",
          borderColor: "#10B981",
          borderColor0: "#EF4444",
        },
      },
    ];

    const enabledMAs = Object.entries(maParams).filter(
      ([_, v]) => v.enabled
    ) as [keyof typeof maParams, { enabled: boolean; period: number }][];

    enabledMAs.forEach(([key, config]) => {
      const maData = klineData.map((d) => {
        const period = config.period;
        const idx = klineData.indexOf(d);
        if (idx < period - 1) return null;
        const slice = klineData.slice(idx - period + 1, idx + 1);
        const sum = slice.reduce((acc, item) => acc + item.close, 0);
        return Number((sum / period).toFixed(2));
      });

      const colors: Record<string, string> = {
        ma5: "#D4AF37",
        ma10: "#60A5FA",
        ma20: "#F472B6",
        ma60: "#A78BFA",
      };

      series.push({
        name: `MA${config.period}`,
        type: "line",
        data: maData,
        smooth: true,
        symbol: "none",
        lineStyle: {
          color: colors[key],
          width: 1.5,
        },
      });
    });

    return {
      backgroundColor: "transparent",
      animation: true,
      grid: [
        {
          left: "60px",
          right: "20px",
          top: "40px",
          height: "55%",
        },
        {
          left: "60px",
          right: "20px",
          top: "72%",
          height: "20%",
        },
      ],
      xAxis: [
        {
          type: "category",
          data: dates,
          gridIndex: 0,
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: { color: "#94A3B8", fontSize: 10 },
          splitLine: { show: false },
        },
        {
          type: "category",
          data: dates,
          gridIndex: 1,
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          scale: true,
          position: "left",
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: { color: "#94A3B8", fontSize: 10 },
          splitLine: { lineStyle: { color: "#1E293B" } },
        },
        {
          type: "value",
          gridIndex: 1,
          scale: true,
          position: "left",
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: {
            color: "#94A3B8",
            fontSize: 10,
            formatter: (v: number) => formatVolume(v),
          },
          splitLine: { lineStyle: { color: "#1E293B" } },
        },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";
          const dataIndex = params[0].dataIndex;
          const d = klineData[dataIndex];
          if (!d) return "";

          let html = `<div style="padding: 8px;">`;
          html += `<div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px;">${d.time}</div>`;
          html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 12px;">`;
          html += `<span style="color: #94A3B8;">开盘:</span><span style="color: #E2E8F0; font-family: monospace;">${d.open.toFixed(2)}</span>`;
          html += `<span style="color: #94A3B8;">收盘:</span><span style="color: ${d.close >= d.open ? "#10B981" : "#EF4444"}; font-family: monospace;">${d.close.toFixed(2)}</span>`;
          html += `<span style="color: #94A3B8;">最高:</span><span style="color: #10B981; font-family: monospace;">${d.high.toFixed(2)}</span>`;
          html += `<span style="color: #94A3B8;">最低:</span><span style="color: #EF4444; font-family: monospace;">${d.low.toFixed(2)}</span>`;
          html += `<span style="color: #94A3B8;">成交量:</span><span style="color: #E2E8F0; font-family: monospace;">${formatVolume(d.volume)}</span>`;
          html += `</div>`;

          enabledMAs.forEach(([key, config]) => {
            const maData = params.find((p: any) => p.seriesName === `MA${config.period}`);
            if (maData && maData.value !== null) {
              const colors: Record<string, string> = {
                ma5: "#D4AF37",
                ma10: "#60A5FA",
                ma20: "#F472B6",
                ma60: "#A78BFA",
              };
              html += `<div style="margin-top: 8px; font-size: 12px;"><span style="color: ${colors[key]};">MA${config.period}: ${maData.value}</span></div>`;
            }
          });

          html += `</div>`;
          return html;
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 60,
          end: 100,
        },
        {
          type: "slider",
          xAxisIndex: [0, 1],
          start: 60,
          end: 100,
          bottom: 5,
          height: 20,
          borderColor: "transparent",
          backgroundColor: "#1E293B",
          fillerColor: "rgba(212, 175, 55, 0.2)",
          handleStyle: {
            color: "#D4AF37",
          },
          textStyle: { color: "#94A3B8" },
        },
      ],
      series: [
        ...series,
        {
          name: "成交量",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes.map((v, i) => ({
            value: v,
            itemStyle: {
              color: klineData[i].close >= klineData[i].open ? "#10B981" : "#EF4444",
              opacity: 0.6,
            },
          })),
        },
      ],
    };
  }, [klineData, maParams]);

  const macdOption = useMemo(() => {
    const dates = klineData.map((d) => d.time);
    const macdData = klineData.map((d) => d.macd ?? null);
    const difData = klineData.map((d) => d.dif ?? null);
    const deaData = klineData.map((d) => d.dea ?? null);

    return {
      backgroundColor: "transparent",
      animation: true,
      grid: {
        left: "60px",
        right: "20px",
        top: "30px",
        bottom: "30px",
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94A3B8", fontSize: 10 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        scale: true,
        position: "left",
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94A3B8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1E293B" } },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      legend: {
        data: ["MACD", "DIF", "DEA"],
        textStyle: { color: "#94A3B8", fontSize: 11 },
        top: 0,
        right: 0,
      },
      series: [
        {
          name: "MACD",
          type: "bar",
          data: macdData,
          itemStyle: {
            color: (params: any) => {
              return params.value >= 0 ? "#10B981" : "#EF4444";
            },
          },
        },
        {
          name: "DIF",
          type: "line",
          data: difData,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#D4AF37", width: 1.5 },
        },
        {
          name: "DEA",
          type: "line",
          data: deaData,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#60A5FA", width: 1.5 },
        },
      ],
    };
  }, [klineData]);

  const rsiOption = useMemo(() => {
    const dates = klineData.map((d) => d.time);
    const rsiData = klineData.map((d) => d.rsi ?? null);

    return {
      backgroundColor: "transparent",
      animation: true,
      grid: {
        left: "60px",
        right: "20px",
        top: "30px",
        bottom: "30px",
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94A3B8", fontSize: 10 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        position: "left",
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94A3B8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1E293B" } },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";
          const rsi = params[0].value;
          let status = "";
          if (rsi > 70) status = '<span style="color: #EF4444;">(超买)</span>';
          else if (rsi < 30) status = '<span style="color: #10B981;">(超卖)</span>';
          return `<div style="padding: 4px;">RSI(14): <strong>${rsi}</strong> ${status}</div>`;
        },
      },
      series: [
        {
          name: "RSI",
          type: "line",
          data: rsiData,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#F472B6", width: 1.5 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(244, 114, 182, 0.3)" },
                { offset: 1, color: "rgba(244, 114, 182, 0)" },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: {
              type: "dashed",
              color: "#64748B",
              width: 1,
            },
            data: [
              { yAxis: 70, label: { color: "#EF4444", fontSize: 10, formatter: "超买 70" } },
              { yAxis: 30, label: { color: "#10B981", fontSize: 10, formatter: "超卖 30" } },
              { yAxis: 50, label: { color: "#64748B", fontSize: 10, formatter: "50" } },
            ],
          },
        },
      ],
    };
  }, [klineData]);

  const signalAnalysis = useMemo(() => {
    const lastData = klineData[klineData.length - 1];
    if (!lastData) return null;

    const macd = lastData.macd || 0;
    const dif = lastData.dif || 0;
    const dea = lastData.dea || 0;
    const rsi = lastData.rsi || 50;

    let macdSignal: "bullish" | "bearish" | "neutral" = "neutral";
    let macdStrength = 0;
    let macdDesc = "";

    if (dif > dea && macd > 0) {
      macdSignal = "bullish";
      macdStrength = Math.min(100, Math.abs(macd) * 10 + 30);
      macdDesc = "DIF在DEA上方，MACD柱状线为正，多头趋势";
    } else if (dif < dea && macd < 0) {
      macdSignal = "bearish";
      macdStrength = Math.min(100, Math.abs(macd) * 10 + 30);
      macdDesc = "DIF在DEA下方，MACD柱状线为负，空头趋势";
    } else if (dif > dea && macd < 0) {
      macdSignal = "bullish";
      macdStrength = 40;
      macdDesc = "DIF上穿DEA，金叉形成，短线看涨";
    } else {
      macdSignal = "bearish";
      macdStrength = 40;
      macdDesc = "DIF下穿DEA，死叉形成，短线看跌";
    }

    let rsiSignal: "bullish" | "bearish" | "neutral" = "neutral";
    let rsiStrength = 0;
    let rsiDesc = "";

    if (rsi > 70) {
      rsiSignal = "bearish";
      rsiStrength = Math.min(100, (rsi - 70) * 3 + 40);
      rsiDesc = `RSI=${rsi.toFixed(1)}，处于超买区间，注意回调风险`;
    } else if (rsi < 30) {
      rsiSignal = "bullish";
      rsiStrength = Math.min(100, (30 - rsi) * 3 + 40);
      rsiDesc = `RSI=${rsi.toFixed(1)}，处于超卖区间，存在反弹机会`;
    } else if (rsi > 50) {
      rsiSignal = "bullish";
      rsiStrength = 30 + (rsi - 50) * 1.4;
      rsiDesc = `RSI=${rsi.toFixed(1)}，位于50上方，偏强格局`;
    } else {
      rsiSignal = "bearish";
      rsiStrength = 30 + (50 - rsi) * 1.4;
      rsiDesc = `RSI=${rsi.toFixed(1)}，位于50下方，偏弱格局`;
    }

    const bullScore =
      (macdSignal === "bullish" ? macdStrength : 0) +
      (rsiSignal === "bullish" ? rsiStrength : 0);
    const bearScore =
      (macdSignal === "bearish" ? macdStrength : 0) +
      (rsiSignal === "bearish" ? rsiStrength : 0);

    let overallSignal: "bullish" | "bearish" | "neutral" = "neutral";
    let overallStrength = 0;
    if (bullScore > bearScore * 1.2) {
      overallSignal = "bullish";
      overallStrength = Math.min(100, bullScore / 2);
    } else if (bearScore > bullScore * 1.2) {
      overallSignal = "bearish";
      overallStrength = Math.min(100, bearScore / 2);
    } else {
      overallSignal = "neutral";
      overallStrength = 50;
    }

    return {
      macd: {
        signal: macdSignal,
        strength: macdStrength,
        desc: macdDesc,
        dif: dif.toFixed(2),
        dea: dea.toFixed(2),
        macd: macd.toFixed(2),
      },
      rsi: {
        signal: rsiSignal,
        strength: rsiStrength,
        desc: rsiDesc,
        value: rsi.toFixed(1),
      },
      overall: {
        signal: overallSignal,
        strength: overallStrength,
      },
    };
  }, [klineData]);

  return (
    <PageContainer
      title="技术分析"
      subtitle="专业的技术指标分析，助您把握市场趋势"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            指标设置
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevStock}
                className="p-2 rounded-lg bg-navy-700/50 hover:bg-navy-700 text-navy-400 hover:text-navy-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <select
                  value={symbol}
                  onChange={(e) => handleStockSelect(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-navy-700/50 border border-navy-600 text-navy-100 font-medium focus:outline-none focus:border-gold-500/50 cursor-pointer"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.name} ({q.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextStock}
                className="p-2 rounded-lg bg-navy-700/50 hover:bg-navy-700 text-navy-400 hover:text-navy-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {quote && (
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span
                    className={cn(
                      "text-3xl font-bold font-mono",
                      getProfitColor(quote.changePercent)
                    )}
                  >
                    {quote.price.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-lg font-mono font-medium",
                      quote.changePercent >= 0
                        ? "bg-profit/10 text-profit"
                        : "bg-loss/10 text-loss"
                    )}
                  >
                    {quote.changePercent >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {formatPercent(quote.changePercent)}
                  </span>
                </div>
                <p className="text-sm text-navy-500">
                  涨跌额 {quote.change >= 0 ? "+" : ""}
                  {quote.change.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {quote && (
            <div className="grid grid-cols-6 gap-4 mb-6 pb-6 border-b border-navy-700">
              <div>
                <p className="text-xs text-navy-500 mb-1">今开</p>
                <p className="text-sm font-mono text-navy-200">
                  {quote.open.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy-500 mb-1">最高</p>
                <p className="text-sm font-mono text-profit">
                  {quote.high.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy-500 mb-1">最低</p>
                <p className="text-sm font-mono text-loss">
                  {quote.low.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy-500 mb-1">昨收</p>
                <p className="text-sm font-mono text-navy-200">
                  {quote.prevClose.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy-500 mb-1">成交量</p>
                <p className="text-sm font-mono text-navy-200">
                  {formatVolume(quote.volume)}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy-500 mb-1">成交额</p>
                <p className="text-sm font-mono text-navy-200">
                  {formatVolume(quote.amount)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {(["day", "week", "month"] as KLineType[]).map((type) => (
              <button
                key={type}
                onClick={() => setKlineType(type)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  klineType === type
                    ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                    : "bg-navy-800/50 text-navy-400 hover:text-navy-200 border border-navy-700"
                )}
              >
                {type === "day" ? "日K" : type === "week" ? "周K" : "月K"}
              </button>
            ))}
          </div>

          <div className="h-[500px]">
            <ReactECharts
              option={klineOption}
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "canvas" }}
            />
          </div>
        </div>

        {signalAnalysis && (
          <div className="glass-card p-5 border-gold-500/20">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif font-semibold text-navy-100">
                技术信号解读
              </h3>
              <span className="text-xs text-navy-500">基于MACD和RSI综合判断</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div
                className={cn(
                  "p-4 rounded-xl border",
                  signalAnalysis.macd.signal === "bullish"
                    ? "bg-profit/5 border-profit/30"
                    : signalAnalysis.macd.signal === "bearish"
                    ? "bg-loss/5 border-loss/30"
                    : "bg-navy-800/50 border-navy-700"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-navy-200">MACD</span>
                  {signalAnalysis.macd.signal === "bullish" ? (
                    <span className="flex items-center gap-1 text-xs text-profit">
                      <TrendingUp className="w-3.5 h-3.5" />
                      偏多
                    </span>
                  ) : signalAnalysis.macd.signal === "bearish" ? (
                    <span className="flex items-center gap-1 text-xs text-loss">
                      <TrendingDown className="w-3.5 h-3.5" />
                      偏空
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-navy-400">
                      <Info className="w-3.5 h-3.5" />
                      中性
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      signalAnalysis.macd.signal === "bullish"
                        ? "bg-profit"
                        : signalAnalysis.macd.signal === "bearish"
                        ? "bg-loss"
                        : "bg-navy-500"
                    )}
                    style={{ width: `${signalAnalysis.macd.strength}%` }}
                  />
                </div>
                <p className="text-xs text-navy-400 line-clamp-2">
                  {signalAnalysis.macd.desc}
                </p>
                <div className="flex gap-3 mt-2 text-xs text-navy-500 font-mono">
                  <span>DIF: {signalAnalysis.macd.dif}</span>
                  <span>DEA: {signalAnalysis.macd.dea}</span>
                </div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border",
                  signalAnalysis.rsi.signal === "bullish"
                    ? "bg-profit/5 border-profit/30"
                    : signalAnalysis.rsi.signal === "bearish"
                    ? "bg-loss/5 border-loss/30"
                    : "bg-navy-800/50 border-navy-700"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-navy-200">RSI</span>
                  {signalAnalysis.rsi.signal === "bullish" ? (
                    <span className="flex items-center gap-1 text-xs text-profit">
                      <TrendingUp className="w-3.5 h-3.5" />
                      偏多
                    </span>
                  ) : signalAnalysis.rsi.signal === "bearish" ? (
                    <span className="flex items-center gap-1 text-xs text-loss">
                      <TrendingDown className="w-3.5 h-3.5" />
                      偏空
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-navy-400">
                      <Info className="w-3.5 h-3.5" />
                      中性
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      signalAnalysis.rsi.signal === "bullish"
                        ? "bg-profit"
                        : signalAnalysis.rsi.signal === "bearish"
                        ? "bg-loss"
                        : "bg-navy-500"
                    )}
                    style={{ width: `${signalAnalysis.rsi.strength}%` }}
                  />
                </div>
                <p className="text-xs text-navy-400 line-clamp-2">
                  {signalAnalysis.rsi.desc}
                </p>
                <div className="mt-2 text-xs text-navy-500 font-mono">
                  当前值: {signalAnalysis.rsi.value}
                </div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border",
                  signalAnalysis.overall.signal === "bullish"
                    ? "bg-profit/10 border-profit/40"
                    : signalAnalysis.overall.signal === "bearish"
                    ? "bg-loss/10 border-loss/40"
                    : "bg-navy-800/50 border-navy-600"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-navy-100">综合判断</span>
                  {signalAnalysis.overall.signal === "bullish" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-profit">
                      <CheckCircle className="w-4 h-4" />
                      看多
                    </span>
                  ) : signalAnalysis.overall.signal === "bearish" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-loss">
                      <AlertCircle className="w-4 h-4" />
                      看空
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-gold-400">
                      <Info className="w-4 h-4" />
                      观望
                    </span>
                  )}
                </div>
                <div className="w-full h-3 bg-navy-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      signalAnalysis.overall.signal === "bullish"
                        ? "bg-gradient-to-r from-profit to-profit/60"
                        : signalAnalysis.overall.signal === "bearish"
                        ? "bg-gradient-to-r from-loss to-loss/60"
                        : "bg-gradient-to-r from-gold-500 to-gold-400"
                    )}
                    style={{ width: `${signalAnalysis.overall.strength}%` }}
                  />
                </div>
                <p className="text-xs text-navy-400">
                  {signalAnalysis.overall.signal === "bullish"
                    ? "技术指标整体偏多，可考虑逢低布局"
                    : signalAnalysis.overall.signal === "bearish"
                    ? "技术指标整体偏空，建议控制仓位风险"
                    : "技术信号不明确，建议观望等待方向"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif font-semibold text-navy-100">
                MACD 指标
              </h3>
            </div>
            <div className="h-[300px]">
              <ReactECharts
                option={macdOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif font-semibold text-navy-100">
                RSI 指标 (14)
              </h3>
            </div>
            <div className="h-[300px]">
              <ReactECharts
                option={rsiOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-semibold text-navy-100">
                均线参数设置
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-lg hover:bg-navy-700 text-navy-400 hover:text-navy-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {(Object.keys(maParams) as Array<keyof typeof maParams>).map(
                (key) => {
                  const config = maParams[key];
                  const labels: Record<string, string> = {
                    ma5: "MA5",
                    ma10: "MA10",
                    ma20: "MA20",
                    ma60: "MA60",
                  };
                  const colors: Record<string, string> = {
                    ma5: "text-[#D4AF37]",
                    ma10: "text-[#60A5FA]",
                    ma20: "text-[#F472B6]",
                    ma60: "text-[#A78BFA]",
                  };

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-4 p-3 rounded-lg bg-navy-800/50"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={config.enabled}
                          onChange={(e) =>
                            handleMaParamChange(key, "enabled", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-navy-600 bg-navy-700 text-gold-500 focus:ring-gold-500/50"
                        />
                        <span className={cn("font-medium", colors[key])}>
                          {labels[key]}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-navy-500">周期</span>
                        <input
                          type="number"
                          value={config.period}
                          onChange={(e) =>
                            handleMaParamChange(
                              key,
                              "period",
                              Math.max(1, Math.min(200, Number(e.target.value)))
                            )
                          }
                          disabled={!config.enabled}
                          className="w-20 px-3 py-1.5 rounded-lg bg-navy-700 border border-navy-600 text-sm text-navy-100 focus:outline-none focus:border-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          min={1}
                          max={200}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-navy-700">
              <button
                onClick={() => {
                  setMaParams({
                    ma5: { enabled: true, period: 5 },
                    ma10: { enabled: true, period: 10 },
                    ma20: { enabled: true, period: 20 },
                    ma60: { enabled: false, period: 60 },
                  });
                }}
                className="btn-secondary flex-1"
              >
                恢复默认
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-primary flex-1"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
