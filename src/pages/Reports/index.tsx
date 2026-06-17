import { useState } from "react";
import ReactECharts from "echarts-for-react";
import PageContainer from "@/components/layout/PageContainer";
import { useReportStore } from "@/stores/reportStore";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { formatMoney, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { monthlyReports, getMonthlyReport, exportReport } = useReportStore();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthlyReports[0]?.month || ""
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const currentReport = getMonthlyReport(selectedMonth);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    exportReport(selectedMonth, exportFormat);
    setIsExporting(false);
    setShowExportModal(false);
  };

  const statusConfig = {
    ready: {
      icon: CheckCircle2,
      color: "text-profit",
      bgColor: "bg-profit/10",
      label: "已生成",
    },
    generating: {
      icon: Clock,
      color: "text-gold-400",
      bgColor: "bg-gold-500/10",
      label: "生成中",
    },
    failed: {
      icon: AlertCircle,
      color: "text-loss",
      bgColor: "bg-loss/10",
      label: "生成失败",
    },
  };

  const assetAllocationOption = currentReport
    ? {
        backgroundColor: "transparent",
        animation: true,
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderColor: "#334155",
          textStyle: { color: "#E2E8F0", fontSize: 12 },
          formatter: (params: any) => {
            return `<div style="padding: 4px;"><strong>${params.name}</strong><br/>金额: ${formatMoney(
              params.value
            )}<br/>占比: ${params.percent}%</div>`;
          },
        },
        legend: {
          orient: "vertical",
          right: "5%",
          top: "center",
          textStyle: { color: "#94A3B8", fontSize: 11 },
        },
        series: [
          {
            type: "pie",
            radius: ["45%", "70%"],
            center: ["35%", "50%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: "#0F172A",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: "bold",
                color: "#D4AF37",
                formatter: (params: any) => `${params.name}\n${params.percent}%`,
              },
            },
            labelLine: {
              show: false,
            },
            data: currentReport.assetAllocation.map((item, index) => ({
              value: item.value,
              name: item.category,
              itemStyle: {
                color: ["#D4AF37", "#60A5FA", "#34D399"][index % 3],
              },
            })),
          },
        ],
      }
    : null;

  const profitTrendOption = currentReport
    ? {
        backgroundColor: "transparent",
        animation: true,
        grid: {
          left: "60px",
          right: "20px",
          top: "30px",
          bottom: "30px",
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderColor: "#334155",
          textStyle: { color: "#E2E8F0", fontSize: 12 },
        },
        xAxis: {
          type: "category",
          data: ["第1周", "第2周", "第3周", "第4周"],
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: { color: "#94A3B8", fontSize: 10 },
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: "#334155" } },
          axisLabel: {
            color: "#94A3B8",
            fontSize: 10,
            formatter: (v: number) => formatPercent(v, 2, false),
          },
          splitLine: { lineStyle: { color: "#1E293B" } },
        },
        series: [
          {
            type: "bar",
            data: [2.3, -1.2, 4.5, 1.5],
            itemStyle: {
              color: (params: any) =>
                params.value >= 0 ? "#10B981" : "#EF4444",
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
      }
    : null;

  return (
    <PageContainer
      title="报告中心"
      subtitle="月度投资报告，全面分析您的投资表现"
      action={
        <button
          onClick={() => setShowExportModal(true)}
          disabled={!currentReport || currentReport.status !== "ready"}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出报告
        </button>
      }
    >
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-3">
          <h3 className="text-sm font-medium text-navy-400 mb-4">月度报告列表</h3>
          {monthlyReports.map((report, index) => {
            const StatusIcon = statusConfig[report.status].icon;
            return (
              <div
                key={report.month}
                onClick={() =>
                  report.status === "ready" && setSelectedMonth(report.month)
                }
                className={cn(
                  "glass-card p-4 cursor-pointer transition-all",
                  selectedMonth === report.month &&
                    report.status === "ready" &&
                    "border-gold-500/50 shadow-gold-sm",
                  report.status !== "ready" && "opacity-60 cursor-not-allowed"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        statusConfig[report.status].bgColor
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          "w-4 h-4",
                          statusConfig[report.status].color
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-navy-100">
                        {report.month}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          statusConfig[report.status].color
                        )}
                      >
                        {statusConfig[report.status].label}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy-600" />
                </div>
                {report.status === "ready" && (
                  <div className="mt-3 pt-3 border-t border-navy-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-navy-500">收益率</span>
                      <span
                        className={cn(
                          "text-sm font-mono font-medium",
                          report.profitRate >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {report.profitRate >= 0 ? "+" : ""}
                        {formatPercent(report.profitRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-navy-500">净利润</span>
                      <span
                        className={cn(
                          "text-sm font-mono font-medium",
                          report.netProfit >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {report.netProfit >= 0 ? "+" : ""}
                        {formatMoney(report.netProfit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="col-span-3 space-y-6">
          {currentReport && currentReport.status === "ready" ? (
            <>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-gold-400" />
                    <div>
                      <h3 className="font-serif font-semibold text-navy-100 text-lg">
                        {currentReport.month} 投资月报
                      </h3>
                      <p className="text-sm text-navy-500">
                        全面分析您的投资表现与资产配置
                      </p>
                    </div>
                  </div>
                  <span className="badge-gold">
                    {currentReport.month}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-navy-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-gold-400" />
                      <span className="text-xs text-navy-500">期末总资产</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-navy-100">
                      {formatMoney(currentReport.endingAssets)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-navy-500">期初总资产</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-navy-100">
                      {formatMoney(currentReport.beginningAssets)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-profit" />
                      <span className="text-xs text-navy-500">净利润</span>
                    </div>
                    <p
                      className={cn(
                        "text-xl font-bold font-mono",
                        currentReport.netProfit >= 0
                          ? "text-profit"
                          : "text-loss"
                      )}
                    >
                      {currentReport.netProfit >= 0 ? "+" : ""}
                      {formatMoney(currentReport.netProfit)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-gold-400" />
                      <span className="text-xs text-navy-500">收益率</span>
                    </div>
                    <p
                      className={cn(
                        "text-xl font-bold font-mono",
                        currentReport.profitRate >= 0
                          ? "text-profit"
                          : "text-loss"
                      )}
                    >
                      {currentReport.profitRate >= 0 ? "+" : ""}
                      {formatPercent(currentReport.profitRate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif font-semibold text-navy-100">
                      资产配置
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    {assetAllocationOption && (
                      <ReactECharts
                        option={assetAllocationOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "canvas" }}
                      />
                    )}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif font-semibold text-navy-100">
                      周度收益
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    {profitTrendOption && (
                      <ReactECharts
                        option={profitTrendOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "canvas" }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-serif font-semibold text-navy-100 mb-4">
                  持仓明细
                </h3>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>股票</th>
                        <th className="text-right">持仓数量</th>
                        <th className="text-right">市值</th>
                        <th className="text-right">盈亏</th>
                        <th className="text-right">收益率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReport.positionDetails.map((pos, index) => (
                        <tr
                          key={pos.symbol}
                          className="table-row-hover"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-navy-100">
                                {pos.stockName}
                              </p>
                              <p className="text-xs text-navy-500 font-mono">
                                {pos.symbol}
                              </p>
                            </div>
                          </td>
                          <td className="text-right font-mono text-navy-200">
                            {pos.quantity.toLocaleString()}
                          </td>
                          <td className="text-right font-mono text-navy-200">
                            {formatMoney(pos.marketValue)}
                          </td>
                          <td
                            className={cn(
                              "text-right font-mono",
                              pos.profit >= 0 ? "text-profit" : "text-loss"
                            )}
                          >
                            {pos.profit >= 0 ? "+" : ""}
                            {formatMoney(pos.profit)}
                          </td>
                          <td
                            className={cn(
                              "text-right font-mono",
                              pos.profitRate >= 0 ? "text-profit" : "text-loss"
                            )}
                          >
                            {pos.profitRate >= 0 ? "+" : ""}
                            {formatPercent(pos.profitRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-serif font-semibold text-navy-100 mb-4">
                  交易记录
                </h3>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>股票</th>
                        <th className="text-center">类型</th>
                        <th className="text-right">金额</th>
                        <th className="text-right">手续费</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReport.tradeHistory.map((trade, index) => (
                        <tr
                          key={index}
                          className="table-row-hover"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="text-navy-300">{trade.date}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-navy-100">
                                {trade.stockName}
                              </p>
                              <p className="text-xs text-navy-500 font-mono">
                                {trade.symbol}
                              </p>
                            </div>
                          </td>
                          <td className="text-center">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                                trade.type === "buy"
                                  ? "bg-profit/10 text-profit"
                                  : "bg-loss/10 text-loss"
                              )}
                            >
                              {trade.type === "buy" ? "买入" : "卖出"}
                            </span>
                          </td>
                          <td className="text-right font-mono text-navy-200">
                            {formatMoney(trade.amount)}
                          </td>
                          <td className="text-right font-mono text-navy-400">
                            {formatMoney(trade.fee)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-navy-700">
                  <h4 className="text-sm font-medium text-navy-400 mb-3">
                    费用明细
                  </h4>
                  <div className="flex gap-4">
                    {currentReport.feeDetails.map((fee) => (
                      <div
                        key={fee.type}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800/50"
                      >
                        <span className="text-xs text-navy-500">
                          {fee.type}
                        </span>
                        <span className="text-sm font-mono text-navy-300">
                          {formatMoney(fee.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <FileText className="w-16 h-16 text-navy-600 mx-auto mb-4" />
              <p className="text-lg text-navy-400">请选择一个月份查看报告</p>
              <p className="text-sm text-navy-500 mt-2">
                点击左侧列表中的月份卡片查看详细报告
              </p>
            </div>
          )}
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-semibold text-navy-100">
                导出报告
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg hover:bg-navy-700 text-navy-400 hover:text-navy-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-navy-400 block mb-2">
                  报告月份
                </label>
                <div className="px-4 py-3 rounded-lg bg-navy-800/50 border border-navy-700">
                  <span className="font-medium text-navy-100">
                    {selectedMonth}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-navy-400 block mb-2">
                  导出格式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      exportFormat === "pdf"
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-navy-700 bg-navy-800/50 hover:border-navy-600"
                    )}
                  >
                    <FileText
                      className={cn(
                        "w-6 h-6 mb-2",
                        exportFormat === "pdf"
                          ? "text-gold-400"
                          : "text-navy-500"
                      )}
                    />
                    <p
                      className={cn(
                        "font-medium",
                        exportFormat === "pdf"
                          ? "text-gold-400"
                          : "text-navy-300"
                      )}
                    >
                      PDF 格式
                    </p>
                    <p className="text-xs text-navy-500 mt-1">
                      适合打印和阅读
                    </p>
                  </button>
                  <button
                    onClick={() => setExportFormat("excel")}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      exportFormat === "excel"
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-navy-700 bg-navy-800/50 hover:border-navy-600"
                    )}
                  >
                    <BarChart3
                      className={cn(
                        "w-6 h-6 mb-2",
                        exportFormat === "excel"
                          ? "text-gold-400"
                          : "text-navy-500"
                      )}
                    />
                    <p
                      className={cn(
                        "font-medium",
                        exportFormat === "excel"
                          ? "text-gold-400"
                          : "text-navy-300"
                      )}
                    >
                      Excel 格式
                    </p>
                    <p className="text-xs text-navy-500 mt-1">
                      适合数据分析
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-navy-700">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-secondary flex-1"
                disabled={isExporting}
              >
                取消
              </button>
              <button
                onClick={handleExport}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    确认导出
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
