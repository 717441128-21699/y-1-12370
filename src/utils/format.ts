export const formatMoney = (value: number, decimals = 2): string => {
  if (Math.abs(value) >= 1e8) {
    return `¥${(value / 1e8).toFixed(decimals)}亿`;
  }
  if (Math.abs(value) >= 1e4) {
    return `¥${(value / 1e4).toFixed(decimals)}万`;
  }
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (value: number, decimals = 2, withSign = true): string => {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatVolume = (value: number): string => {
  if (Math.abs(value) >= 1e8) {
    return `${(value / 1e8).toFixed(2)}亿`;
  }
  if (Math.abs(value) >= 1e4) {
    return `${(value / 1e4).toFixed(2)}万`;
  }
  return value.toString();
};

export const formatDate = (date: string | Date, format = "YYYY-MM-DD"): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes);
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(date);
};

export const getProfitColor = (value: number): string => {
  if (value > 0) return "text-profit-glow";
  if (value < 0) return "text-loss-glow";
  return "text-navy-300";
};

export const getProfitBgColor = (value: number): string => {
  if (value > 0) return "bg-profit/10";
  if (value < 0) return "bg-loss/10";
  return "bg-navy-700";
};

export const formatMemberLevel = (level: string): string => {
  const map: Record<string, string> = {
    bronze: "青铜",
    silver: "白银",
    gold: "黄金",
    platinum: "铂金",
    diamond: "钻石",
  };
  return map[level] || level;
};

export const formatRiskLevel = (level: string): string => {
  const map: Record<string, string> = {
    conservative: "保守型",
    steady: "稳健型",
    balanced: "平衡型",
    aggressive: "进取型",
    radical: "激进型",
  };
  return map[level] || level;
};

export const formatNewsCategory = (category: string): string => {
  const map: Record<string, string> = {
    macro: "宏观",
    industry: "行业",
    stock: "个股",
    policy: "政策",
  };
  return map[category] || category;
};
