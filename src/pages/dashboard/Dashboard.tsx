import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Dummy statistics for the dashboard
  const stats = [
    { label: "Total Orders", value: "154", change: "+12% this week", color: "text-brand-gold" },
    { label: "Pending Orders", value: "14", change: "Requires approval", color: "text-amber-500" },
    { label: "Active Retailers", value: "48", change: "+4 new partners", color: "text-blue-500" },
    { label: "Dispatched Weight", value: "1,248 kg", change: "Total weight shipped", color: "text-green-500" },
    { label: "Avg Order Weight", value: "28.5 kg", change: "Average load per order", color: "text-brand-beige" },
  ];

  // Dummy recent orders for display
  const recentOrders = [
    { id: "ORD-9843", shopName: "Balaji Mart", items: 4, weight: "42 kg", status: "pending", time: "10 mins ago" },
    { id: "ORD-9842", shopName: "Karan General Store", items: 2, weight: "15 kg", status: "approved", time: "1 hr ago" },
    { id: "ORD-9841", shopName: "Durga Provision Store", items: 8, weight: "112 kg", status: "packed", time: "3 hrs ago" },
    { id: "ORD-9840", shopName: "Shree Ji Sweets", items: 1, weight: "5 kg", status: "delivered", time: "Yesterday" },
  ];

  // Dummy top active regions
  const topRegions = [
    { name: "Sector 62, Noida", retailers: 14, sales: "₹45,200" },
    { name: "Indirapuram, Ghaziabad", retailers: 12, sales: "₹38,900" },
    { name: "Vasundhara, Ghaziabad", retailers: 10, sales: "₹29,400" },
    { name: "Sector 15, Noida", retailers: 8, sales: "₹18,500" },
  ];

  // Dummy status ratio data
  const statusRatios = [
    { label: "Pending", count: 14, percent: 10, color: "bg-amber-500" },
    { label: "Approved", count: 48, percent: 31, color: "bg-blue-500" },
    { label: "Packed", count: 38, percent: 25, color: "bg-purple-500" },
    { label: "Delivered", count: 49, percent: 32, color: "bg-green-500" },
    { label: "Cancelled", count: 5, percent: 2, color: "bg-red-500" },
  ];

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header */}
      <div className={`border-b pb-4 mb-8 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Management Dashboard</h1>
        <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
          Overview of your retail supply chain and order traffic
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-6 border transition-all duration-300 rounded-none shadow-sm ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}
          >
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8E8677]">{stat.label}</p>
            <h3 className={`font-serif text-4xl font-light my-2 ${stat.color}`}>{stat.value}</h3>
            <p className="text-[11px] text-gray-500 normal-case font-mono">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Card */}
        <div className={`lg:col-span-2 p-6 border rounded-none ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-dashed border-gray-700/30">
            <h2 className="font-serif text-lg uppercase tracking-wider">Recent Orders</h2>
            <button
              onClick={() => navigate("/orders")}
              className={`text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:underline ${
                isDark ? "text-brand-gold" : "text-brand-maroon"
              }`}
            >
              View All Orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
              <thead>
                <tr className={`border-b text-[#8E8677] ${isDark ? "border-[#2A2A2A]" : "border-[#E8E2D5]"}`}>
                  <th className="pb-3 font-bold">Order ID</th>
                  <th className="pb-3 font-bold">Shop</th>
                  <th className="pb-3 font-bold">Items</th>
                  <th className="pb-3 font-bold">Weight</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150">
                    <td className="py-3.5 font-mono font-semibold">{order.id}</td>
                    <td className="py-3.5 normal-case font-semibold text-sm">{order.shopName}</td>
                    <td className="py-3.5 font-mono">{order.items} items</td>
                    <td className="py-3.5 font-mono font-semibold">{order.weight}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold ${
                        order.status === "pending" ? "bg-yellow-900/20 text-yellow-400 border border-yellow-800/40" :
                        order.status === "approved" ? "bg-blue-900/20 text-blue-400 border border-blue-800/40" :
                        order.status === "packed" ? "bg-purple-900/20 text-purple-400 border border-purple-800/40" :
                        "bg-green-900/20 text-green-400 border border-green-800/40"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panels Container */}
        <div className="space-y-8">
          
          {/* Order Status Distribution */}
          <div className={`p-6 border rounded-none ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            <h2 className="font-serif text-lg uppercase tracking-wider mb-6 pb-2 border-b border-dashed border-gray-700/30">
              Status Distribution
            </h2>
            <div className="space-y-4">
              {statusRatios.map((status, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span>{status.label}</span>
                    <span className="font-mono text-gray-500 dark:text-gray-400">
                      {status.count} ({status.percent}%)
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-none ${isDark ? "bg-[#252525]" : "bg-[#ECE8DF]"}`}>
                    <div
                      className={`h-full rounded-none ${status.color} transition-all duration-500`}
                      style={{ width: `${status.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Regions Summary */}
          <div className={`p-6 border rounded-none ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-dashed border-gray-700/30">
              <h2 className="font-serif text-lg uppercase tracking-wider">Top Regions</h2>
              <button
                onClick={() => navigate("/areas")}
                className={`text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:underline ${
                  isDark ? "text-brand-gold" : "text-brand-maroon"
                }`}
              >
                Manage Areas →
              </button>
            </div>

            <div className="space-y-4">
              {topRegions.map((region, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between pb-3 last:pb-0 border-b last:border-0 border-gray-700/10"
                >
                  <div>
                    <h4 className="text-xs uppercase font-semibold tracking-wider">{region.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{region.retailers} active retailers</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-xs font-semibold ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
                      {region.sales}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;