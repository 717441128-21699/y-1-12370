import { useAccountStore } from "@/stores/accountStore";
import { useMarketStore } from "@/stores/marketStore";
import PageContainer from "@/components/layout/PageContainer";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Building2,
  AlertCircle,
  Bell,
  Newspaper,
  Zap,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import {
  formatMoney,
  formatPercent,
  formatVolume,
  formatDate,
  formatRelativeTime,
  getProfitColor,
} from "@/utils/format";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const {
    accounts,
    selectedAccountId,
    selectAccount,
    getAccountHoldings,
    getAccountTransactions,
    getTotalAssets,
    getTotalCash,
    getTotalProfit,
    getTotalProfitRate,
    getAccountById,
    syncAccountData,
    syncStatus,
    syncProgress,
    lastSyncTime,
  } = useAccountStore();

  const { getWatchlistQuotes, triggeredAlerts, news, getAnomalyStocks } = useMarketStore();

  const selectedAccount = getAccountById(selectedAccountId || "");
  const currentHoldings = selectedAccountId
    ? getAccountHoldings(selectedAccountId)
    : [];
  const currentTransactions = selectedAccountId
    ? getAccountTransactions(selectedAccountId)
    : [];

  const totalAssets = getTotalAssets();
  const totalCash = getTotalCash();
  const totalProfit = getTotalProfit();
  const totalProfitRate = getTotalProfitRate();

  const watchlistQuotes = getWatchlistQuotes();
  const anomalyStocks = getAnomalyStocks();

  const assetAllocationOption = useMemo(() => {
    const stockValue = currentHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    const cashValue = selectedAccount?.cashBalance || 0;
    const total = stockValue + cashValue;

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(212, 175, 55, 0.3)",
        textStyle: { color: "#E2E8F0" },
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
        textStyle: { color: "#94A3B8", fontSize: 12 },
        formatter: (name: string) => {
          const data = [
            { name: "股票", value: stockValue },
            { name: "现金", value: cashValue },
          ];
          const item = data.find((d) => d.name === name);
          if (item) {
            return `${name}  ${formatMoney(item.value)}`;
          }
          return name;
        },
      },
      series: [
        {
          name: "资产配置",
          type: "pie",
          radius: ["55%", "75%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#0F172A",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "center",
            formatter: () => {
              return `{a|${formatMoney(total)}}\n{b|总资产}`;
            },
            rich: {
              a: {
                fontSize: 20,
                fontWeight: "bold",
                color: "#D4AF37",
                fontFamily: "JetBrains Mono",
              },
              b: {
                fontSize: 12,
                color: "#64748B",
                padding: [5, 0, 0, 0],
              },
            },
          },
          labelLine: { show: false },
          data: [
            { value: stockValue, name: "股票", itemStyle: { color: "#3B82F6" } },
            { value: cashValue, name: "现金", itemStyle: { color: "#10B981" } },
          ],
        },
      ],
    };
  }, [currentHoldings, selectedAccount]);

  const holdingsTrendOption = useMemo(() => {
    const days = 14;
    const dates: string[] = [];
    const values: number[] = [];
    const now = new Date();
    let value = totalAssets * 0.92;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }));
      value = value * (1 + (Math.random() - 0.45) * 0.03);
      values.push(Number(value.toFixed(2)));
    }

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(212, 175, 55, 0.3)",
        textStyle: { color: "#E2E8F0" },
        formatter: (params: any) => {
          const data = params[0];
          return `${data.axisValue}<br/>资产: ${formatMoney(data.value)}`;
        },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisLabel: {
          color: "#64748B",
          fontSize: 10,
          formatter: (v: number) => formatMoney(v),
        },
        splitLine: { lineStyle: { color: "#1E293B", type: "dashed" } },
      },
      series: [
        {
          data: values,
          type: "line",
          smooth: true,
          lineStyle: { width: 2, color: "#D4AF37" },
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
          symbol: "none",
        },
      ],
    };
  }, [totalAssets]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card-hover gold-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-navy-400">总资产</span>
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-gold-gradient mb-1">
              {formatMoney(totalAssets)}
            </p>
            <p className="text-xs text-navy-500">
              共 {accounts.length} 个证券账户
            </p>
          </div>

          <div className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-navy-400">现金余额</span>
              <div className="w-10 h-10 rounded-xl bg-profit/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-profit" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-profit-glow mb-1">
              {formatMoney(totalCash)}
            </p>
            <p className="text-xs text-navy-500">
              占比 {((totalCash / totalAssets) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-navy-400">累计收益</span>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  totalProfit >= 0 ? "bg-profit/15" : "bg-loss/15"
                )}
              >
                {totalProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-profit" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-loss" />
                )}
              </div>
            </div>
            <p
              className={cn(
                "text-2xl font-bold font-mono mb-1",
                getProfitColor(totalProfit)
              )}
            >
              {formatMoney(totalProfit)}
            </p>
            <p className={cn("text-xs", getProfitColor(totalProfitRate))}>
              {formatPercent(totalProfitRate)}
            </p>
          </div>

          <div className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-navy-400">持仓数量</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-navy-100 mb-1">
              {currentHoldings.length} 只
            </p>
            <p className="text-xs text-navy-500">
              总市值 {formatMoney(currentHoldings.reduce((s, h) => s + h.marketValue, 0))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-serif font-semibold text-navy-100">
                    账户选择
                  </h2>
                  <span className="text-xs text-navy-500">点击切换查看明细</span>
                </div>
                <div className="flex items-center gap-3">
                  {lastSyncTime && (
                    <span className="text-xs text-navy-500">
                      上次同步: {formatRelativeTime(lastSyncTime)}
                    </span>
                  )}
                  <button
                    onClick={() => syncAccountData()}
                    disabled={syncStatus === "syncing"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", syncStatus === "syncing" && "animate-spin")} />
                    {syncStatus === "syncing" ? `同步中 ${syncProgress}%` : syncStatus === "success" ? "同步成功" : "刷新数据"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => selectAccount(account.id)}
                    className={cn(
                      "flex-1 p-4 rounded-xl border transition-all duration-300 text-left",
                      selectedAccountId === account.id
                        ? "bg-gold-500/10 border-gold-500/50 shadow-gold-sm"
                        : "bg-navy-800/50 border-navy-700 hover:border-navy-600"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          selectedAccountId === account.id
                            ? "bg-gold-gradient"
                            : "bg-navy-700"
                        )}
                      >
                        <Building2
                          className={cn(
                            "w-5 h-5",
                            selectedAccountId === account.id
                              ? "text-navy-900"
                              : "text-navy-300"
                          )}
                        />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-medium text-sm",
                            selectedAccountId === account.id
                              ? "text-gold-400"
                              : "text-navy-200"
                          )}
                        >
                          {account.brokerName}
                        </p>
                        <p className="text-xs text-navy-500">{account.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-navy-500">总资产</p>
                        <p
                          className={cn(
                            "text-lg font-bold font-mono",
                            selectedAccountId === account.id
                              ? "text-gold-gradient"
                              : "text-navy-100"
                          )}
                        >
                          {formatMoney(account.totalAssets)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-navy-500">收益</p>
                        <p
                          className={cn(
                            "text-sm font-medium font-mono",
                            getProfitColor(account.totalProfit)
                          )}
                        >
                          {formatPercent(account.totalProfitRate)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-semibold text-navy-100">
                  持仓明细
                </h2>
                <span className="text-xs text-navy-500">
                  {selectedAccount?.brokerName}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>股票</th>
                      <th className="text-right">持仓</th>
                      <th className="text-right">成本价</th>
                      <th className="text-right">现价</th>
                      <th className="text-right">市值</th>
                      <th className="text-right">盈亏</th>
                      <th className="text-right">涨跌幅</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHoldings.map((holding, index) => (
                      <tr
                        key={holding.id}
                        className="table-row-hover"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-navy-400 text-xs font-mono">
                              {holding.symbol}
                            </span>
                            <span className="font-medium text-navy-100">
                              {holding.stockName}
                            </span>
                          </div>
                        </td>
                        <td className="text-right font-mono text-navy-200">
                          {holding.quantity.toLocaleString()}
                        </td>
                        <td className="text-right font-mono text-navy-300">
                          {formatNumber(holding.costPrice)}
                        </td>
                        <td className="text-right font-mono text-navy-100">
                          {formatNumber(holding.currentPrice)}
                        </td>
                        <td className="text-right font-mono text-navy-100">
                          {formatMoney(holding.marketValue)}
                        </td>
                        <td
                          className={cn(
                            "text-right font-mono font-medium",
                            getProfitColor(holding.profit)
                          )}
                        >
                          {formatMoney(holding.profit)}
                        </td>
                        <td className="text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-mono font-medium",
                              holding.profitRate >= 0
                                ? "bg-profit/10 text-profit"
                                : "bg-loss/10 text-loss"
                            )}
                          >
                            {holding.profitRate >= 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {formatPercent(Math.abs(holding.profitRate), 2, false)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-semibold text-navy-100">
                  最近交易
                </h2>
                <button className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                  查看全部 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {currentTransactions.slice(0, 5).map((tx, index) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-navy-800/50 hover:bg-navy-800 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center",
                          tx.type === "buy" ? "bg-profit/15" : "bg-loss/15"
                        )}
                      >
                        {tx.type === "buy" ? (
                          <ArrowDownRight className="w-4 h-4 text-profit" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-loss" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy-100">
                            {tx.stockName}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              tx.type === "buy"
                                ? "bg-profit/15 text-profit"
                                : "bg-loss/15 text-loss"
                            )}
                          >
                            {tx.type === "buy" ? "买入" : "卖出"}
                          </span>
                        </div>
                        <p className="text-xs text-navy-500">
                          {tx.quantity}股 × {formatNumber(tx.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-mono font-medium",
                          tx.type === "buy" ? "text-profit" : "text-loss"
                        )}
                      >
                        {tx.type === "buy" ? "-" : "+"}
                        {formatMoney(tx.amount)}
                      </p>
                      <p className="text-xs text-navy-500">
                        {formatRelativeTime(tx.tradeAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {currentTransactions.length === 0 && (
                  <div className="text-center py-8 text-navy-500">
                    暂无交易记录
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="glass-card p-5">
              <h2 className="text-lg font-serif font-semibold text-navy-100 mb-4">
                资产走势
              </h2>
              <div className="h-64">
                <ReactECharts
                  option={holdingsTrendOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-lg font-serif font-semibold text-navy-100 mb-4">
                资产配置
              </h2>
              <div className="h-56">
                <ReactECharts
                  option={assetAllocationOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              </div>
            </div>

            {triggeredAlerts.length > 0 && (
              <div className="glass-card border-loss/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-loss animate-pulse-loss" />
                  <h2 className="text-lg font-serif font-semibold text-loss">
                    预警通知
                  </h2>
                </div>
                <div className="space-y-2">
                  {triggeredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-loss/10 border border-loss/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-navy-100">
                          {alert.stockName}
                        </span>
                        <span className="text-xs text-loss">
                          {alert.alertType.includes("up") ? "涨超" : "跌超"}
                          {alert.threshold}%
                        </span>
                      </div>
                      <p className="text-xs text-navy-400 mt-1">
                        {formatRelativeTime(alert.triggeredAt || new Date())}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {anomalyStocks.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-gold-400" />
                  <h2 className="text-lg font-serif font-semibold text-navy-100">
                    异动提醒
                  </h2>
                </div>
                <div className="space-y-2">
                  {anomalyStocks.slice(0, 4).map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-navy-800/50"
                    >
                      <div>
                        <p className="font-medium text-sm text-navy-100">
                          {stock.name}
                        </p>
                        <p className="text-xs text-navy-500 font-mono">
                          {stock.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-mono font-medium",
                            getProfitColor(stock.changePercent)
                          )}
                        >
                          {formatPercent(stock.changePercent)}
                        </p>
                        <p className="text-xs text-navy-500">
                          成交额 {formatVolume(stock.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className="w-5 h-5 text-gold-400" />
                <h2 className="text-lg font-serif font-semibold text-navy-100">
                  热门资讯
                </h2>
              </div>
              <div className="space-y-3">
                {news.slice(0, 3).map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex items-start gap-2">
                      {item.isHot && (
                        <span className="badge-loss text-xs shrink-0 mt-0.5">
                          热门
                        </span>
                      )}
                      <p className="text-sm text-navy-200 group-hover:text-gold-400 transition-colors line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 ml-0">
                      <span className="text-xs text-navy-500">{item.source}</span>
                      <span className="text-xs text-navy-600">·</span>
                      <span className="text-xs text-navy-500">
                        {formatRelativeTime(item.publishAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}
