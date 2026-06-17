export type RiskLevel = "conservative" | "steady" | "balanced" | "aggressive" | "radical";

export type MemberLevel = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type AccountStatus = "active" | "inactive" | "syncing";

export type TransactionType = "buy" | "sell";

export type NewsCategory = "macro" | "industry" | "stock" | "policy";

export type AlertType = "price_up" | "price_down" | "percent_up" | "percent_down";

export type KLineType = "day" | "week" | "month";

export interface User {
  id: string;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface BrokerAccount {
  id: string;
  userId: string;
  brokerName: string;
  accountNumber: string;
  totalAssets: number;
  cashBalance: number;
  marketValue: number;
  totalProfit: number;
  totalProfitRate: number;
  status: AccountStatus;
  bindAt: string;
}

export interface Holding {
  id: string;
  accountId: string;
  symbol: string;
  stockName: string;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  marketValue: number;
  profit: number;
  profitRate: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  symbol: string;
  stockName: string;
  type: TransactionType;
  price: number;
  quantity: number;
  amount: number;
  fee: number;
  tradeAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  amount: number;
  turnover: number;
  pe: number;
  pb: number;
}

export interface KLineData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  macd?: number;
  dif?: number;
  dea?: number;
  rsi?: number;
  kdj_k?: number;
  kdj_d?: number;
  kdj_j?: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
}

export interface WatchlistStock {
  id: string;
  userId: string;
  symbol: string;
  stockName: string;
  groupName: string;
  sortOrder: number;
}

export interface Alert {
  id: string;
  userId?: string;
  symbol: string;
  stockName: string;
  alertType: AlertType;
  threshold: number;
  enabled: boolean;
  notifyChannel?: string;
  triggeredAt?: string;
  currentPrice?: number;
  changePercent?: number;
}

export interface Membership {
  id: string;
  userId: string;
  level: MemberLevel;
  monthlyTradeAmount: number;
  freeCommissionCount: number;
  researchReportCount: number;
  expireAt: string;
  upgradeProgress: number;
}

export interface SimAccount {
  id: string;
  userId: string;
  name: string;
  initialCapital: number;
  currentNetValue: number;
  availableCash: number;
  holdingValue: number;
  totalReturn: number;
  totalReturnRate: number;
  createdAt: string;
}

export interface SimTrade {
  id: string;
  simAccountId: string;
  symbol: string;
  stockName: string;
  type: TransactionType;
  price: number;
  quantity: number;
  amount: number;
  tradeAt: string;
}

export interface BacktestResult {
  id: string;
  simAccountId: string;
  strategyName: string;
  startDate: string;
  endDate: string;
  returnRate: number;
  totalReturn?: number;
  annualReturnRate: number;
  annualReturn?: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitLossRatio: number;
  totalTrades: number;
  profitTrades: number;
  winningTrades?: number;
  lossTrades: number;
  losingTrades?: number;
  equityCurve: { date: string; value: number }[];
  benchmarkCurve: { date: string; value: number }[];
  strategyParams?: {
    shortPeriod: number;
    longPeriod: number;
    signalPeriod: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
}

export interface News {
  id: string;
  title: string;
  source: string;
  category: NewsCategory;
  summary: string;
  content: string;
  heat: number;
  isHot: boolean;
  relatedStocks: string[];
  publishAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalAssets: number;
  boundAccounts: number;
  simTradeCount: number;
  simTradeCountToday: number;
  adImpressions: number;
  adClicks: number;
  adClickRate: number;
  dailyTrend: { date: string; users: number; assets: number; trades: number }[];
  membershipDistribution: { level: MemberLevel; count: number }[];
}

export interface RebalanceSuggestion {
  id: string;
  symbol: string;
  stockName: string;
  action: "buy" | "sell" | "hold";
  targetWeight: number;
  currentWeight: number;
  suggestedQuantity: number;
  expectedReturn: number;
  riskLevel: "low" | "medium" | "high";
  reason: string;
}

export interface MonthlyReport {
  month: string;
  status: "generating" | "ready" | "failed";
  totalAssets: number;
  beginningAssets: number;
  endingAssets: number;
  netProfit: number;
  profitRate: number;
  positionDetails: {
    symbol: string;
    stockName: string;
    quantity: number;
    marketValue: number;
    profit: number;
    profitRate: number;
  }[];
  assetAllocation: { category: string; value: number; ratio: number }[];
  tradeHistory: {
    date: string;
    symbol: string;
    stockName: string;
    type: TransactionType;
    amount: number;
    fee: number;
  }[];
  feeDetails: { type: string; amount: number }[];
}

export interface MarketForecast {
  hotSectors: {
    name: string;
    code: string;
    heatScore: number;
    confidence: number;
    relatedStocks: { symbol: string; name: string }[];
    reason: string;
  }[];
  styleRotation: {
    value: number;
    growth: number;
    cyclical: number;
    defensive: number;
    recommendation: string;
  };
  strategySuggestion: {
    title: string;
    description: string;
    risk: "low" | "medium" | "high";
    expectedReturn: string;
  };
}
