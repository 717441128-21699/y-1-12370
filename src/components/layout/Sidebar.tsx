import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Brain,
  TrendingUp,
  BarChart3,
  PlayCircle,
  Crown,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LineChart,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { path: "/market", label: "行情中心", icon: TrendingUp },
  { path: "/analysis/600519", label: "技术分析", icon: BarChart3 },
  { path: "/simulation", label: "模拟交易", icon: PlayCircle },
  { path: "/reports", label: "报告中心", icon: FileBarChart },
  { path: "/admin", label: "管理后台", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-navy-800/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <TrendingUp className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-gold-gradient">
                财富智投
              </h1>
              <p className="text-xs text-navy-400">专业投资管理平台</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-gold-400 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                active
                  ? "text-gold-400 bg-gold-500/10 border-l-2 border-gold-500 shadow-gold-sm"
                  : "text-navy-200 hover:text-gold-400 hover:bg-gold-500/5"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-gold-500 animate-pulse-gold" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className={cn("glass-card p-3", collapsed && "justify-center")}>
          {!collapsed ? (
            <div>
              <p className="text-xs text-navy-400 mb-1">当前版本</p>
              <p className="text-sm font-medium text-gold-400">v2.1.0</p>
              <p className="text-xs text-navy-500 mt-1">已更新所有模块</p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gold-gradient/20 flex items-center justify-center">
              <span className="text-gold-500 font-bold text-xs">v2</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
