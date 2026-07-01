import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getSingleOrder, updateOrderStatus, editOrder } from "../../api/orders/orders";
import toast from "react-hot-toast";

type ProductDetail = {
    _id: string;
    name: string;
    images?: string[];
};

type OrderItem = {
    productId: ProductDetail | null;
    packetSize: string;
    quantityKg: number;
    notes?: string;
};

type OrderDetailType = {
    _id: string;
    retailerId: {
        _id: string;
        shopName: string;
        ownerName: string;
        phone: string;
        address: string;
    } | null;
    items: OrderItem[];
    status: "pending" | "approved" | "packed" | "delivered" | "cancelled";
    adminNote?: string;
    totalkg: number;
    createdAt: string;
};

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
    const [adminNote, setAdminNote] = useState("");

    const fetchOrderDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getSingleOrder(id);
            if (data.success) {
                setOrder(data.order);
            } else {
                toast.error("Failed to load order details");
            }
        } catch (err: any) {
            toast.error("Error fetching order details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;
        try {
            const res = await updateOrderStatus(order._id, newStatus);
            if (res.success) {
                toast.success(res.message || "Order status updated");
                setOrder((prev) => (prev ? { ...prev, status: res.order.status } : null));
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleStartEditing = () => {
        if (!order) return;
        // Deep copy items to avoid direct state mutation
        setEditedItems(JSON.parse(JSON.stringify(order.items)));
        setAdminNote(order.adminNote || "");
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setIsEditing(false);
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        setEditedItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleRemoveItem = (index: number) => {
        setEditedItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSaveChanges = async () => {
        if (!order) return;
        if (editedItems.length === 0) {
            toast.error("An order must contain at least one item.");
            return;
        }

        try {
            const payloadItems = editedItems.map((item) => ({
                productId: item.productId?._id || "",
                packetSize: item.packetSize,
                quantityKg: Number(item.quantityKg),
                notes: item.notes || ""
            }));

            const res = await editOrder(order._id, payloadItems, adminNote);
            if (res.success) {
                toast.success("Order updated successfully");
                await fetchOrderDetails();
                setIsEditing(false);
            } else {
                toast.error(res.message || "Failed to update order");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save order modifications");
        }
    };

    if (loading) {
        return (
            <div className={`p-8 min-h-screen flex items-center justify-center font-sans ${isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
                }`}>
                <div className="text-xs uppercase tracking-widest font-bold animate-pulse">
                    Loading order details...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={`p-8 min-h-screen flex flex-col items-center justify-center font-sans ${isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
                }`}>
                <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Order Not Found</h2>
                <button
                    onClick={() => navigate("/orders")}
                    className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 cursor-pointer ${isDark
                        ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                        : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                        }`}
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className={`p-8 min-h-screen transition-colors duration-300 font-sans ${isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
            }`}>
            {/* Header */}
            <div className={`border-b pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"
                }`}>
                <div>
                    <button
                        onClick={() => navigate("/orders")}
                        className="text-[10px] uppercase font-bold tracking-wider hover:underline mb-2 flex items-center gap-1 cursor-pointer"
                    >
                        ← Back to List
                    </button>
                    <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">
                        Order Details
                    </h1>
                    <p className={`text-xs mt-1 font-mono opacity-60`}>
                        ID: {order._id}
                    </p>
                </div>

                {/* Status Dropdown & Edit Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider">Status:</span>
                        <select
                            disabled={isEditing}
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`bg-transparent border text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 focus:outline-none cursor-pointer transition-all duration-150 rounded-full hover:scale-[1.03] active:scale-95 ${
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
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={handleStartEditing}
                            className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest border transition-all duration-200 cursor-pointer ${isDark
                                ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                                : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                                }`}
                        >
                            Edit Items/Note
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSaveChanges}
                                className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest border border-green-600 bg-green-600 text-white hover:bg-transparent hover:text-green-500 cursor-pointer transition-all"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelEditing}
                                className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest border border-gray-500 hover:bg-gray-500 hover:text-white cursor-pointer transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Retailer Info */}
                <div className={`p-5 border lg:col-span-1 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                    }`}>
                    <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-4 border-b pb-2">
                        Retailer Information
                    </h2>
                    <div className="space-y-3 text-xs">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Shop Name</span>
                            <span className="font-bold">{order.retailerId?.shopName || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Owner Name</span>
                            <span>{order.retailerId?.ownerName || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Phone Contact</span>
                            <a href={`tel:${order.retailerId?.phone}`} className="hover:underline text-brand-gold font-mono">
                                {order.retailerId?.phone || "N/A"}
                            </a>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Delivery Address</span>
                            <p className="normal-case leading-relaxed text-[#7A7263]">
                                {order.retailerId?.address || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Info Summary */}
                <div className={`p-5 border lg:col-span-2 ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                    }`}>
                    <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-4 border-b pb-2">
                        Order Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Order Date</span>
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Total Weight</span>
                            <span className="font-mono font-bold text-base text-brand-gold">{order.totalkg} kg</span>
                        </div>

                        {isEditing ? (
                            <div className="col-span-2 mt-2">
                                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block mb-1">
                                    Admin Notes (Explaining changes to customer)
                                </span>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    className={`w-full p-2 text-xs border focus:outline-none rounded-none resize-y ${isDark
                                        ? "bg-[#111111] border-[#333333] text-brand-cream focus:border-brand-gold"
                                        : "bg-white border-[#E8E2D5] text-brand-charcoal focus:border-brand-maroon"
                                        }`}
                                    rows={3}
                                    placeholder="e.g. Reduced quantity of Kaju Katli due to stock limits..."
                                />
                            </div>
                        ) : (
                            order.adminNote && (
                                <div className="col-span-2 mt-2">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 block">Admin Notes</span>
                                    <p className="normal-case bg-black/10 p-2 border border-brand-maroon/20 italic">
                                        {order.adminNote}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Items Breakdown Table */}
            <div className={`border overflow-hidden rounded-none ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                }`}>
                <div className="p-4 border-b border-inherit">
                    <h3 className="font-sans uppercase tracking-wider text-xs font-extrabold">Ordered Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
                        <thead>
                            <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                                <th className="p-4 font-bold">Product Name</th>
                                <th className="p-4 font-bold w-32">Packet Size</th>
                                <th className="p-4 font-bold w-36">Quantity (Kg)</th>
                                <th className="p-4 font-bold">Special Notes</th>
                                {isEditing && <th className="p-4 font-bold text-right pr-6 w-24">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(isEditing ? editedItems : order.items).map((item, idx) => (
                                <tr key={idx} className={`border-b transition-colors duration-150 ${isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"
                                    }`}>
                                    <td className="p-4 font-semibold normal-case">
                                        {item.productId?.name || "Deleted Product"}
                                    </td>
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={item.packetSize}
                                                onChange={(e) => handleItemChange(idx, "packetSize", e.target.value)}
                                                className={`p-1 text-xs border w-full font-mono rounded-none focus:outline-none ${isDark
                                                    ? "bg-[#111111] border-[#333333] text-brand-cream focus:border-brand-gold"
                                                    : "bg-white border-[#E8E2D5] text-brand-charcoal focus:border-brand-maroon"
                                                    }`}
                                            />
                                        ) : (
                                            <span className="font-mono">{item.packetSize}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={item.quantityKg}
                                                onChange={(e) => handleItemChange(idx, "quantityKg", parseFloat(e.target.value) || 0)}
                                                className={`p-1 text-xs border w-full font-mono font-bold rounded-none focus:outline-none ${isDark
                                                    ? "bg-[#111111] border-[#333333] text-brand-gold focus:border-brand-gold"
                                                    : "bg-white border-[#E8E2D5] text-brand-maroon focus:border-brand-maroon"
                                                    }`}
                                            />
                                        ) : (
                                            <span className="font-mono font-bold text-brand-gold">{item.quantityKg} kg</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={item.notes || ""}
                                                onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                                                placeholder="Write optional notes..."
                                                className={`p-1 text-xs border w-full rounded-none focus:outline-none ${isDark
                                                    ? "bg-[#111111] border-[#333333] text-brand-cream focus:border-brand-gold"
                                                    : "bg-white border-[#E8E2D5] text-brand-charcoal focus:border-brand-maroon"
                                                    }`}
                                            />
                                        ) : (
                                            <span className="normal-case text-gray-500 italic">
                                                {item.notes || "—"}
                                            </span>
                                        )}
                                    </td>
                                    {isEditing && (
                                        <td className="p-4 text-right pr-6">
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
