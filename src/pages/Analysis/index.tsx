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
} from "lucide-react";
import {
  formatMoney,
  formatPercent,
  formatVolume,
  getProfitColor,
} from "@/utils/format";
import { cn } from "@/lib/utils";
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
  const [maParams, setMaParams] = useState({
    ma5: { enabled: true, period: 5 },
    ma10: { enabled: true, period: 10 },
    ma20: { enabled: true, period: 20 },
    ma60: { enabled: false, period: 60 },
  });

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
