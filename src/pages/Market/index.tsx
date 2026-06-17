import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import { useMarketStore } from "@/stores/marketStore";
import {
  Star,
  StarOff,
  Bell,
  BellRing,
  BellOff,
  Newspaper,
  Zap,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Settings,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import {
  formatMoney,
  formatPercent,
  formatVolume,
  formatRelativeTime,
  getProfitColor,
  formatNewsCategory,
} from "@/utils/format";
import { cn } from "@/lib/utils";
import type { NewsCategory, StockQuote, Alert } from "@/types";

type TabType = "watchlist" | "news" | "anomaly" | "alerts";
type GroupType = "all" | string;

export default function MarketPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("watchlist");
  const [activeGroup, setActiveGroup] = useState<GroupType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedStockForAlert, setSelectedStockForAlert] =
    useState<StockQuote | null>(null);

  const {
    getWatchlistQuotes,
    news,
    getAnomalyStocks,
    alerts,
    triggeredAlerts,
    alertHistory,
    toggleAlert,
    addAlert,
    checkPriceAlerts,
    setAlertThreshold,
    alertThreshold,
    getQuoteBySymbol,
    clearAlertHistory,
    refreshMarketData,
    loading,
  } = useMarketStore();

  const watchlistQuotes = getWatchlistQuotes();
  const anomalyStocks = getAnomalyStocks();

  const groups = Array.from(new Set(watchlistQuotes.map((q) => q.groupName)));

  const filteredQuotes = watchlistQuotes.filter((q) => {
    const matchesGroup = activeGroup === "all" || q.groupName === activeGroup;
    const matchesSearch =
      searchQuery === "" ||
      q.name.includes(searchQuery) ||
      q.symbol.includes(searchQuery);
    return matchesGroup && matchesSearch;
  });

  const [newsCategory, setNewsCategory] = useState<NewsCategory | "all">("all");
  const filteredNews = news.filter(
    (n) => newsCategory === "all" || n.category === newsCategory
  );

  useEffect(() => {
    checkPriceAlerts();
  }, [checkPriceAlerts]);

  const tabs: { key: TabType; label: string; icon: any; count?: number }[] = [
    { key: "watchlist", label: "自选股", icon: Star, count: watchlistQuotes.length },
    { key: "news", label: "财经新闻", icon: Newspaper, count: news.length },
    {
      key: "anomaly",
      label: "异动提醒",
      icon: Zap,
      count: anomalyStocks.length,
    },
    { key: "alerts", label: "预警记录", icon: BellRing, count: alertHistory.length },
  ];

  const handleSetAlert = (stock: StockQuote) => {
    setSelectedStockForAlert(stock);
    setShowAlertModal(true);
  };

  const handleCreateAlert = (type: Alert["alertType"], threshold: number) => {
    if (selectedStockForAlert) {
      addAlert({
        userId: "u001",
        symbol: selectedStockForAlert.symbol,
        stockName: selectedStockForAlert.name,
        alertType: type,
        threshold,
        enabled: true,
        notifyChannel: "app",
      });
      setShowAlertModal(false);
      setSelectedStockForAlert(null);
      checkPriceAlerts();
    }
  };

  const handleGoToAnalysis = (symbol: string) => {
    navigate(`/analysis/${symbol}`);
  };

  return (
    <PageContainer
      title="行情中心"
      subtitle="实时行情、异动提醒、财经资讯一站式服务"
      action={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-400">预警阈值</span>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-lg bg-navy-700 border border-navy-600 text-sm text-navy-100 focus:outline-none focus:border-gold-500/50"
              min={0.1}
              max={20}
              step={0.5}
            />
            <span className="text-sm text-navy-400">%</span>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加自选
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-1 p-1 bg-navy-800/50 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab.key
                    ? "bg-gold-500/15 text-gold-400 shadow-gold-sm"
                    : "text-navy-400 hover:text-navy-200 hover:bg-navy-700/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs",
                      activeTab === tab.key
                        ? "bg-gold-500/30 text-gold-300"
                        : "bg-navy-700 text-navy-300"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "watchlist" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="搜索股票代码/名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-navy-800/50 border border-navy-700 text-sm text-navy-100 placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveGroup("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    activeGroup === "all"
                      ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                      : "bg-navy-800/50 text-navy-400 hover:text-navy-200 border border-navy-700"
                  )}
                >
                  全部
                </button>
                {groups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeGroup === group
                        ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                        : "bg-navy-800/50 text-navy-400 hover:text-navy-200 border border-navy-700"
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Star className="w-4 h-4 text-gold-400" />
                    </th>
                    <th>股票</th>
                    <th className="text-right">现价</th>
                    <th className="text-right">涨跌幅</th>
                    <th className="text-right">涨跌额</th>
                    <th className="text-right">成交量</th>
                    <th className="text-right">成交额</th>
                    <th className="text-right">换手率</th>
                    <th className="text-center">预警</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((stock, index) => {
                    const hasAlert = alerts.some(
                      (a) => a.symbol === stock.symbol && a.enabled
                    );
                    return (
                      <tr
                        key={stock.symbol}
                        className="table-row-hover cursor-pointer"
                        onClick={() => handleGoToAnalysis(stock.symbol)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td>
                          <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className="badge-gold text-xs">
                              {stock.groupName}
                            </span>
                            <div>
                              <p className="font-medium text-navy-100">
                                {stock.name}
                              </p>
                              <p className="text-xs text-navy-500 font-mono">
                                {stock.symbol}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <span
                            className={cn(
                              "font-mono font-bold text-lg",
                              getProfitColor(stock.changePercent)
                            )}
                          >
                            {stock.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-medium text-sm",
                              stock.changePercent >= 0
                                ? "bg-profit/10 text-profit"
                                : "bg-loss/10 text-loss"
                            )}
                          >
                            {stock.changePercent >= 0 ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {formatPercent(Math.abs(stock.changePercent), 2, false)}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "text-right font-mono font-medium",
                            getProfitColor(stock.change)
                          )}
                        >
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change.toFixed(2)}
                        </td>
                        <td className="text-right font-mono text-navy-300">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className="text-right font-mono text-navy-300">
                          {formatVolume(stock.amount)}
                        </td>
                        <td className="text-right text-navy-300">
                          {stock.turnover.toFixed(2)}%
                        </td>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              hasAlert
                                ? toggleAlert(
                                    alerts.find((a) => a.symbol === stock.symbol)!
                                      .id
                                  )
                                : handleSetAlert(stock)
                            }
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              hasAlert
                                ? "text-gold-400 bg-gold-500/15 hover:bg-gold-500/25"
                                : "text-navy-500 hover:text-gold-400 hover:bg-gold-500/10"
                            )}
                          >
                            {hasAlert ? (
                              <BellRing className="w-4 h-4" />
                            ) : (
                              <BellOff className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleGoToAnalysis(stock.symbol)}
                            className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 ml-auto"
                          >
                            分析 <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setNewsCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  newsCategory === "all"
                    ? "bg-gold-500/15 text-gold-400"
                    : "bg-navy-800/50 text-navy-400 hover:text-navy-200"
                )}
              >
                全部
              </button>
              {(["macro", "industry", "stock", "policy"] as NewsCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewsCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      newsCategory === cat
                        ? "bg-gold-500/15 text-gold-400"
                        : "bg-navy-800/50 text-navy-400 hover:text-navy-200"
                    )}
                  >
                    {formatNewsCategory(cat)}
                  </button>
                )
              )}
            </div>

            <div className="grid gap-4">
              {filteredNews.map((item, index) => (
                <div
                  key={item.id}
                  className="glass-card-hover p-5 cursor-pointer group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-gold text-xs">
                          {formatNewsCategory(item.category)}
                        </span>
                        {item.isHot && (
                          <span className="badge-loss text-xs animate-pulse-loss">
                            热门
                          </span>
                        )}
                        <span className="text-xs text-navy-500">
                          {item.source}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-navy-100 group-hover:text-gold-400 transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-navy-400 line-clamp-2 mb-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-navy-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(item.publishAt)}
                        </span>
                        <span className="text-xs text-navy-500 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          {item.heat.toLocaleString()} 热度
                        </span>
                        {item.relatedStocks.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-navy-500">
                              关联股票:
                            </span>
                            {item.relatedStocks.slice(0, 3).map((sym) => {
                              const quote = getQuoteBySymbol(sym);
                              return (
                                <span
                                  key={sym}
                                  className="text-xs px-1.5 py-0.5 rounded bg-navy-700 text-navy-300 font-mono"
                                >
                                  {quote?.name || sym}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-navy-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "anomaly" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-400">
                以下股票涨跌幅超过 {alertThreshold}%，请注意风险
              </p>
              <span className="badge-gold">
                共 {anomalyStocks.length} 只异动股票
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {anomalyStocks.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className={cn(
                    "glass-card p-5 cursor-pointer group",
                    stock.changePercent > 0
                      ? "border-profit/30"
                      : "border-loss/30"
                  )}
                  onClick={() => handleGoToAnalysis(stock.symbol)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-navy-100 group-hover:text-gold-400 transition-colors">
                          {stock.name}
                        </h3>
                        <span className="text-xs text-navy-500 font-mono">
                          {stock.symbol}
                        </span>
                      </div>
                      <p className="text-xs text-navy-500 mt-0.5">
                        异动原因: {stock.changePercent > 0 ? "大幅上涨" : "大幅下跌"}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg",
                        stock.changePercent > 0
                          ? "bg-profit/15 text-profit"
                          : "bg-loss/15 text-loss"
                      )}
                    >
                      {stock.changePercent > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-mono font-bold">
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-navy-500">现价</p>
                      <p
                        className={cn(
                          "text-lg font-bold font-mono",
                          getProfitColor(stock.changePercent)
                        )}
                      >
                        {stock.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-500">成交量</p>
                      <p className="text-sm font-mono text-navy-200">
                        {formatVolume(stock.volume)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-500">成交额</p>
                      <p className="text-sm font-mono text-navy-200">
                        {formatVolume(stock.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-navy-700 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-navy-500">
                      <span>最高 {stock.high.toFixed(2)}</span>
                      <span>最低 {stock.low.toFixed(2)}</span>
                      <span>换手 {stock.turnover.toFixed(2)}%</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetAlert(stock);
                      }}
                      className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      设置预警
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {anomalyStocks.length === 0 && (
              <div className="glass-card p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-navy-600 mx-auto mb-4" />
                <p className="text-lg text-navy-400">暂无异动股票</p>
                <p className="text-sm text-navy-500 mt-2">
                  当前没有涨跌幅超过 {alertThreshold}% 的股票
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-400">
                共 {alertHistory.length} 条预警记录，阈值 {alertThreshold}%
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => clearAlertHistory()}
                  className="btn-secondary text-sm py-2 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  清空记录
                </button>
                <button
                  onClick={() => refreshMarketData()}
                  disabled={loading}
                  className="btn-primary text-sm py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap className={cn("w-4 h-4", loading && "animate-spin")} />
                  刷新行情
                </button>
              </div>
            </div>

            {alertHistory.length > 0 ? (
              <div className="space-y-3">
                {alertHistory.map((alert, index) => {
                  const quote = getQuoteBySymbol(alert.symbol);
                  return (
                    <div
                      key={alert.id}
                      onClick={() => handleGoToAnalysis(alert.symbol)}
                      className={cn(
                        "glass-card p-4 border-l-4 cursor-pointer hover:bg-navy-800/50 transition-colors",
                        alert.alertType.includes("up")
                          ? "border-profit"
                          : "border-loss"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              alert.alertType.includes("up")
                                ? "bg-profit/15"
                                : "bg-loss/15"
                            )}
                          >
                            {alert.alertType.includes("up") ? (
                              <TrendingUp className="w-5 h-5 text-profit" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-loss" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-navy-100">
                                {alert.stockName}
                              </h4>
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded",
                                  alert.alertType.includes("up")
                                    ? "bg-profit/15 text-profit"
                                    : "bg-loss/15 text-loss"
                                )}
                              >
                                {alert.alertType.includes("up")
                                  ? "涨超"
                                  : "跌超"}
                                {alert.threshold}%
                              </span>
                            </div>
                            <p className="text-xs text-navy-500">
                              {alert.symbol} ·{" "}
                              {formatRelativeTime(alert.triggeredAt || new Date())}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p
                              className={cn(
                                "text-lg font-bold font-mono",
                                alert.changePercent && alert.changePercent >= 0
                                  ? "text-profit"
                                  : "text-loss"
                              )}
                            >
                              {alert.currentPrice?.toFixed(2) || quote?.price.toFixed(2)}
                            </p>
                            <p
                              className={cn(
                                "text-sm font-mono",
                                alert.changePercent && alert.changePercent >= 0
                                  ? "text-profit"
                                  : "text-loss"
                              )}
                            >
                              {formatPercent(alert.changePercent || quote?.changePercent || 0)}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-navy-600" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <BellOff className="w-12 h-12 text-navy-600 mx-auto mb-4" />
                <p className="text-lg text-navy-400">暂无预警记录</p>
                <p className="text-sm text-navy-500 mt-2">
                  当自选股涨跌幅超过 {alertThreshold}% 时将自动记录在此
                </p>
                <button
                  onClick={() => refreshMarketData()}
                  className="btn-primary mt-4 text-sm py-2"
                >
                  刷新行情检测预警
                </button>
              </div>
            )}

            <div className="glass-card p-5 mt-6">
              <h3 className="text-lg font-serif font-semibold text-navy-100 mb-4">
                预警设置说明
              </h3>
              <div className="space-y-3 text-sm text-navy-400">
                <p>• 当前预警阈值: <span className="text-gold-400 font-mono">{alertThreshold}%</span></p>
                <p>• 调整阈值后，系统会自动重新检测所有自选股</p>
                <p>• 点击预警记录可跳转到对应股票的技术分析页面</p>
                <p>• 预警记录最多保留50条，自动按时间倒序排列</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAlertModal && selectedStockForAlert && (
        <AlertModal
          stock={selectedStockForAlert}
          onClose={() => {
            setShowAlertModal(false);
            setSelectedStockForAlert(null);
          }}
          onConfirm={handleCreateAlert}
        />
      )}
    </PageContainer>
  );
}

function AlertModal({
  stock,
  onClose,
  onConfirm,
}: {
  stock: StockQuote;
  onClose: () => void;
  onConfirm: (type: Alert["alertType"], threshold: number) => void;
}) {
  const [type, setType] = useState<Alert["alertType"]>("percent_up");
  const [threshold, setThreshold] = useState(3);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-semibold text-navy-100">
            设置预警 - {stock.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-navy-700 text-navy-400 hover:text-navy-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-navy-400 block mb-2">预警类型</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "percent_up", label: "涨幅超过" },
                { value: "percent_down", label: "跌幅超过" },
                { value: "price_up", label: "价格高于" },
                { value: "price_down", label: "价格低于" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value as Alert["alertType"])}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-all text-left",
                    type === opt.value
                      ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                      : "bg-navy-800/50 text-navy-300 border border-navy-700 hover:border-navy-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-navy-400 block mb-2">
              {type.includes("percent") ? "涨跌幅阈值 (%)" : "价格阈值"}
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="input-field"
              step={type.includes("percent") ? 0.5 : 0.01}
            />
            <p className="text-xs text-navy-500 mt-2">
              当前价格: <span className="text-gold-400 font-mono">{stock.price.toFixed(2)}</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
            <button
              onClick={() => onConfirm(type, threshold)}
              className="btn-primary flex-1"
            >
              确认设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
