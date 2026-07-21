import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getAllOrders, updateOrderStatus } from "../../api/orders/orders";
import { getAllAreas } from "../../api/area/areas";
import { getAllRetailers } from "../../api/retailers/retailers";
import toast from "react-hot-toast";

type ProductDetail = {
  _id: string;
  name: string;
};

type OrderItem = {
  productId: ProductDetail | null;
  packetSize: string;
  quantityKg: number;
  notes?: string;
};

type StatusHistoryEntry = {
  _id?: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
  note?: string;
};

type OrderDetail = {
  _id: string;
  orderId?: string;
  retailerId: {
    _id: string;
    shopName: string;
    ownerName: string;
    area?: {
      _id: string;
      name: string;
    } | null;
  } | null;
  items: OrderItem[];
  status: "pending" | "approved" | "packed" | "delivered" | "cancelled";
  adminNote?: string;
  totalkg: number;
  createdAt: string;
  statusHistory?: StatusHistoryEntry[];
};

const Orders: React.FC = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const retailerIdFilter = searchParams.get("retailerId") || undefined;

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // New filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [areaId, setAreaId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [areas, setAreas] = useState<{ _id: string; name: string }[]>([]);
  const [retailersList, setRetailersList] = useState<{ _id: string; shopName: string; ownerName: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  // Summary stats state
  const [stats, setStats] = useState<{
    totalPackingLoad: number;
    pendingCount: number;
    deliveredCount: number;
  }>({ totalPackingLoad: 0, pendingCount: 0, deliveredCount: 0 });

  // Row expansion state
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Debounce search text changes to prevent spamming queries on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450); // 450ms delay is ideal for typing experience

    return () => clearTimeout(timer);
  }, [search]);

  const fetchAreas = async () => {
    try {
      const res = await getAllAreas();
      if (res.success) {
        setAreas(res.areas);
      }
    } catch (err) {
      toast.error("Failed to load areas");
    }
  };

  const fetchRetailers = async () => {
    try {
      const res = await getAllRetailers();
      if (res.success) {
        setRetailersList(res.retailers);
      }
    } catch (err) {
      console.error("Failed to load retailers", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusParam = activeTab === "all" ? undefined : activeTab;
      const data = await getAllOrders({
        retailerId: retailerIdFilter,
        status: statusParam,
        search: debouncedSearch || undefined,
        areaId: areaId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (data.success) {
        setOrders(data.orders);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchRetailers();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [retailerIdFilter, activeTab, debouncedSearch, areaId, startDate, endDate]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(res.message || "Order status updated");
        // Update local state reactive UX
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: res.order.status } : o))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  };

  const handleClearFilter = () => {
    setSearchParams({});
    setSearch("");
    setAreaId("");
    setStartDate("");
    setEndDate("");
    setActiveTab("all");
    setExpandedOrders({});
    setShowExtraFilters(false);
  };



  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
      }`}>
      {/* Header */}
      <div className={`border-b pb-4 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"
        }`}>
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Orders Management</h1>
          <p className={`text-xs mt-1 font-sans opacity-60`}>
            Track and process customer orders
          </p>
        </div>

        <div className="flex flex-row items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0">
          {/* Search Field with Autocomplete (Moved to Header Row) */}
          <div className="flex-grow lg:w-64 relative">
            <input
              type="text"
              placeholder="Search shop..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className={`p-2 text-xs border rounded-none focus:outline-none focus:border-brand-gold w-full ${
                isDark 
                  ? "bg-[#111111] border-[#333333] text-brand-cream focus:border-brand-gold" 
                  : "bg-white border-[#E8E2D5] text-brand-charcoal focus:border-brand-maroon"
              }`}
            />
            {showSuggestions && search.trim() && (
              (() => {
                const suggestions = retailersList.filter((r) =>
                  r.shopName.toLowerCase().includes(search.toLowerCase()) ||
                  r.ownerName.toLowerCase().includes(search.toLowerCase())
                ).slice(0, 5);

                return suggestions.length > 0 ? (
                  <>
                    {/* Overlay backdrop to close dropdown on clicking outside */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSuggestions(false)} 
                    />
                    <div className={`absolute left-0 right-0 top-[100%] mt-1 border z-20 shadow-lg max-h-60 overflow-y-auto rounded-none ${
                      isDark ? "bg-[#181818] border-[#2A2A2A] text-brand-cream" : "bg-white border-[#E8E2D5] text-brand-charcoal"
                    }`}>
                      {suggestions.map((r) => (
                        <div
                          key={r._id}
                          onClick={() => {
                            setSearch(r.shopName);
                            setShowSuggestions(false);
                          }}
                          className={`p-2.5 text-xs cursor-pointer border-b transition-colors last:border-b-0 ${
                            isDark 
                              ? "border-[#222222] hover:bg-[#222222] text-brand-beige" 
                              : "border-[#F2ECE0] hover:bg-[#F9F7F2] text-[#7A7263]"
                          }`}
                        >
                          <div className="font-bold">{r.shopName}</div>
                          <div className="text-[9px] opacity-60 mt-0.5">{r.ownerName}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null;
              })()
            )}
          </div>

          {/* Toggle Filters Button (Option Menu Design) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowExtraFilters(!showExtraFilters)}
              className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 cursor-pointer rounded-none flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                showExtraFilters || areaId || startDate || endDate
                  ? isDark
                    ? "bg-brand-gold text-brand-charcoal border-brand-gold"
                    : "bg-brand-maroon text-brand-cream border-brand-maroon"
                  : isDark
                    ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                    : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              <span>Filters</span>
              <span className="text-[9px]">{showExtraFilters ? "▲" : "▼"}</span>
            </button>

            {showExtraFilters && (
              <>
                {/* Backdrop to close popup on clicking outside */}
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowExtraFilters(false)} 
                />
                <div className={`absolute right-0 top-[100%] mt-2 border z-30 shadow-2xl p-4 w-72 sm:w-80 flex flex-col gap-4 rounded-none ${
                  isDark ? "bg-[#181818] border-[#2A2A2A] text-brand-cream" : "bg-white border-[#E8E2D5] text-brand-charcoal"
                }`}>
                  <h3 className="font-sans text-xs uppercase font-extrabold tracking-wider border-b pb-2 border-inherit">Filter Options</h3>
                  
                  {/* Area Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider opacity-60">Filter by Area</label>
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      className={`p-2 text-xs border rounded-none focus:outline-none cursor-pointer w-full ${
                        isDark 
                          ? "bg-[#111111] border-[#333333] text-brand-cream" 
                          : "bg-white border-[#E8E2D5] text-[#7A7263]"
                      }`}
                    >
                      <option value="">All Areas</option>
                      {areas.map((a) => (
                        <option key={a._id} value={a._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider opacity-60">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`p-2 text-xs border rounded-none focus:outline-none w-full ${
                        isDark 
                          ? "bg-[#111111] border-[#333333] text-brand-cream" 
                          : "bg-[#F9F7F2] border-[#E8E2D5] text-brand-charcoal"
                      }`}
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider opacity-60">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`p-2 text-xs border rounded-none focus:outline-none w-full ${
                        isDark 
                          ? "bg-[#111111] border-[#333333] text-brand-cream" 
                          : "bg-[#F9F7F2] border-[#E8E2D5] text-brand-charcoal"
                      }`}
                    />
                  </div>

                  {/* Action Buttons inside dropdown */}
                  <div className="flex justify-between items-center mt-2 border-t pt-3 border-[#2A2A2A]/20 dark:border-[#2A2A2A]">
                    <button
                      onClick={() => setShowExtraFilters(false)}
                      className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider border rounded-none cursor-pointer ${
                        isDark 
                          ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold" 
                          : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                      }`}
                    >
                      Close
                    </button>

                    {(search || areaId || startDate || endDate || activeTab !== "all" || retailerIdFilter) && (
                      <button
                        onClick={handleClearFilter}
                        className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest border transition-all duration-200 cursor-pointer rounded-none ${
                          isDark
                            ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                            : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                        }`}
                        title="Clear All Filters"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Clear Search & Filters Button */}
          {(search || areaId || startDate || endDate || activeTab !== "all" || retailerIdFilter) && (
            <button
              onClick={handleClearFilter}
              className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 cursor-pointer rounded-none ${
                isDark
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
              title="Clear All Search & Filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* High-Level Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {/* Stat Card 1: Today's Packing Load */}
        <div className={`p-2 sm:p-4 border transition-all duration-200 ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <span className="text-[7.5px] sm:text-[9px] uppercase font-bold tracking-wider opacity-60 block mb-0.5 sm:mb-1 truncate">Today's Load</span>
          <span className="text-sm sm:text-2xl font-sans font-bold text-brand-gold tracking-wide block">
            {stats.totalPackingLoad.toLocaleString()} <span className="text-[9px] sm:text-xs uppercase font-sans font-normal opacity-70">kg</span>
          </span>
          <span className="hidden sm:block text-[9px] opacity-50 mt-1">Sum of Approved & Packed orders</span>
        </div>

        {/* Stat Card 2: Urgent Action */}
        <div className={`p-2 sm:p-4 border transition-all duration-200 relative overflow-hidden ${
          stats.pendingCount > 0
            ? isDark
              ? "bg-yellow-500/5 border-yellow-500/30"
              : "bg-yellow-100/10 border-yellow-600/30"
            : isDark
              ? "bg-[#181818] border-[#2A2A2A]"
              : "bg-white border-[#E8E2D5]"
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[7.5px] sm:text-[9px] uppercase font-bold tracking-wider opacity-60 block mb-0.5 sm:mb-1 truncate">Urgent Action</span>
              <span className={`text-sm sm:text-2xl font-sans font-bold tracking-wide block ${stats.pendingCount > 0 ? "text-yellow-500" : ""}`}>
                {stats.pendingCount} <span className="text-[9px] sm:text-xs uppercase font-sans font-normal opacity-70">Pending</span>
              </span>
            </div>
            {stats.pendingCount > 0 && (
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 mt-0.5 sm:mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-yellow-500"></span>
              </span>
            )}
          </div>
          <span className="hidden sm:block text-[9px] opacity-50 mt-1">Orders requiring Admin Approval</span>
        </div>

        {/* Stat Card 3: Delivered Today */}
        <div className={`p-2 sm:p-4 border transition-all duration-200 ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <span className="text-[7.5px] sm:text-[9px] uppercase font-bold tracking-wider opacity-60 block mb-0.5 sm:mb-1 truncate">Delivered Today</span>
          <span className="text-sm sm:text-2xl font-sans font-bold text-green-500 tracking-wide block">
            {stats.deliveredCount} <span className="text-[9px] sm:text-xs uppercase font-sans font-normal opacity-70">Orders</span>
          </span>
          <span className="hidden sm:block text-[9px] opacity-50 mt-1">Successfully dispatched today</span>
        </div>
      </div>

      {/* Status Filter Tabs / Badges (Horizontal scrolling on mobile) */}
      <div className={`flex md:inline-flex flex-nowrap overflow-x-auto gap-0.5 mb-6 p-0.5 border rounded-lg scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0.5 ${
        isDark 
          ? "bg-black/35 border-[#222222]" 
          : "bg-[#ECE8DF]/45 border-[#E2DCCE]"
      }`}>
        {[
          { label: "All Orders", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Packed", value: "packed" },
          { label: "Delivered", value: "delivered" },
          { label: "Cancelled", value: "cancelled" }
        ].map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-1.5 text-xs font-extrabold uppercase transition-all duration-150 cursor-pointer rounded-md whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? isDark
                    ? "bg-[#222222] text-brand-gold border border-[#333333] shadow-sm"
                    : "bg-white text-brand-maroon border border-[#E2DCCE] shadow-sm"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-[#7A7263] hover:text-brand-maroon"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List Container */}
      <div className={`border overflow-hidden rounded-none ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
        {loading ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
            Fetching orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
            No orders found.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                    <th className="p-4 font-bold">Order Date</th>
                    <th className="p-4 font-bold">Shop Name</th>
                    <th className="p-4 font-bold">Area</th>
                    <th className="p-4 font-bold">Total Wt (Kg)</th>
                    <th className="p-4 font-bold">Order Items</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr
                        className={`border-b transition-all duration-150 border-l-6 ${order.status === "pending"
                            ? isDark
                              ? "border-[#2A2A2A] border-l-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/15"
                              : "border-[#E8E2D5] border-l-yellow-600 bg-yellow-100/40 hover:bg-yellow-100/60"
                            : isDark
                              ? "border-[#222222] border-l-transparent hover:bg-[#222222]/10"
                              : "border-[#F2ECE0] border-l-transparent hover:bg-[#F9F7F2]/30"
                          }`}
                      >
                        <td className="p-4 align-top font-semibold whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {order.status === "pending" && (
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                                </span>
                              )}
                              <span>
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {order.orderId && (
                              <span className="text-[10px] font-mono font-bold text-brand-gold">
                                {order.orderId}
                              </span>
                            )}
                            {order.status === "pending" && (
                              <span className="inline-block w-fit px-1.5 py-0.5 text-[8px] font-extrabold bg-yellow-500 text-black animate-pulse tracking-wider">
                                NEW ORDER ACTION REQUIRED
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-semibold">{order.retailerId?.shopName || "Unknown"}</div>
                          <div className="text-[9px] text-gray-500 lowercase mt-0.5">
                            {order.retailerId?.ownerName}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full ${isDark
                              ? "bg-brand-maroon/20 text-brand-beige border-brand-maroon/30"
                              : "bg-brand-maroon/5 text-brand-maroon border-brand-maroon/15"
                            }`}>
                            {order.retailerId?.area?.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 align-top font-mono font-semibold">
                          {order.totalkg} kg
                        </td>
                        <td className="p-4 align-top">
                          <button
                            onClick={() => toggleOrderExpand(order._id)}
                            className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold border transition-all duration-200 cursor-pointer rounded-full ${
                              expandedOrders[order._id]
                                ? isDark
                                  ? "bg-brand-gold text-brand-charcoal border-brand-gold shadow-sm"
                                  : "bg-brand-maroon text-white border-brand-maroon shadow-sm"
                                : isDark
                                  ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold/60"
                                  : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon/60"
                            }`}
                          >
                            <span>{order.items.length} {order.items.length === 1 ? "Item" : "Items"}</span>
                            <span>{expandedOrders[order._id] ? "▲" : "▼"}</span>
                          </button>
                        </td>
                        <td className="p-4 align-top">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`border text-[9px] uppercase font-bold tracking-widest px-3 py-1 focus:outline-none cursor-pointer transition-all duration-150 rounded-full hover:scale-[1.03] active:scale-95 ${
                              order.status === "pending"
                                ? isDark ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" : "bg-yellow-50 text-yellow-800 border-yellow-200"
                                : order.status === "approved"
                                ? isDark ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-blue-50 text-blue-800 border-blue-200"
                                : order.status === "packed"
                                ? isDark ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-purple-50 text-purple-800 border-purple-200"
                                : order.status === "delivered"
                                ? isDark ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-green-50 text-green-800 border-green-200"
                                : isDark ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 text-red-800 border-red-200"
                            }`}
                          >
                            <option value="pending" className={isDark ? "bg-[#181818]" : "bg-white"}>Pending</option>
                            <option value="approved" className={isDark ? "bg-[#181818]" : "bg-white"}>Approved</option>
                            <option value="packed" className={isDark ? "bg-[#181818]" : "bg-white"}>Packed</option>
                            <option value="delivered" className={isDark ? "bg-[#181818]" : "bg-white"}>Delivered</option>
                            <option value="cancelled" className={isDark ? "bg-[#181818]" : "bg-white"}>Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 align-top text-right pr-6">
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className={`px-2.5 py-1 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${isDark
                                ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                                : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                              }`}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                      {expandedOrders[order._id] && (
                        <tr className={isDark ? "bg-[#151515]" : "bg-[#F9F7F2]/40"}>
                          <td colSpan={7} className="p-4 border-b border-inherit">
                            <div className="pl-6 py-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-3 text-brand-gold">Items Breakdown</h4>
                                <div className={`border overflow-hidden rounded-none ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"}`}>
                                  <table className="w-full text-left text-[10px] uppercase tracking-wider font-sans border-collapse">
                                    <thead>
                                      <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                                        <th className="p-3 font-bold">Product Name</th>
                                        <th className="p-3 font-bold w-32">Packet Size</th>
                                        <th className="p-3 font-bold text-right pr-6 w-36">Quantity (Kg)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item, idx) => (
                                        <tr key={idx} className={`border-b transition-colors duration-150 last:border-b-0 ${isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"}`}>
                                          <td className="p-3 font-semibold normal-case">{item.productId?.name || "Deleted Product"}</td>
                                          <td className="p-3 font-mono">{item.packetSize}</td>
                                          <td className="p-3 text-right pr-6 font-mono font-bold text-brand-gold">{item.quantityKg} kg</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-3 text-brand-gold">Status History & Updates</h4>
                                <div className={`p-3 border rounded-none text-[10px] space-y-2 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"}`}>
                                  {order.statusHistory && order.statusHistory.length > 0 ? (
                                    order.statusHistory.map((h, hIdx) => (
                                      <div key={hIdx} className="flex items-center justify-between border-b pb-1.5 last:border-b-0 last:pb-0 border-inherit">
                                        <div className="flex items-center gap-1.5">
                                          {h.fromStatus ? (
                                            <>
                                              <span className="opacity-60">{h.fromStatus}</span>
                                              <span className="text-brand-gold font-bold">➔</span>
                                              <span className="font-bold uppercase">{h.toStatus}</span>
                                            </>
                                          ) : (
                                            <span className="font-bold text-green-500">📦 Order Received</span>
                                          )}
                                        </div>
                                        <span className="font-mono opacity-60">
                                          {new Date(h.changedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}{" "}
                                          {new Date(h.changedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-green-500">📦 Order Received</span>
                                      <span className="font-mono opacity-60">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}{" "}
                                        {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className={`p-4 border transition-all duration-150 border-l-6 ${order.status === "pending"
                      ? isDark
                        ? "border-[#2A2A2A] border-l-yellow-500 bg-yellow-500/5"
                        : "border-[#E8E2D5] border-l-yellow-600 bg-yellow-100/20"
                      : isDark
                        ? "border-[#222222] border-l-transparent bg-[#1e1e1e]/40"
                        : "border-[#F2ECE0] border-l-transparent bg-[#F9F7F2]/10"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">{order.retailerId?.shopName || "Unknown"}</h3>
                      <p className="text-[10px] text-gray-500 lowercase mt-0.5">{order.retailerId?.ownerName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] block opacity-80">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className={`inline-block px-2 py-0.5 text-[8px] font-bold border mt-1.5 rounded-full ${isDark
                          ? "bg-brand-maroon/20 text-brand-beige border-brand-maroon/30"
                          : "bg-brand-maroon/5 text-brand-maroon border-brand-maroon/15"
                        }`}>
                        {order.retailerId?.area?.name || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-b py-3 my-3 border-inherit space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="opacity-60">TOTAL WEIGHT:</span>
                      <span className="font-bold text-brand-gold">{order.totalkg} kg</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="opacity-60 font-sans font-bold">ITEMS COUNT:</span>
                      <button
                        onClick={() => toggleOrderExpand(order._id)}
                        className="font-bold text-brand-gold underline uppercase cursor-pointer"
                      >
                        {order.items.length} {order.items.length === 1 ? "Item" : "Items"} {expandedOrders[order._id] ? "(Hide)" : "(Show)"}
                      </button>
                    </div>

                    {expandedOrders[order._id] && (
                      <div className="text-[10px] opacity-80 pt-3 border-t border-inherit space-y-3">
                        <div>
                          <p className="font-bold text-[9px] uppercase tracking-wider opacity-60 mb-1">Items Breakdown:</p>
                          <ul className="space-y-1 font-mono pl-2">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between gap-4">
                                <span className="truncate">• {item.productId?.name || "Deleted Product"} ({item.packetSize})</span>
                                <span className="font-bold flex-shrink-0">{item.quantityKg} kg</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-bold text-[9px] uppercase tracking-wider opacity-60 mb-1 text-brand-gold">Status Updates Log:</p>
                          <div className="space-y-1 pl-2 font-sans">
                            {order.statusHistory && order.statusHistory.length > 0 ? (
                              order.statusHistory.map((h, hIdx) => (
                                <div key={hIdx} className="flex justify-between items-center text-[9px]">
                                  <span>
                                    {h.fromStatus ? `${h.fromStatus} ➔ ${h.toStatus}` : "📦 Order Received"}
                                  </span>
                                  <span className="font-mono opacity-60">
                                    {new Date(h.changedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}{" "}
                                    {new Date(h.changedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between items-center text-[9px]">
                                <span>📦 Order Received</span>
                                <span className="font-mono opacity-60">
                                  {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}{" "}
                                  {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`border text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 focus:outline-none cursor-pointer rounded-full hover:scale-[1.03] active:scale-95 transition-all duration-150 ${
                        order.status === "pending"
                          ? isDark ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" : "bg-yellow-50 text-yellow-800 border-yellow-200"
                          : order.status === "approved"
                          ? isDark ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-blue-50 text-blue-800 border-blue-200"
                          : order.status === "packed"
                          ? isDark ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-purple-50 text-purple-800 border-purple-200"
                          : order.status === "delivered"
                          ? isDark ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-green-50 text-green-800 border-green-200"
                          : isDark ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      <option value="pending" className={isDark ? "bg-[#181818]" : "bg-white"}>Pending</option>
                      <option value="approved" className={isDark ? "bg-[#181818]" : "bg-white"}>Approved</option>
                      <option value="packed" className={isDark ? "bg-[#181818]" : "bg-white"}>Packed</option>
                      <option value="delivered" className={isDark ? "bg-[#181818]" : "bg-white"}>Delivered</option>
                      <option value="cancelled" className={isDark ? "bg-[#181818]" : "bg-white"}>Cancelled</option>
                    </select>

                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className={`px-3 py-1.5 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${isDark
                          ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                          : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                        }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
