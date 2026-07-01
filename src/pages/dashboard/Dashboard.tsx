import React, { useEffect, useState } from "react";
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
} from "../../api/dashboard/dashboard";
import toast from "react-hot-toast";

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

type StatusRatio = {
  label: string;
  count: number;
  percent: number;
  color: string;
};

type LowStockAlert = {
  _id: string;
  name: string;
  totalWeight: number;
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

type AreaPackingLoad = {
  name: string;
  totalKg: number;
  ordersCount: number;
};

type ReportData = {
  count: number;
  totalKg: number;
  deliveredKg: number;
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
};

// Reusable skeleton loading placeholder for dashboard cards
const CardSkeleton: React.FC<{ isDark: boolean; className?: string }> = ({ isDark, className = "" }) => (
  <div className={`p-5 border rounded-xl animate-pulse ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
    } ${className}`}>
    <div className={`h-3 w-32 rounded mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    <div className="space-y-3">
      <div className={`h-6 w-20 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className={`h-3 w-full rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
      <div className={`h-3 w-3/4 rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
    </div>
  </div>
);

// Skeleton for the stat cards row (5 small cards)
const StatCardSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className={`p-4 border rounded-xl flex items-center gap-4 animate-pulse ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
    }`}>
    <div className={`p-3 rounded-xl w-11 h-11 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    <div className="space-y-2 flex-1">
      <div className={`h-2.5 w-16 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className={`h-5 w-10 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className={`h-2 w-24 rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
    </div>
  </div>
);

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
  const [statusRatios, setStatusRatios] = useState<StatusRatio[]>([]);
  const [topRegions, setTopRegions] = useState<RegionItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [dormantRetailers, setDormantRetailers] = useState<DormantRetailer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [areaPackingLoads, setAreaPackingLoads] = useState<AreaPackingLoad[]>([]);

  const [reports, setReports] = useState<ReportsStats>({
    today: { count: 0, totalKg: 0, deliveredKg: 0 },
    week: { count: 0, totalKg: 0, deliveredKg: 0 },
    month: { count: 0, totalKg: 0, deliveredKg: 0 },
    year: { count: 0, totalKg: 0, deliveredKg: 0 }
  });

  const [activeReportTab, setActiveReportTab] = useState<"today" | "week" | "month" | "year">("today");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [isRecentOrdersSectionExpanded, setIsRecentOrdersSectionExpanded] = useState(false);

  const fetchDashboardData = async () => {
    // Reset all loading states
    setLoadingStates({
      overview: true,
      statusRatios: true,
      recentOrders: true,
      reports: true,
      topRegions: true,
      insights: true,
      topProducts: true,
    });

    const results = await Promise.allSettled([
      getOverviewStats(),          // 0
      fetchStatusRatios(),         // 1
      fetchRecentOrders(),         // 2
      getBusinessReports(),        // 3
      fetchTopRegions(),           // 4
      getOperationalInsights(),    // 5
      fetchTopProducts(),          // 6
    ]);

    // 0: Overview Stats
    if (results[0].status === "fulfilled" && results[0].value.success) {
      setStats(results[0].value.stats);
    } else {
      toast.error("Failed to load overview stats");
    }
    setLoadingStates(prev => ({ ...prev, overview: false }));

    // 1: Status Ratios
    if (results[1].status === "fulfilled" && results[1].value.success) {
      setStatusRatios(results[1].value.statusRatios);
    }
    setLoadingStates(prev => ({ ...prev, statusRatios: false }));

    // 2: Recent Orders + Pending
    if (results[2].status === "fulfilled" && results[2].value.success) {
      setRecentOrders(results[2].value.recentOrders);
      setPendingOrdersList(results[2].value.pendingOrdersList || []);
    }
    setLoadingStates(prev => ({ ...prev, recentOrders: false }));

    // 3: Business Reports
    if (results[3].status === "fulfilled" && results[3].value.success) {
      setReports(results[3].value.reports || {
        today: { count: 0, totalKg: 0, deliveredKg: 0 },
        week: { count: 0, totalKg: 0, deliveredKg: 0 },
        month: { count: 0, totalKg: 0, deliveredKg: 0 },
        year: { count: 0, totalKg: 0, deliveredKg: 0 }
      });
    }
    setLoadingStates(prev => ({ ...prev, reports: false }));

    // 4: Top Regions
    if (results[4].status === "fulfilled" && results[4].value.success) {
      setTopRegions(results[4].value.topRegions || []);
    }
    setLoadingStates(prev => ({ ...prev, topRegions: false }));

    // 5: Operational Insights (dormant, lowStock, areaPackingLoads)
    if (results[5].status === "fulfilled" && results[5].value.success) {
      setDormantRetailers(results[5].value.dormantRetailers || []);
      setLowStockAlerts(results[5].value.lowStockAlerts || []);
      setAreaPackingLoads(results[5].value.areaPackingLoads || []);
    }
    setLoadingStates(prev => ({ ...prev, insights: false }));

    // 6: Top Products
    if (results[6].status === "fulfilled" && results[6].value.success) {
      setTopProducts(results[6].value.topProducts || []);
    }
    setLoadingStates(prev => ({ ...prev, topProducts: false }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Calculate Region distribution percentage for doughnut chart
  const primaryRegion = topRegions[0];
  const regionPercentage = primaryRegion && stats.totalOrders > 0
    ? Math.round((primaryRegion.orders / stats.totalOrders) * 100)
    : 100;

  const showSlimApprovalNotice = pendingOrdersList.length === 0;

  return (
    <div className={`p-4 sm:p-6 min-h-screen transition-colors duration-300 rounded-none font-sans ${isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
      }`}>

      {/* Header */}
      <div className={`pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Dashboard Overview</h1>
          <p className="text-xs mt-0.5 opacity-60">
            Welcome back, manage your business efficiently.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/products")}
            className={`px-3 py-2 text-xs font-bold border flex items-center gap-1.5 transition-all duration-200 cursor-pointer rounded-lg ${isDark
                ? "bg-[#181818] border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                : "bg-white border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
              }`}
          >
            {/* Calendar icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Product List
          </button>

          <button
            onClick={() => navigate("/retailers")}
            className={`px-3 py-2 text-xs font-bold border flex items-center gap-1.5 transition-all duration-200 cursor-pointer rounded-lg ${isDark
                ? "bg-[#181818] border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                : "bg-white border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
              }`}
          >
            {/* Store Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-7.5 0 1.58-5.385A1.5 1.5 0 0 1 4.6 2.25h14.8a1.5 1.5 0 0 1 1.44 1.114l1.58 5.385m-14.8 0a3.001 3.001 0 0 1 3.75-.615 3.001 3.001 0 0 1 3.75.615m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m0 0V21m-12-4.25h.008v.008H7.5V16.75Zm3.75 0h.008v.008h-.008v-.008Zm1.5 0h.008v.008h-.008v-.008Zm1.5 0h.008v.008h-.008v-.008Z" />
            </svg>
            Shops List
          </button>

          <button
            onClick={fetchDashboardData}
            className={`px-3 py-2 text-xs font-bold border flex items-center gap-1.5 transition-all duration-200 cursor-pointer rounded-lg ${isDark
                ? "bg-brand-maroon/20 border-brand-maroon/50 text-brand-gold hover:bg-brand-maroon/40"
                : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:text-brand-maroon"
              }`}
          >
            {/* Sync icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Slim Notice Banner if all orders approved */}
      {!loadingStates.recentOrders && showSlimApprovalNotice && (
        <div className={`p-3 border rounded-xl flex items-center gap-2 mb-6 text-xs font-bold ${isDark
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
          <span>✅</span>
          <span>All orders approved. No pending actions required.</span>
        </div>
      )}

      {/* Row 1: Stat Cards Grid (5 Columns on Desktop) */}
      {loadingStates.overview ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} isDark={isDark} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

          {/* Card 1: Total Orders */}
          <div
            onClick={() => navigate("/orders")}
            className={`p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 cursor-pointer hover:border-brand-gold/60 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
          >
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 truncate">Total Orders</p>
              <h3 className="text-2xl font-extrabold my-0.5">{stats.totalOrders}</h3>
              <p className="text-[10px] text-gray-400 truncate">All orders placed</p>
              <p className="text-[10px] font-bold text-green-500 flex items-center gap-0.5 mt-0.5">
                <span>↑ 100%</span> <span className="text-gray-400 font-normal">vs yesterday</span>
              </p>
            </div>
          </div>

          {/* Card 2: New Orders */}
          <div
            onClick={() => navigate("/orders?status=pending")}
            className={`p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 cursor-pointer hover:border-brand-gold/60 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
          >
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3m0 0c-2.917 0-5.747.294-8.5.862m0 0a2.25 2.25 0 0 0-1.734 2.198V19.5a2.25 2.25 0 0 0 2.25 2.25h1.375" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 truncate">New Orders</p>
              <h3 className="text-2xl font-extrabold my-0.5">{stats.pendingOrders}</h3>
              <p className="text-[10px] text-gray-400 truncate">
                {stats.pendingOrders > 0 ? "Requires approval" : "All cleared"}
              </p>
              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                <span>— 0%</span> <span className="text-gray-400 font-normal">vs yesterday</span>
              </p>
            </div>
          </div>

          {/* Card 3: Active Shops */}
          <div
            onClick={() => navigate("/retailers")}
            className={`p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 cursor-pointer hover:border-brand-gold/60 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
          >
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-7.5 0 1.58-5.385A1.5 1.5 0 0 1 4.6 2.25h14.8a1.5 1.5 0 0 1 1.44 1.114l1.58 5.385m-14.8 0a3.001 3.001 0 0 1 3.75-.615 3.001 3.001 0 0 1 3.75.615m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m0 0V21m-12-4.25h.008v.008H7.5V16.75Zm3.75 0h.008v.008h-.008v-.008Zm1.5 0h.008v.008h-.008v-.008Zm1.5 0h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 truncate">Active Shops</p>
              <h3 className="text-2xl font-extrabold my-0.5">{stats.activeRetailers}</h3>
              <p className="text-[10px] text-gray-400 truncate">Retail partner accounts</p>
              <p className="text-[10px] font-bold text-green-500 flex items-center gap-0.5 mt-0.5">
                <span>↑ 100%</span> <span className="text-gray-400 font-normal">vs yesterday</span>
              </p>
            </div>
          </div>

          {/* Card 4: Delivered Weight */}
          <div
            className={`p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M8.25 13.5h7.5m-11.25-3V4.875A1.125 1.125 0 0 1 5.625 3.75h9.75a1.125 1.125 0 0 1 1.125 1.125V13.5m-11.25 0h11.25m-11.25 0v3.75m11.25-3.75v3.75m-1.5-10.5h3.375c.566 0 1.11.248 1.482.68l3 3.5c.345.402.543.914.543 1.45V13.5H15V6.75Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 truncate">Delivered Weight</p>
              <h3 className="text-2xl font-extrabold my-0.5">{stats.deliveredKg} kg</h3>
              <p className="text-[10px] text-gray-400 truncate">Total weight shipped today</p>
              <p className="text-[10px] font-bold text-green-500 flex items-center gap-0.5 mt-0.5">
                <span>↑ 100%</span> <span className="text-gray-400 font-normal">vs yesterday</span>
              </p>
            </div>
          </div>

          {/* Card 5: Avg Order Weight */}
          <div
            className={`p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}
          >
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 truncate">Avg Order Weight</p>
              <h3 className="text-2xl font-extrabold my-0.5">{stats.avgWeight} kg</h3>
              <p className="text-[10px] text-gray-400 truncate">Average weight per order</p>
              <p className="text-[10px] font-bold text-green-500 flex items-center gap-0.5 mt-0.5">
                <span>↑ 100%</span> <span className="text-gray-400 font-normal">vs yesterday</span>
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Row 2: Action Box / Business Report */}
      {(loadingStates.recentOrders || loadingStates.reports) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CardSkeleton isDark={isDark} />
          <CardSkeleton isDark={isDark} />
        </div>
      ) : (
        <>
          {/* Action Box (Pending Orders) */}
          {!showSlimApprovalNotice && (
            <div className={`p-5 border rounded-xl border-l-4 w-full mb-6 ${isDark ? "bg-[#181818] border-[#2A2A2A] border-l-yellow-500" : "bg-white border-[#E8E2D5] border-l-brand-maroon"
              }`}>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-gray-700/10">
                <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                  <span>Orders Waiting Approval</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                </h2>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${isDark ? "bg-yellow-500/10 text-yellow-500" : "bg-brand-maroon/10 text-brand-maroon"
                  }`}>
                  {pendingOrdersList.length} Action Required
                </span>
              </div>
              <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                {pendingOrdersList.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer hover:border-brand-gold/60 transition-all ${isDark ? "bg-[#111111] border-[#2A2A2A]" : "bg-[#F9F7F2] border-[#E8E2D5]"
                      }`}
                  >
                    <div>
                      <span className="font-bold text-brand-gold">{order.retailerId?.shopName || "Unknown Shop"}</span>
                      <span className="text-gray-400 text-[10px] block mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{order.totalkg} kg</span>
                      <span className={`text-[10px] font-bold uppercase ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
                        Approve →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Row 3: Compact Business Report */}
      {loadingStates.reports ? (
        <CardSkeleton isDark={isDark} />
      ) : (
        <div className={`p-4 border rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"}`}>
          <div className="flex items-center gap-4">
            <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Business Report</h2>
            <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              {(["today", "week", "month", "year"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveReportTab(tab)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                    activeReportTab === tab
                      ? (isDark ? "bg-brand-gold text-[#111] shadow-sm" : "bg-brand-maroon text-white shadow-sm")
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  }`}
                >
                  {tab === "today" ? "Day" : tab === "week" ? "Week" : tab === "month" ? "Month" : "Year"}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 pr-2">
            {/* Box 1 */}
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-yellow-500/10 text-yellow-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-bold leading-none mb-0.5">Orders</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold leading-none">{reports[activeReportTab].count}</span>
                  <span className="text-[8px] text-green-500 font-bold hidden sm:inline">↑ 100%</span>
                </div>
              </div>
            </div>
            
            <div className="w-px h-6 bg-gray-500/20 hidden sm:block"></div>

            {/* Box 2 */}
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-bold leading-none mb-0.5">Total Weight</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold leading-none">{reports[activeReportTab].totalKg} <span className="text-[10px]">kg</span></span>
                  <span className="text-[8px] text-green-500 font-bold hidden sm:inline">↑ 100%</span>
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-gray-500/20 hidden sm:block"></div>

            {/* Box 3 */}
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M8.25 13.5h7.5m-11.25-3V4.875A1.125 1.125 0 0 1 5.625 3.75h9.75a1.125 1.125 0 0 1 1.125 1.125V13.5m-11.25 0h11.25m-11.25 0v3.75m11.25-3.75v3.75m-1.5-10.5h3.375c.566 0 1.11.248 1.482.68l3 3.5c.345.402.543.914.543 1.45V13.5H15V6.75Z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-bold leading-none mb-0.5">Delivered</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold text-green-500 leading-none">{reports[activeReportTab].deliveredKg} <span className="text-[10px]">kg</span></span>
                  <span className="text-[8px] text-green-500 font-bold hidden sm:inline">↑ 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Dashboard Grid: 2-Column layout on desktop (Left 2/3, Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">

        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Recent Orders Accordion */}
          {loadingStates.recentOrders ? <CardSkeleton isDark={isDark} /> : (
            <div className={`p-5 border rounded-xl ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}>
              <div
                className={`flex items-center justify-between cursor-pointer select-none ${isRecentOrdersSectionExpanded ? "mb-4 pb-2 border-b border-gray-700/10" : ""
                  }`}
                onClick={() => setIsRecentOrdersSectionExpanded(!isRecentOrdersSectionExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Recent Orders</h2>
                  <span className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {isRecentOrdersSectionExpanded ? "▲" : "▼"}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/orders"); }}
                  className={`text-xs font-bold flex items-center gap-1 hover:underline ${isDark ? "text-brand-gold" : "text-brand-maroon"
                    }`}
                >
                  View All Orders
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              {isRecentOrdersSectionExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
                    <thead>
                      <tr className="border-b text-gray-500 border-gray-700/10">
                        <th className="pb-3 font-bold">Date</th>
                        <th className="pb-3 font-bold">Shop</th>
                        <th className="pb-3 font-bold">Weight</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/10">
                      {recentOrders.map((order) => {
                        const isExpanded = expandedOrders[order._id];
                        return (
                          <React.Fragment key={order._id}>
                            <tr
                              className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
                              onClick={() => toggleOrderExpand(order._id)}
                            >
                              <td className="py-3.5 font-semibold text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="py-3.5 normal-case font-bold flex items-center gap-2">
                                <span>{order.retailerId?.shopName || "Unknown"}</span>
                                <span className="text-[10px] text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                              </td>
                              <td className="py-3.5 font-semibold">
                                <span className="text-brand-gold font-bold">{order.totalkg} kg</span>
                                <span className={`text-[10px] ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>({order.items.length} items)</span>
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2.5 py-0.5 text-[9px] uppercase font-extrabold tracking-widest border rounded-full ${order.status === "pending"
                                    ? "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/25"
                                    : order.status === "approved"
                                      ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/25"
                                      : order.status === "packed"
                                        ? "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/25"
                                        : order.status === "delivered"
                                          ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/25"
                                          : "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/25"
                                  }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/orders/${order._id}`);
                                  }}
                                  className={`p-2 border rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all ${isDark ? "bg-black/40 border-[#2A2A2A] text-gray-400" : "bg-gray-100 border-[#E8E2D5] text-gray-500"
                                    }`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className={isDark ? "bg-black/20" : "bg-gray-50"}>
                                <td colSpan={5} className="p-4 border-b border-gray-700/10">
                                  <div className="text-xs uppercase tracking-wider pl-4">
                                    <h4 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-2 text-brand-gold">Order Items Breakdown</h4>
                                    <div className={`border overflow-hidden rounded-lg ${isDark ? "bg-[#111111] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"}`}>
                                      <table className="w-full text-left text-[10px] font-sans border-collapse">
                                        <thead>
                                          <tr className={`border-b text-gray-500 ${isDark ? "border-[#2A2A2A] bg-black/40" : "border-[#E8E2D5] bg-[#ECE8DF]/20"}`}>
                                            <th className="p-2 font-bold">Product Name</th>
                                            <th className="p-2 font-bold text-center">Packet Size</th>
                                            <th className="p-2 font-bold text-right">Qty (Kg)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/10">
                                          {order.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-black/5">
                                              <td className="p-2 normal-case font-semibold">{item.productId?.name || "Deleted Product"}</td>
                                              <td className="p-2 text-center font-semibold font-mono">{item.packetSize}</td>
                                              <td className="p-2 text-right font-bold text-brand-gold font-mono">{item.quantityKg} kg</td>
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
              )}
            </div>
          )}

          {/* Sub-grid for Order Status Overview & Scheduled Deliveries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* Card: Order Status Overview */}
            {loadingStates.statusRatios ? <CardSkeleton isDark={isDark} /> : (
              <div className={`p-5 border rounded-xl ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                }`}>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-brand-gold">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                  <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Order Status Overview</h2>
                </div>

                <div className="flex items-center justify-between">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" className={isDark ? "stroke-gray-800" : "stroke-gray-200"} strokeWidth="4" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="currentColor"
                        className="text-green-500"
                        strokeWidth="4.5"
                        strokeDasharray={`${stats.totalOrders > 0 ? (stats.deliveredKg ? 100 : 0) : 0}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-base font-extrabold block">{stats.totalOrders}</span>
                      <span className="text-[8px] text-gray-500 block uppercase leading-none mt-0.5">Total Orders</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 min-w-[130px]">
                    {statusRatios.map((status, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${status.label === "delivered" ? "bg-green-500" :
                              status.label === "pending" ? "bg-yellow-500" :
                                status.label === "approved" ? "bg-blue-500" : "bg-purple-500"
                            }`}></span>
                          <span className="capitalize text-gray-500">{status.label}</span>
                        </div>
                        <span className="font-bold">{status.count} ({status.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Card: Scheduled Deliveries */}
            {loadingStates.insights ? <CardSkeleton isDark={isDark} /> : (
              <div className={`p-5 border rounded-xl ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                }`}>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-brand-gold">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M8.25 13.5h7.5" />
                  </svg>
                  <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Scheduled Deliveries</h2>
                </div>

                {areaPackingLoads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-3 text-center">
                    <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xs">No pending deliveries</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">All caught up! Great work.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-24 overflow-y-auto pr-1">
                    {areaPackingLoads.map((load, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 border-gray-700/10 text-xs">
                        <div>
                          <span className="font-bold uppercase">{load.name}</span>
                          <span className="text-[10px] text-gray-500 block">{load.ordersCount} orders scheduled</span>
                        </div>
                        <span className="font-bold text-brand-gold">{load.totalKg} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Card: Top Regions Distribution */}
          {loadingStates.topRegions ? <CardSkeleton isDark={isDark} /> : (
            <div className={`p-5 border rounded-xl ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-brand-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Top Regions Distribution</h2>
              </div>

              <div className="flex items-center justify-between py-2">
                {/* SVG Doughnut chart */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className={isDark ? "text-gray-800" : "text-gray-200"}
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={isDark ? "text-brand-gold" : "text-brand-maroon"}
                      strokeDasharray={`${regionPercentage}, 100`}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-sm font-extrabold block">{regionPercentage}%</span>
                  </div>
                </div>

                {/* List side */}
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-maroon dark:bg-brand-gold"></span>
                    <span className="font-bold normal-case">{primaryRegion?.name || "No Region"}</span>
                    <span className="text-gray-500 font-semibold">{regionPercentage}%</span>
                  </div>

                  {/* Region mini stats */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-700/10 mt-2">
                    <div className="text-center">
                      <span className="text-[9px] text-gray-500 block">Shops</span>
                      <span className="font-extrabold">{primaryRegion?.retailers || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-gray-500 block">Orders</span>
                      <span className="font-extrabold">{primaryRegion?.orders || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-gray-500 block">Volume</span>
                      <span className="font-extrabold text-brand-gold truncate max-w-12 block">{primaryRegion?.totalKg || 0} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card: Inactive Shops */}
          {loadingStates.insights ? <CardSkeleton isDark={isDark} /> : (
            <div className={`p-5 border rounded-xl ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Inactive Shops</h2>
              </div>

              {dormantRetailers.length === 0 ? (
                <p className="text-xs text-gray-500 italic">All stores active</p>
              ) : (
                <div className="flex justify-between items-center bg-[#F9F7F2] dark:bg-[#111111] p-3 rounded-lg border border-gray-200 dark:border-[#222222]">
                  <div>
                    <h4 className="font-bold text-xs max-w-[150px] truncate">{dormantRetailers[0].shopName}</h4>
                    <p className="text-[10px] text-red-500 mt-0.5">No orders yet</p>
                  </div>
                  <a
                    href={`https://wa.me/91${dormantRetailers[0].phone}?text=Hello%20${encodeURIComponent(dormantRetailers[0].shopName)}%2C%20do%20you%20need%20stock%20today%2Forders%20from%20BNB%20Sweets%3F`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
                  >
                    Nudge
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Card: Top Products */}
          {loadingStates.topProducts ? <CardSkeleton isDark={isDark} /> : (
            <div className={`p-5 border rounded-xl ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
              }`}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-brand-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.75m-5.007 0V9.75m5.007 0a3 3 0 01-3-3m-3.993 3a3 3 0 003 3m.007-6a3 3 0 11-6 0c0-1.623.767-3.065 1.958-4m4.042 4a3 3 0 10-6 0c0-1.623.767-3.065 1.958-4M14 6.75a3 3 0 11-6 0c0-1.623.767-3.065 1.958-4" />
                </svg>
                <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider">Top Products (Last 30 Days)</h2>
              </div>

              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4">No products sold recently</p>
                ) : (
                  topProducts.map((p, idx) => (
                    <div key={p._id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">{idx + 1}.</span>
                        <span className="normal-case font-bold">{p.name}</span>
                      </div>
                      <span className="font-bold text-brand-gold">{p.totalKg} kg</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;