import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getAllOrders, updateOrderStatus } from "../../api/orders/orders";
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

type OrderDetail = {
  _id: string;
  retailerId: {
    _id: string;
    shopName: string;
    ownerName: string;
  } | null;
  items: OrderItem[];
  status: "pending" | "approved" | "packed" | "delivered" | "cancelled";
  adminNote?: string;
  totalkg: number;
  createdAt: string;
};

const Orders: React.FC = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const retailerIdFilter = searchParams.get("retailerId") || undefined;

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders(retailerIdFilter);
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [retailerIdFilter]);

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
  };

  // Get filtered retailer shop name if list is not empty
  const filteredShopName =
    retailerIdFilter && orders.length > 0 && orders[0].retailerId
      ? orders[0].retailerId.shopName
      : undefined;

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header */}
      <div className={`border-b pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between ${
        isDark ? "border-[#222222]" : "border-[#E8E2D5]"
      }`}>
        <div>
          <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Orders Management</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Track and process customer orders
          </p>
        </div>

        {retailerIdFilter && (
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider border ${
              isDark ? "bg-[#181818] border-[#333333] text-brand-gold" : "bg-white border-[#E8E2D5] text-brand-maroon"
            }`}>
              Retailer: {filteredShopName || "Selected Retailer"}
            </span>
            <button
              onClick={handleClearFilter}
              className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition-all duration-200 ${
                isDark
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              Show All Orders
            </button>
          </div>
        )}
      </div>

      {/* Orders List Container */}
      <div className={`border overflow-hidden rounded-none ${
        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                  <th className="p-4 font-bold">Order Date</th>
                  <th className="p-4 font-bold">Shop Name</th>
                  <th className="p-4 font-bold">Total Wt (Kg)</th>
                  <th className="p-4 font-bold">Order Items</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className={`border-b transition-colors duration-150 ${
                    isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"
                  }`}>
                    <td className="p-4 align-top font-semibold whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-semibold">{order.retailerId?.shopName || "Unknown"}</div>
                      <div className="text-[9px] text-gray-500 lowercase mt-0.5">
                        {order.retailerId?.ownerName}
                      </div>
                    </td>
                    <td className="p-4 align-top font-mono font-semibold">
                      {order.totalkg} kg
                    </td>
                    <td className="p-4 align-top">
                      <ul className="space-y-1 text-[10px] normal-case font-mono tracking-normal">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="font-semibold text-brand-gold">•</span>
                            <span>
                              {item.productId?.name || "Deleted Product"} ({item.packetSize}) —{" "}
                              <strong className={isDark ? "text-brand-cream" : "text-brand-charcoal"}>
                                {item.quantityKg} kg
                              </strong>
                              {item.notes && <span className="text-[9px] text-gray-500 italic ml-1">({item.notes})</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 align-top">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`bg-transparent border text-[10px] uppercase font-bold tracking-widest px-2 py-1 focus:outline-none cursor-pointer transition-colors duration-200 ${
                          order.status === "pending" ? "border-yellow-500 text-yellow-500" :
                          order.status === "approved" ? "border-blue-500 text-blue-500" :
                          order.status === "packed" ? "border-purple-500 text-purple-500" :
                          order.status === "delivered" ? "border-green-500 text-green-400" :
                          "border-red-500 text-red-400"
                        }`}
                      >
                        <option value="pending" className={isDark ? "bg-[#181818]" : "bg-white"}>Pending</option>
                        <option value="approved" className={isDark ? "bg-[#181818]" : "bg-white"}>Approved</option>
                        <option value="packed" className={isDark ? "bg-[#181818]" : "bg-white"}>Packed</option>
                        <option value="delivered" className={isDark ? "bg-[#181818]" : "bg-white"}>Delivered</option>
                        <option value="cancelled" className={isDark ? "bg-[#181818]" : "bg-white"}>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
