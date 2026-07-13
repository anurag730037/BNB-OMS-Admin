import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  getOverviewStats,
  getStatusRatios as fetchStatusRatios,
  getRecentOrders as fetchRecentOrders,
  getBusinessReports,
  getTopRegions as fetchTopRegions,
  getOperationalInsights,
  getTopProducts as fetchTopProducts,
  getTopRetailers,
} from "../../api/dashboard/dashboard";
import toast from "react-hot-toast";

// Reusable Components
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { SectionCard } from "../../components/dashboard/SectionCard";

// Lucide Icons
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  RefreshCw,
  Download,
  Bell,
  Package,
  Store,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

type RecentOrder = {
  _id: string;
  retailerId: {
    shopName: string;
    ownerName: string;
  } | null;
  totalkg: number;
  status: string;
  items: any[];
  createdAt: string;
};

type RegionItem = {
  name: string;
  retailers: number;
  orders: number;
  totalKg: number;
};

type DormantRetailer = {
  _id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  lastOrderDate: string | null;
  daysInactive: number | null;
};

type TopProduct = {
  _id: string;
  name: string;
  totalKg: number;
};

type TopRetailer = {
  _id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  totalWeight: number;
  totalOrders: number;
  lastOrderDate: string;
};

type LowStockAlert = {
  _id: string;
  name: string;
  totalWeight: number;
};

type ReportData = {
  count: number;
  totalKg: number;
  deliveredKg: number;
  trend?: { label: string; weight: number; orders: number }[];
};

type ReportsStats = {
  today: ReportData;
  week: ReportData;
  month: ReportData;
  year: ReportData;
};

type LoadingStates = {
  overview: boolean;
  statusRatios: boolean;
  recentOrders: boolean;
  reports: boolean;
  topRegions: boolean;
  insights: boolean;
  topProducts: boolean;
  topRetailers: boolean;
};

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    overview: true,
    statusRatios: true,
    recentOrders: true,
    reports: true,
    topRegions: true,
    insights: true,
    topProducts: true,
    topRetailers: true,
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeRetailers: 0,
    deliveredKg: 0,
    totalProducts: 0,
    avgWeight: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingOrdersList, setPendingOrdersList] = useState<RecentOrder[]>([]);
  const [topRegions, setTopRegions] = useState<RegionItem[]>([]);
  const [dormantRetailers, setDormantRetailers] = useState<DormantRetailer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topRetailers, setTopRetailers] = useState<TopRetailer[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);

  const [reports, setReports] = useState<ReportsStats>({
    today: { count: 0, totalKg: 0, deliveredKg: 0 },
    week: { count: 0, totalKg: 0, deliveredKg: 0 },
    month: { count: 0, totalKg: 0, deliveredKg: 0 },
    year: { count: 0, totalKg: 0, deliveredKg: 0 },
  });

  const [activeReportTab, setActiveReportTab] = useState<"today" | "week" | "month" | "year">("today");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const fetchDashboardData = async () => {
    setLoadingStates({
      overview: true,
      statusRatios: true,
      recentOrders: true,
      reports: true,
      topRegions: true,
      insights: true,
      topProducts: true,
      topRetailers: true,
    });

    const results = await Promise.allSettled([
      getOverviewStats(),          // 0
      fetchStatusRatios(),         // 1
      fetchRecentOrders(),         // 2
      getBusinessReports(),        // 3
      fetchTopRegions(),           // 4
      getOperationalInsights(),    // 5
      fetchTopProducts(),          // 6
      getTopRetailers(),           // 7
    ]);

    // 0: Overview Stats
    if (results[0].status === "fulfilled" && results[0].value.success) {
      setStats(results[0].value.stats);
    } else {
      toast.error("Failed to load overview stats");
    }
    setLoadingStates((prev) => ({ ...prev, overview: false }));

    // 1: Status Ratios
    setLoadingStates((prev) => ({ ...prev, statusRatios: false }));

    // 2: Recent Orders + Pending
    if (results[2].status === "fulfilled" && results[2].value.success) {
      setRecentOrders(results[2].value.recentOrders);
      setPendingOrdersList(results[2].value.pendingOrdersList || []);
    }
    setLoadingStates((prev) => ({ ...prev, recentOrders: false }));

    // 3: Business Reports
    if (results[3].status === "fulfilled" && results[3].value.success) {
      setReports(
        results[3].value.reports || {
          today: { count: 0, totalKg: 0, deliveredKg: 0 },
          week: { count: 0, totalKg: 0, deliveredKg: 0 },
          month: { count: 0, totalKg: 0, deliveredKg: 0 },
          year: { count: 0, totalKg: 0, deliveredKg: 0 },
        }
      );
    }
    setLoadingStates((prev) => ({ ...prev, reports: false }));

    // 4: Top Regions
    if (results[4].status === "fulfilled" && results[4].value.success) {
      setTopRegions(results[4].value.topRegions || []);
    }
    setLoadingStates((prev) => ({ ...prev, topRegions: false }));

    // 5: Operational Insights (dormant, lowStockAlerts)
    if (results[5].status === "fulfilled" && results[5].value.success) {
      setDormantRetailers(results[5].value.dormantRetailers || []);
      setLowStockAlerts(results[5].value.lowStockAlerts || []);
    }
    setLoadingStates((prev) => ({ ...prev, insights: false }));

    // 6: Top Products
    if (results[6].status === "fulfilled" && results[6].value.success) {
      setTopProducts(results[6].value.topProducts || []);
    }
    setLoadingStates((prev) => ({ ...prev, topProducts: false }));

    // 7: Top Retailers
    if (results[7].status === "fulfilled" && results[7].value.success) {
      setTopRetailers(results[7].value.topRetailers || []);
    }
    setLoadingStates((prev) => ({ ...prev, topRetailers: false }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const regionsTotals = useMemo(() => {
    let totalKg = 0;
    let totalOrders = 0;
    topRegions.forEach((r) => {
      totalKg += r.totalKg;
      totalOrders += r.orders;
    });
    return { totalKg: totalKg || 1, totalOrders: totalOrders || 1 };
  }, [topRegions]);

  const showSlimApprovalNotice = pendingOrdersList.length === 0;

  // Memoized Chart data generator for Sales Volume Trend
  const salesTrendData = useMemo(() => {
    const currentReport = reports[activeReportTab];
    if (currentReport && currentReport.trend) {
      return currentReport.trend;
    }

    const total = currentReport?.totalKg || 0;
    const count = currentReport?.count || 0;

    if (activeReportTab === "today") {
      const distribution = [0.1, 0.25, 0.35, 0.15, 0.1, 0.05];
      return [
        { label: "08:00 AM", weight: Math.round(total * distribution[0]), orders: Math.round(count * distribution[0]) },
        { label: "10:00 AM", weight: Math.round(total * distribution[1]), orders: Math.round(count * distribution[1]) },
        { label: "12:00 PM", weight: Math.round(total * distribution[2]), orders: Math.round(count * distribution[2]) },
        { label: "02:00 PM", weight: Math.round(total * distribution[3]), orders: Math.round(count * distribution[3]) },
        { label: "04:00 PM", weight: Math.round(total * distribution[4]), orders: Math.round(count * distribution[4]) },
        { label: "06:00 PM", weight: Math.round(total * distribution[5]), orders: Math.round(count * distribution[5]) },
      ];
    } else if (activeReportTab === "week") {
      const distribution = [0.12, 0.15, 0.18, 0.14, 0.16, 0.15, 0.1];
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return labels.map((l, i) => ({
        label: l,
        weight: Math.round(total * distribution[i]),
        orders: Math.round(count * distribution[i]),
      }));
    } else if (activeReportTab === "month") {
      const distribution = [0.22, 0.28, 0.24, 0.26];
      const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      return labels.map((l, i) => ({
        label: l,
        weight: Math.round(total * distribution[i]),
        orders: Math.round(count * distribution[i]),
      }));
    } else {
      const distribution = [0.06, 0.07, 0.08, 0.09, 0.08, 0.1, 0.09, 0.11, 0.09, 0.08, 0.07, 0.08];
      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return labels.map((l, i) => ({
        label: l,
        weight: Math.round(total * distribution[i]),
        orders: Math.round(count * distribution[i]),
      }));
    }
  }, [activeReportTab, reports]);

  // Export report to CSV
  const handleExportData = () => {
    const currentReport = reports[activeReportTab];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Report Period,Total Orders,Total Weight (kg),Delivered Weight (kg)\n" +
      `${activeReportTab},${currentReport.count},${currentReport.totalKg},${currentReport.deliveredKg}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BNB_Volume_Report_${activeReportTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Successfully exported volume metrics report!`);
  };

  // SVG dimensions for Sales Volume Trend Chart
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = 35;

  const salesPathData = useMemo(() => {
    if (salesTrendData.length === 0) return { linePath: "", areaPath: "", coordinates: [] };
    const maxWeight = Math.max(...salesTrendData.map((d) => d.weight), 1);

    const coordinates = salesTrendData.map((d, index) => {
      const x = padding + (index * (svgWidth - padding * 2)) / (salesTrendData.length - 1);
      const y = svgHeight - padding - (d.weight / maxWeight) * (svgHeight - padding * 1.8);
      return { x, y };
    });

    let linePath = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const curr = coordinates[i];
      const next = coordinates[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${svgHeight - padding} L ${
      coordinates[0].x
    } ${svgHeight - padding} Z`;

    return { linePath, areaPath, coordinates };
  }, [salesTrendData]);

  return (
    <div
      className={`p-4 md:p-8 min-h-screen transition-colors duration-300 font-sans ${
        isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-[#2A2A2A]"
      }`}
    >
      {/* SECTION 1: Header */}
      <header
        className={`pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b ${
          isDark ? "border-[#222222]" : "border-[#E8E2D5]"
        }`}
      >
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
            Business Dashboard
          </h1>
          <p className="text-xs mt-1 opacity-70">
            Monitor weight logistics, manage pending orders, and track active customers & products across {topRegions.length} regions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportData}
            className={`px-4 py-2 text-xs font-bold border flex items-center gap-2 transition-all duration-200 cursor-pointer rounded-xl ${
              isDark
                ? "bg-[#181818] border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                : "bg-white border-[#E8E2D5] text-[#2A2A2A] hover:border-brand-maroon hover:text-brand-maroon"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className={`p-2 border rounded-xl flex items-center justify-center transition-all duration-200 ${
              isDark
                ? "bg-[#181818] border-[#2A2A2A] text-brand-beige hover:border-brand-gold"
                : "bg-white border-[#E8E2D5] text-[#2A2A2A] hover:border-brand-maroon"
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Operational Warnings / Alert Bar */}
      {(lowStockAlerts.length > 0 || dormantRetailers.length > 0) && (
        <section className="mb-6 flex flex-wrap gap-2">
          {lowStockAlerts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockAlerts.length} products low in stock weight threshold</span>
            </div>
          )}
          {dormantRetailers.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Store className="w-3.5 h-3.5" />
              <span>{dormantRetailers.length} retail accounts inactive (no recent orders)</span>
            </div>
          )}
        </section>
      )}

      {/* Slim Notice Banner if all orders approved */}
      {!loadingStates.recentOrders && showSlimApprovalNotice && (
        <div
          className={`p-3.5 border rounded-2xl flex items-center gap-2.5 mb-8 text-xs font-bold shadow-sm ${
            isDark
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
          <span>All orders approved. No pending actions required.</span>
        </div>
      )}

      {/* SECTION 2: Main KPI Cards (4) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Delivered Weight"
          value={`${stats.deliveredKg.toLocaleString()} kg`}
          subtitle="Total weight shipped successfully"
          icon={<Package className="w-5 h-5" />}
          isDark={isDark}
          loading={loadingStates.overview}
        />
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="Processed logistics shipments"
          icon={<ShoppingBag className="w-5 h-5" />}
          onClick={() => navigate("/orders")}
          isDark={isDark}
          loading={loadingStates.overview}
        />
        <DashboardCard
          title="Active Customers"
          value={stats.activeRetailers}
          subtitle="Registered retail stores"
          icon={<Users className="w-5 h-5" />}
          onClick={() => navigate("/retailers")}
          isDark={isDark}
          loading={loadingStates.overview}
        />
        <DashboardCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle={`${pendingOrdersList.length} orders awaiting approval`}
          icon={<Clock className="w-5 h-5" />}
          onClick={() => navigate("/orders?status=pending")}
          isDark={isDark}
          loading={loadingStates.recentOrders}
        />
      </section>

      {/* Pending Orders approval section */}
      {!loadingStates.recentOrders && !showSlimApprovalNotice && (
        <section className="mb-8">
          <div
            className={`p-6 border rounded-2xl border-l-4 w-full shadow-sm ${
              isDark
                ? "bg-[#181818] border-[#2A2A2A] border-l-yellow-500"
                : "bg-white border-[#E8E2D5] border-l-brand-maroon"
            }`}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-dashed border-gray-500/10">
              <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>Orders Requiring Quick Approval</span>
              </h2>
              <span
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                  isDark ? "bg-yellow-500/10 text-yellow-400" : "bg-brand-maroon/10 text-brand-maroon"
                }`}
              >
                {pendingOrdersList.length} Awaiting
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto pr-1">
              {pendingOrdersList.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer hover:-translate-y-0.5 hover:shadow-sm hover:border-brand-gold/60 transition-all ${
                    isDark ? "bg-[#111111] border-[#222222]" : "bg-[#F9F7F2] border-[#E8E2D5]"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-brand-gold truncate block">
                      {order.retailerId?.shopName || "Unknown Shop"}
                    </span>
                    <span className="text-gray-400 text-[10px] block mt-0.5 font-mono">
                      {order.totalkg} kg total weight
                    </span>
                    <span className="text-gray-500 text-[9px] block mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(order.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase flex-shrink-0 text-brand-gold`}>
                    Approve →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: Sales Trend Chart */}
      <section className="mb-8">
        {loadingStates.reports ? (
          <div
            className={`p-6 border rounded-2xl h-80 animate-pulse ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}
          />
        ) : (
          <SectionCard
            title="Sales Volume Trend (kg)"
            icon={<TrendingUp className="w-4.5 h-4.5" />}
            isDark={isDark}
            headerBorder={true}
            actions={
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-gray-500/5 items-center gap-0.5">
                {(["today", "week", "month", "year"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveReportTab(tab)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all duration-150 ${
                      activeReportTab === tab
                        ? isDark
                          ? "bg-brand-gold text-[#111] shadow"
                          : "bg-brand-maroon text-white shadow"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    }`}
                  >
                    {tab === "today" ? "Day" : tab === "week" ? "Week" : tab === "month" ? "Month" : "Year"}
                  </button>
                ))}
              </div>
            }
          >
            <div className="w-full overflow-hidden">
              <div className="relative w-full h-[220px]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="salesChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isDark ? "#D4AF37" : "#800020"} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={isDark ? "#D4AF37" : "#800020"} stopOpacity={0.005} />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const y = padding + (i * (svgHeight - padding * 2)) / 3;
                    return (
                      <line
                        key={i}
                        x1={padding}
                        y1={y}
                        x2={svgWidth - padding}
                        y2={y}
                        stroke={isDark ? "#2A2A2A" : "#E8E2D5"}
                        strokeWidth="1"
                        strokeDasharray="4 6"
                      />
                    );
                  })}

                  {/* Area fill */}
                  {salesPathData.areaPath && (
                    <path d={salesPathData.areaPath} fill="url(#salesChartGradient)" />
                  )}

                  {/* Line path */}
                  {salesPathData.linePath && (
                    <path
                      d={salesPathData.linePath}
                      fill="none"
                      stroke={isDark ? "#D4AF37" : "#800020"}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data circle values */}
                  {salesPathData.coordinates.map((c, i) => (
                    <g key={i}>
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="4"
                        fill={isDark ? "#D4AF37" : "#800020"}
                        stroke={isDark ? "#111111" : "#FFFFFF"}
                        strokeWidth="1.5"
                      />
                      <text
                        x={c.x}
                        y={c.y - 10}
                        textAnchor="middle"
                        fontSize="9px"
                        fontWeight="extrabold"
                        fill={isDark ? "#E8E2D5" : "#2A2A2A"}
                      >
                        {salesTrendData[i].weight} kg
                      </text>
                    </g>
                  ))}

                  {/* X-axis labels */}
                  {salesTrendData.map((d, index) => {
                    const x = padding + (index * (svgWidth - padding * 2)) / (salesTrendData.length - 1);
                    return (
                      <text
                        key={index}
                        x={x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        fontSize="9px"
                        fontWeight="bold"
                        fill="#7A7263"
                      >
                        {d.label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>
          </SectionCard>
        )}
      </section>

      {/* Split Content layout (Left 2/3: Recent Orders Table, Right 1/3: Top Customers & Best Selling Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2/3): Recent Orders Table */}
        <div className="lg:col-span-2">
          {loadingStates.recentOrders ? (
            <div
              className={`p-6 border rounded-2xl h-80 animate-pulse ${
                isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
            />
          ) : (
            <SectionCard
              title="Recent Orders"
              icon={<ShoppingBag className="w-4.5 h-4.5" />}
              isDark={isDark}
              actions={
                <button
                  onClick={() => navigate("/orders")}
                  className={`text-xs font-bold flex items-center gap-1 hover:underline ${
                    isDark ? "text-brand-gold" : "text-brand-maroon"
                  }`}
                >
                  <span>All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              }
            >
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-gray-400 border-gray-500/10 uppercase font-black tracking-wider text-[9px] pb-3">
                      <th className="pb-3.5 font-bold">Order ID</th>
                      <th className="pb-3.5 font-bold">Customer Name</th>
                      <th className="pb-3.5 font-bold">Total Weight</th>
                      <th className="pb-3.5 font-bold">Status</th>
                      <th className="pb-3.5 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500/10 dark:divide-gray-700/20">
                    {recentOrders.map((order) => {
                      const isExpanded = expandedOrders[order._id];

                      return (
                        <React.Fragment key={order._id}>
                          <tr
                            className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => toggleOrderExpand(order._id)}
                          >
                            <td className="py-4 font-mono font-bold text-gray-500 dark:text-gray-400">
                              #{order._id.substring(order._id.length - 8)}
                            </td>
                            <td className="py-4 font-bold text-brand-charcoal dark:text-brand-cream">
                              {order.retailerId?.shopName || "Deleted Customer"}
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 block font-normal normal-case">
                                {order.retailerId?.ownerName || "Unknown"}
                              </span>
                            </td>
                            <td className="py-4 font-extrabold text-[#2A2A2A] dark:text-[#E8E2D5]">
                              <span>{order.totalkg} kg</span>
                              <span className="text-[10px] font-medium text-gray-400 block mt-0.5">
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                              </span>
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2.5 py-0.5 text-[9px] uppercase font-black tracking-widest border rounded-full ${
                                  order.status === "pending"
                                    ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                    : order.status === "approved"
                                    ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                    : order.status === "packed"
                                    ? "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                                    : order.status === "delivered"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 font-bold text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className={isDark ? "bg-black/15" : "bg-[#F9F7F2]/40"}>
                              <td colSpan={5} className="p-4 border-b border-gray-500/10">
                                <div className="pl-4 py-2">
                                  <h4 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-2.5 text-brand-maroon dark:text-brand-gold">
                                    Items Detail Summary ({order.items.length})
                                  </h4>
                                  <div
                                    className={`border overflow-hidden rounded-xl ${
                                      isDark ? "bg-[#111111] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                                    }`}
                                  >
                                    <table className="w-full text-left text-[11px] border-collapse">
                                      <thead>
                                        <tr
                                          className={`border-b text-gray-500 uppercase font-bold text-[9px] ${
                                            isDark ? "border-[#2A2A2A] bg-black/40" : "border-[#E8E2D5] bg-[#ECE8DF]/20"
                                          }`}
                                        >
                                          <th className="p-3">Product Name</th>
                                          <th className="p-3 text-center">Packet Size</th>
                                          <th className="p-3 text-right">Quantity (Kg)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-500/10 dark:divide-gray-700/20">
                                        {order.items.map((item, idx) => (
                                          <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="p-3 font-semibold">
                                              {item.productId?.name || "Deleted Product"}
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold">{item.packetSize}</td>
                                            <td className="p-3 text-right font-extrabold text-brand-maroon dark:text-brand-gold">
                                              {item.quantityKg} kg
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        {/* Regions Distribution Widget */}
        <div className="mt-6">
          {loadingStates.topRegions ? (
            <div
              className={`p-6 border rounded-2xl h-80 animate-pulse ${
                isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
            />
          ) : (
            <SectionCard
              title="Regions Weight & Orders Distribution"
              icon={<Store className="w-4.5 h-4.5" />}
              isDark={isDark}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topRegions.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2 text-center col-span-2">No region data available</p>
                ) : (
                  topRegions.map((region, idx) => {
                    const weightPercent = Math.round((region.totalKg / regionsTotals.totalKg) * 100);
                    const ordersPercent = Math.round((region.orders / regionsTotals.totalOrders) * 100);

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isDark
                            ? "bg-[#181818] border-[#222222] hover:border-brand-gold/40"
                            : "bg-white border-[#E8E2D5] hover:border-brand-maroon/40"
                        }`}
                      >
                        <h4 className="font-bold text-sm text-brand-maroon dark:text-brand-gold mb-3 flex justify-between items-center">
                          <span>{region.name}</span>
                          <span className="text-[10px] bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded font-normal font-sans">
                            {region.retailers} retailer{region.retailers > 1 ? "s" : ""}
                          </span>
                        </h4>

                        <div className="space-y-3.5">
                          {/* Weight Metric */}
                          <div>
                            <div className="flex justify-between text-xs mb-1 font-semibold">
                              <span className="text-gray-400">Total Shipped Weight</span>
                              <span>
                                {region.totalKg.toLocaleString()} kg ({weightPercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-500/10 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isDark ? "bg-gradient-to-r from-yellow-600 to-brand-gold" : "bg-gradient-to-r from-rose-800 to-brand-maroon"
                                }`}
                                style={{ width: `${weightPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Orders Metric */}
                          <div>
                            <div className="flex justify-between text-xs mb-1 font-semibold">
                              <span className="text-gray-400">Total Orders Shipped</span>
                              <span>
                                {region.orders} ({ordersPercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-500/10 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${ordersPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Right Column (1/3): Top Retailers, Inactive Retailers & Best Selling Products */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* SECTION 5: Top Retailers Section */}
        {loadingStates.topRetailers ? (
          <div
            className={`p-6 border rounded-2xl h-60 animate-pulse ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}
          />
        ) : (
          <SectionCard title="Top Retailers" icon={<Users className="w-4.5 h-4.5" />} isDark={isDark}>
            <div className="space-y-3.5">
              {topRetailers.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2 text-center">No active customer orders</p>
              ) : (
                topRetailers.map((ret) => (
                  <div
                    key={ret._id}
                    className={`p-3 rounded-xl border flex justify-between items-center text-xs transition-all ${
                      isDark
                        ? "bg-[#181818] border-[#222222] hover:border-brand-gold/40"
                        : "bg-white border-[#E8E2D5] hover:border-brand-maroon/40"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold block truncate max-w-40 text-brand-charcoal dark:text-brand-cream">
                        {ret.shopName}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {ret.totalOrders} order{ret.totalOrders > 1 ? "s" : ""} · Last: {ret.lastOrderDate ? new Date(ret.lastOrderDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <span className="font-extrabold text-brand-maroon dark:text-brand-gold text-right flex-shrink-0">
                      {ret.totalWeight.toLocaleString()} kg
                    </span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        )}

        {/* SECTION: Inactive Retailers Section */}
        {loadingStates.insights ? (
          <div
            className={`p-6 border rounded-2xl h-60 animate-pulse ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}
          />
        ) : (
          <SectionCard
            title="Inactive Retailers"
            icon={<AlertTriangle className="w-4.5 h-4.5 text-amber-500" />}
            isDark={isDark}
          >
            <div className="space-y-3.5">
              {dormantRetailers.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2 text-center">No inactive retailers</p>
              ) : (
                dormantRetailers.map((ret) => (
                  <div
                    key={ret._id}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 text-xs transition-all ${
                      isDark
                        ? "bg-[#181818] border-[#222222] hover:border-brand-gold/40"
                        : "bg-white border-[#E8E2D5] hover:border-brand-maroon/40"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold block truncate max-w-40 text-brand-charcoal dark:text-brand-cream">
                        {ret.shopName}
                      </span>
                      <span className="font-mono text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                        {ret.daysInactive !== null ? `${ret.daysInactive}d inactive` : "No orders"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{ret.ownerName}</span>
                      <span>{ret.phone}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        )}

        {/* SECTION 6: Best Selling Products Section */}
        {loadingStates.topProducts ? (
          <div
            className={`p-6 border rounded-2xl h-60 animate-pulse ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}
          />
        ) : (
          <SectionCard title="Best Selling Products" icon={<Package className="w-4.5 h-4.5" />} isDark={isDark}>
            <div className="space-y-3.5">
              {topProducts.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2 text-center">No sales products found</p>
              ) : (
                topProducts.slice(0, 5).map((p) => {
                  return (
                    <div
                      key={p._id}
                      className={`p-3 rounded-xl border flex justify-between items-center text-xs transition-all ${
                        isDark ? "bg-[#181818] border-[#222222] hover:border-brand-gold/40" : "bg-white border-[#E8E2D5] hover:border-brand-maroon/40"
                      }`}
                    >
                      <span className="font-bold truncate max-w-40 text-brand-charcoal dark:text-brand-cream">
                        {p.name}
                      </span>
                      <span className="font-extrabold text-brand-maroon dark:text-brand-gold text-right flex-shrink-0">
                        {p.totalKg.toLocaleString()} kg
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  </div>
  );
};

export default Dashboard;