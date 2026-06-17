import { Bell, Search, User, Settings, MessageSquare, RefreshCw } from "lucide-react";
import { useAccountStore } from "@/stores/accountStore";
import { useMarketStore } from "@/stores/marketStore";
import { formatMoney, formatPercent, getProfitColor } from "@/utils/format";
import { useEffect, useState } from "react";

export default function Header() {
  const { getTotalAssets, getTotalProfit, getTotalProfitRate } = useAccountStore();
  const { triggeredAlerts, checkPriceAlerts } = useMarketStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    checkPriceAlerts();
    const alertTimer = setInterval(() => {
      checkPriceAlerts();
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(alertTimer);
    };
  }, [checkPriceAlerts]);

  const totalAssets = getTotalAssets();
  const totalProfit = getTotalProfit();
  const totalProfitRate = getTotalProfitRate();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <header className="h-16 bg-navy-800/30 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="搜索股票代码/名称..."
            className="w-80 pl-10 pr-4 py-2 rounded-lg bg-navy-700/50 border border-navy-600 text-sm text-navy-100 placeholder-navy-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
          />
        </div>

        <div className="h-8 w-px bg-navy-700" />

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-navy-400">总资产</p>
            <p className="text-xl font-bold font-mono text-gold-gradient">
              {formatMoney(totalAssets)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-navy-400">累计收益</p>
            <p className={cn("text-xl font-bold font-mono", getProfitColor(totalProfit))}>
              {formatMoney(totalProfit)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-navy-400">收益率</p>
            <p className={cn("text-xl font-bold font-mono", getProfitColor(totalProfitRate))}>
              {formatPercent(totalProfitRate)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-4">
          <p className="text-sm font-mono text-navy-300">{formatTime(currentTime)}</p>
          <p className="text-xs text-navy-500">2025年06月17日 星期二</p>
        </div>

        <div className="h-8 w-px bg-navy-700" />

        <button
          onClick={() => checkPriceAlerts()}
          className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-gold-400 transition-colors"
          title="刷新数据"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button className="relative p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-gold-400 transition-colors">
          <Bell className="w-5 h-5" />
          {triggeredAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-loss rounded-full text-xs text-white flex items-center justify-center animate-pulse-loss">
              {triggeredAlerts.length}
            </span>
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-gold-400 transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>

        <button className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-gold-400 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-navy-700" />

        <div className="flex items-center gap-3 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-sm">
            <User className="w-5 h-5 text-navy-900" />
          </div>
          <div>
            <p className="text-sm font-medium text-navy-100">稳健投资者</p>
            <p className="text-xs text-gold-400">黄金会员</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(" ");
}
