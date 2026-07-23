import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import { getAllAreas } from "../../api/area/areas";
import { getAllRetailers } from "../../api/retailers/retailers";
import { sendCustomNotification, getNotificationHistory } from "../../api/notifications/notifications";
import type { HistoryFilterParams } from "../../api/notifications/notifications";

type AreaItem = {
    _id: string;
    name: string;
}

type RetailerItem = {
    _id: string;
    shopName: string;
    ownerName: string;
    phone: string;
}

type HistoryItem = {
    _id: string;
    title: string;
    body: string;
    image?: string;
    targetType: string;
    receiverCount: number;
    failedCount: number;
    status: string;
    createdAt: string;
    sentBy?: { _id: string; name: string; email?: string } | null;
    area?: { _id: string; name: string } | null;
    retailer?: { _id: string; shopName: string; ownerName?: string; phone?: string } | null;
    selectedRetailers: { _id: string; shopName: string; ownerName?: string; phone?: string }[];
    inactiveDays?: number | null;
};

const Notifications: React.FC = () => {
    const { isDark } = useTheme();

    // Tab Control ("send" | "history")
    const [activeTab, setActiveTab] = useState<"send" | "history">("send");

    // =========================================================================
    // Tab 1: SEND NOTIFICATION STATES
    // =========================================================================
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [target, setTarget] = useState<"all" | "selected" | "area" | "retailer" | "inactive">("all");
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState("");
    const [selectedRetailersList, setSelectedRetailersList] = useState<string[]>([]);
    const [areas, setAreas] = useState<AreaItem[]>([]);
    const [retailers, setRetailers] = useState<RetailerItem[]>([]);
    const [retailerSearch, setRetailerSearch] = useState("");
    const [sending, setSending] = useState(false);

    // =========================================================================
    // Tab 2: HISTORY LOG STATES
    // =========================================================================
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [adminsList, setAdminsList] = useState<{ _id: string; name: string }[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Filters
    const [searchFilter, setSearchFilter] = useState("");
    const [targetFilter, setTargetFilter] = useState("");
    const [startFilter, setStartFilter] = useState("");
    const [endFilter, setEndFilter] = useState("");
    const [adminFilter, setAdminFilter] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    // =========================================================================
    // Tab 1: SEND NOTIFICATION LOGIC
    // =========================================================================
    useEffect(() => {
        if (target === 'area' && areas.length === 0) {
            const fetchAreas = async () => {
                try {
                    const res = await getAllAreas();
                    if (res.success) setAreas(res.areas);
                } catch (err) {
                    toast.error("Failed to load areas list");
                }
            };
            fetchAreas();
        }
    }, [target, areas.length]);

    useEffect(() => {
        if ((target === "retailer" || target === "selected") && retailers.length === 0) {
            const fetchRetailers = async () => {
                try {
                    const res = await getAllRetailers();
                    if (res.success) setRetailers(res.retailers);
                } catch (err) {
                    toast.error("Failed to load retailers list");
                }
            };
            fetchRetailers();
        }
    }, [target, retailers.length]);

    const filteredRetailers = retailers.filter((r) => {
        const searchLower = retailerSearch.toLowerCase();
        return (
            r.shopName.toLowerCase().includes(searchLower) ||
            r.ownerName.toLowerCase().includes(searchLower) ||
            r.phone.includes(searchLower)
        );
    });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            toast.error("Title and Body are required.");
            return;
        }
        if (target === "area" && !selectedArea) {
            toast.error("Please select a target Area.");
            return;
        }
        if (target === "retailer" && !selectedRetailer) {
            toast.error("Please select a target Retailer.");
            return;
        }
        if (target === "selected" && selectedRetailersList.length === 0) {
            toast.error("Please select at least one Retailer.");
            return;
        }

        setSending(true);
        try {
            const payload = {
                title,
                body,
                imageUrl: imageUrl.trim() || undefined,
                target,
                areaId: target === "area" ? selectedArea : undefined,
                retailerId: target === "retailer" ? selectedRetailer : undefined,
                retailerIds: target === "selected" ? selectedRetailersList : undefined,
            }
            const res = await sendCustomNotification(payload);
            if (res.success) {
                toast.success("Notification sent successfully!");
                setTitle("");
                setBody("");
                setImageUrl("");
                setSelectedArea("");
                setSelectedRetailer("");
                setSelectedRetailersList([]);
                setRetailerSearch("");
            } else {
                toast.error(res.message || "Failed to dispatch.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Send request failed.");
        } finally {
            setSending(false);
        }
    };

    // =========================================================================
    // Tab 2: HISTORY LOGIC
    // =========================================================================
    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const params: HistoryFilterParams = {
                page,
                limit: 10,
            };
            if (searchFilter.trim()) params.search = searchFilter;
            if (targetFilter) params.targetType = targetFilter;
            if (startFilter) params.startDate = startFilter;
            if (endFilter) params.endDate = endFilter;
            if (adminFilter) params.sentBy = adminFilter;

            const res = await getNotificationHistory(params);
            if (res.success) {
                setHistory(res.notifications);
                setTotalPages(res.totalPages);
                setTotalLogs(res.totalCount);
                if (res.adminsList) {
                    setAdminsList(res.adminsList);
                }
            }
        } catch (err) {
            toast.error("Failed to load notification logs.");
        } finally {
            setHistoryLoading(false);
        }
    };

    // Re-load history logs when pagination or filters change
    useEffect(() => {
        if (activeTab === "history") {
            loadHistory();
        }
    }, [activeTab, page]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new filter
        loadHistory();
    };

    const handleClearFilters = () => {
        setSearchFilter("");
        setTargetFilter("");
        setStartFilter("");
        setEndFilter("");
        setAdminFilter("");
        setPage(1);
        // We trigger manual load because states will not trigger useEffect synchronously
        setTimeout(() => loadHistory(), 50);
    };

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
            isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
        }`}>
            {/* Title Header */}
            <div className={`border-b pb-4 mb-6 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
                <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Push Notifications</h1>
                <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
                    Compose alerts and view historic campaign logs
                </p>
            </div>

            {/* Premium Sub-Tab Switcher */}
            <div className="flex gap-4 mb-8 text-xs font-bold uppercase tracking-wider border-b border-[#222222] pb-1">
                <button
                    onClick={() => setActiveTab("send")}
                    className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer ${
                        activeTab === "send"
                            ? isDark ? "border-brand-gold text-brand-gold" : "border-brand-maroon text-brand-maroon"
                            : "border-transparent text-gray-500 hover:text-current"
                    }`}
                >
                    Send Push Alert
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer ${
                        activeTab === "history"
                            ? isDark ? "border-brand-gold text-brand-gold" : "border-brand-maroon text-brand-maroon"
                            : "border-transparent text-gray-500 hover:text-current"
                    }`}
                >
                    History logs ({totalLogs})
                </button>
            </div>

            {/* Dynamic Content Display */}
            {activeTab === "send" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Side: Composing Form */}
                    <div className={`lg:col-span-7 p-8 border rounded-none shadow-lg h-fit ${
                        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                    }`}>
                        <h2 className="font-sans text-sm uppercase font-extrabold tracking-wider mb-6">
                            Compose Custom Alert
                        </h2>
                        <form onSubmit={handleSend} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold uppercase tracking-wider">Notification Title *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={60}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Special Festive Offer!"
                                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                                        isDark
                                            ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                                            : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                                    }`}
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold uppercase tracking-wider">Message Body *</label>
                                <textarea
                                    required
                                    rows={3}
                                    maxLength={240}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your push notification message details here..."
                                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                                        isDark
                                            ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                                            : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                                    }`}
                                />
                            </div>

                            {/* Image */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold uppercase tracking-wider">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="e.g. https://example.com/banner.png"
                                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                                        isDark
                                            ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                                            : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                                    }`}
                                />
                            </div>

                            {/* Target Radio Grid */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider">Target Audience</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                        target === "all" ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5" : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                    }`}>
                                        <input type="radio" name="target" checked={target === "all"} onChange={() => setTarget("all")} className="accent-brand-maroon h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">All Retailers</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                        target === "selected" ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5" : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                    }`}>
                                        <input type="radio" name="target" checked={target === "selected"} onChange={() => setTarget("selected")} className="accent-brand-maroon h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Selected Retailers</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                        target === "area" ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5" : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                    }`}>
                                        <input type="radio" name="target" checked={target === "area"} onChange={() => setTarget("area")} className="accent-brand-maroon h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Area Wise</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                        target === "retailer" ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5" : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                    }`}>
                                        <input type="radio" name="target" checked={target === "retailer"} onChange={() => setTarget("retailer")} className="accent-brand-maroon h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Single Retailer</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none md:col-span-2 ${
                                        target === "inactive" ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5" : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                    }`}>
                                        <input type="radio" name="target" checked={target === "inactive"} onChange={() => setTarget("inactive")} className="accent-brand-maroon h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Inactive (7+ days)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Target Specific Selectors */}
                            {target === "selected" && (
                                <div className="space-y-4 animate-fadeIn duration-200">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search..."
                                        value={retailerSearch}
                                        onChange={(e) => setRetailerSearch(e.target.value)}
                                        className={`w-full px-3 py-2 bg-transparent border text-xs transition-all duration-200 rounded-none focus:outline-none ${
                                            isDark ? "border-[#333333] text-brand-cream" : "border-[#D6CFC1] text-brand-charcoal"
                                        }`}
                                    />
                                    <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider mb-2">
                                        <button type="button" onClick={() => setSelectedRetailersList(filteredRetailers.map(r => r._id))} className="text-brand-gold hover:text-white cursor-pointer">Select All Matching</button>
                                        <button type="button" onClick={() => setSelectedRetailersList([])} className="text-gray-500 hover:text-white cursor-pointer">Deselect All</button>
                                    </div>
                                    <div className={`border max-h-56 overflow-y-auto p-2 space-y-1 ${
                                        isDark ? "border-[#2A2A2A] bg-[#111111]" : "border-[#E8E2D5] bg-[#FDFCF9]"
                                    }`}>
                                        {filteredRetailers.map(r => {
                                            const isChecked = selectedRetailersList.includes(r._id);
                                            return (
                                                <label key={r._id} className="flex items-center gap-3 p-2 text-xs cursor-pointer">
                                                    <input type="checkbox" checked={isChecked} onChange={() => setSelectedRetailersList(isChecked ? selectedRetailersList.filter(id => id !== r._id) : [...selectedRetailersList, r._id])} className="accent-brand-maroon h-4 w-4" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-extrabold uppercase truncate">{r.shopName}</p>
                                                        <p className="text-[10px] opacity-60">{r.ownerName} • {r.phone}</p>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider">
                                        Selected: <span className="text-brand-gold">{selectedRetailersList.length}</span> Retailers
                                    </div>
                                </div>
                            )}

                            {target === "area" && (
                                <div className="space-y-1 font-bold">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider">Target Area *</label>
                                    <select required value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className={`w-full px-3 py-2 bg-transparent border text-sm rounded-none focus:outline-none ${isDark ? "border-[#333333] bg-[#181818] text-brand-cream" : "border-[#D6CFC1] bg-white text-brand-charcoal"}`}>
                                        <option value="">Select Target Area</option>
                                        {areas.map(a => <option key={a._id} value={a._id} className={isDark ? "bg-[#181818]" : "bg-white"}>{a.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {target === "retailer" && (
                                <div className="space-y-3 font-bold">
                                    <input type="text" placeholder="Type to filter..." value={retailerSearch} onChange={(e) => setRetailerSearch(e.target.value)} className={`w-full px-3 py-2 bg-transparent border text-xs focus:outline-none ${isDark ? "border-[#333333]" : "border-[#D6CFC1]"}`} />
                                    <select required value={selectedRetailer} onChange={(e) => setSelectedRetailer(e.target.value)} className={`w-full px-3 py-2 bg-transparent border text-sm rounded-none focus:outline-none ${isDark ? "border-[#333333] bg-[#181818] text-brand-cream" : "border-[#D6CFC1] bg-white text-brand-charcoal"}`}>
                                        <option value="">Select Target Retailer</option>
                                        {filteredRetailers.map(r => <option key={r._id} value={r._id} className={isDark ? "bg-[#181818]" : "bg-white"}>{r.shopName} ({r.ownerName})</option>)}
                                    </select>
                                </div>
                            )}

                            <button type="submit" disabled={sending} className={`w-full py-3 font-bold tracking-[0.25em] text-xs uppercase border transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2 ${
                                sending ? "opacity-50" : isDark ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent" : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:text-brand-maroon"
                            }`}>
                                {sending ? "Sending..." : "Send Notification"}
                            </button>
                        </form>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="lg:col-span-5 flex flex-col justify-start items-center">
                        <h2 className="font-sans text-xs uppercase font-extrabold tracking-widest mb-6 self-start">Device Live Preview</h2>
                        <div className={`relative w-80 h-[560px] border-[12px] shadow-2xl overflow-hidden rounded-[40px] flex flex-col ${isDark ? "border-[#222222] bg-[#000000]" : "border-[#E8E2D5] bg-[#FFFFFF]"}`}>
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl z-20 ${isDark ? "bg-[#222222]" : "bg-[#E8E2D5]"}`} />
                            <div className="p-4 pt-10 flex-1 relative flex flex-col justify-start">
                                <div className={`absolute inset-0 z-0 opacity-40 filter blur-xl ${isDark ? "bg-gradient-to-tr from-brand-maroon via-purple-950 to-slate-900" : "bg-gradient-to-tr from-brand-beige via-yellow-100 to-amber-200"}`} />
                                <div className={`absolute top-1.5 inset-x-0 px-6 flex justify-between items-center text-[10px] font-semibold z-10 ${isDark ? "text-white/60" : "text-black/60"}`}>
                                    <span>12:00</span>
                                    <div className="flex items-center gap-1">
                                        <span>5G</span>
                                        <div className={`w-4 h-2.5 border rounded-sm flex items-center p-0.5 ${isDark ? "border-white/50" : "border-black/50"}`}>
                                            <div className={`h-full w-full rounded-2xs ${isDark ? "bg-white" : "bg-black"}`} />
                                        </div>
                                    </div>
                                </div>
                                <div className={`z-10 w-full p-4 rounded-2xl shadow-lg border backdrop-blur-md select-none ${isDark ? "bg-[#181818]/90 border-white/10 text-white" : "bg-white/95 border-black/5 text-[#1B1B1B]"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-brand-maroon rounded-md flex items-center justify-center font-bold text-[9px] text-white">BNB</div>
                                            <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">Balaji Namkeen</span>
                                        </div>
                                        <span className="text-[9px] opacity-50 font-medium">now</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[13px] font-extrabold leading-tight tracking-wide">{title || "Notification Title Preview"}</h4>
                                        <p className="text-[11px] leading-relaxed opacity-70">{body || "Compose body to preview..."}</p>
                                    </div>
                                    {imageUrl.trim() && (
                                        <div className="mt-3 overflow-hidden rounded-lg aspect-video border border-black/5">
                                            <img src={imageUrl} alt="banner" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "https://placehold.co/100"} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Tab 2: HISTORY LOGS LIST */
                <div className="space-y-6">
                    {/* Filter Panel */}
                    <form onSubmit={handleFilterSubmit} className={`p-5 border rounded-none shadow-sm space-y-4 ${
                        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                    }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider">Search</label>
                                <input
                                    type="text"
                                    placeholder="Title, body content..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className={`w-full px-3 py-1.5 bg-transparent border text-xs rounded-none focus:outline-none ${
                                        isDark ? "border-[#333333] text-brand-cream focus:border-brand-gold" : "border-[#D6CFC1] text-brand-charcoal focus:border-brand-maroon"
                                    }`}
                                />
                            </div>

                            {/* Target Type */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider">Target Group</label>
                                <select
                                    value={targetFilter}
                                    onChange={(e) => setTargetFilter(e.target.value)}
                                    className={`w-full px-3 py-1.5 bg-transparent border text-xs rounded-none focus:outline-none ${
                                        isDark ? "border-[#333333] bg-[#181818] text-brand-cream focus:border-brand-gold" : "border-[#D6CFC1] bg-white text-brand-charcoal focus:border-brand-maroon"
                                    }`}
                                >
                                    <option value="">All Targets</option>
                                    <option value="all">All Retailers</option>
                                    <option value="selected">Selected Retailers</option>
                                    <option value="area">Area Wise</option>
                                    <option value="single">Single Retailer</option>
                                    <option value="inactive">Inactive (7+ days)</option>
                                </select>
                            </div>

                            {/* Admin Sender */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider">Sent By</label>
                                <select
                                    value={adminFilter}
                                    onChange={(e) => setAdminFilter(e.target.value)}
                                    className={`w-full px-3 py-1.5 bg-transparent border text-xs rounded-none focus:outline-none ${
                                        isDark ? "border-[#333333] bg-[#181818] text-brand-cream" : "border-[#D6CFC1] bg-white text-brand-charcoal"
                                    }`}
                                >
                                    <option value="">All Senders</option>
                                    <option value="system">System (Automated)</option>
                                    {adminsList.map(adm => (
                                        <option key={adm._id} value={adm._id}>{adm.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider">Start Date</label>
                                <input
                                    type="date"
                                    value={startFilter}
                                    onChange={(e) => setStartFilter(e.target.value)}
                                    className={`w-full px-3 py-1 bg-transparent border text-xs rounded-none focus:outline-none ${
                                        isDark ? "border-[#333333] text-brand-cream" : "border-[#D6CFC1] text-brand-charcoal"
                                    }`}
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider">End Date</label>
                                <input
                                    type="date"
                                    value={endFilter}
                                    onChange={(e) => setEndFilter(e.target.value)}
                                    className={`w-full px-3 py-1 bg-transparent border text-xs rounded-none focus:outline-none ${
                                        isDark ? "border-[#333333] text-brand-cream" : "border-[#D6CFC1] text-brand-charcoal"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all ${
                                    isDark ? "border-gray-700 hover:border-gray-500 text-gray-400" : "border-gray-300 hover:border-gray-500 text-gray-600"
                                }`}
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-none cursor-pointer ${
                                    isDark ? "bg-brand-gold border-brand-gold text-brand-charcoal hover:bg-transparent hover:text-brand-gold" : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:text-brand-maroon"
                                }`}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </form>

                    {/* Accordion Log list */}
                    <div className={`border rounded-none overflow-hidden ${
                        isDark ? "border-[#2A2A2A] bg-[#181818]" : "border-[#E8E2D5] bg-white"
                    }`}>
                        {historyLoading ? (
                            <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                                Loading campaign logs...
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                                No historic logs matched.
                            </div>
                        ) : (
                            <div className="divide-y divide-current/10">
                                {history.map((item) => {
                                    const isExpanded = expandedRow === item._id;
                                    const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
                                        dateStyle: "short",
                                        timeStyle: "short"
                                    });

                                    return (
                                        <div key={item._id} className="transition-all duration-200">
                                            {/* Row Header */}
                                            <div
                                                onClick={() => toggleRow(item._id)}
                                                className={`p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none transition-colors duration-150 ${
                                                    isExpanded
                                                        ? isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"
                                                        : isDark ? "hover:bg-white/[0.01]" : "hover:bg-black/[0.01]"
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold uppercase tracking-wider truncate">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[10px] opacity-50 mt-0.5">
                                                        Target: <span className="font-semibold uppercase">{item.targetType === "single" ? "Single Retailer" : item.targetType}</span> • Sent by: <span className="font-semibold">{item.sentBy ? item.sentBy.name : "System"}</span>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-6 text-[10px]">
                                                    <div className="text-right whitespace-nowrap">
                                                        <span className="text-green-500 font-bold">{item.receiverCount} Delivered</span>
                                                        {item.failedCount > 0 && (
                                                            <span className="text-red-500 font-bold ml-2">({item.failedCount} Failed)</span>
                                                        )}
                                                    </div>
                                                    <span className="opacity-60 whitespace-nowrap">{formattedDate}</span>
                                                    <svg
                                                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Accordion Detail Panel */}
                                            {isExpanded && (
                                                <div className={`p-5 text-xs border-t space-y-4 ${
                                                    isDark ? "bg-[#141414] border-[#2A2A2A]" : "bg-[#FAF8F5] border-[#E8E2D5]"
                                                }`}>
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                        <div className="md:col-span-8 space-y-3">
                                                            <div>
                                                                <span className="block text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">Message Body</span>
                                                                <p className="text-xs leading-relaxed opacity-90">{item.body}</p>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">Target Details</span>
                                                                <p className="opacity-95 font-semibold">
                                                                    {item.targetType === "all" && "All Retailers"}
                                                                    {item.targetType === "single" && item.retailer && (
                                                                        `Single Retailer: ${item.retailer.shopName} (${item.retailer.ownerName} - ${item.retailer.phone})`
                                                                    )}
                                                                    {item.targetType === "area" && item.area && (
                                                                        `Area Wise: ${item.area.name}`
                                                                    )}
                                                                    {item.targetType === "inactive" && (
                                                                        `Inactive Retailers (${item.inactiveDays || 7} Days threshold)`
                                                                    )}
                                                                    {item.targetType === "selected" && (
                                                                        `Selected Retailers: ${item.selectedRetailers?.map(r => r.shopName).join(", ") || "None"}`
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {item.image && (
                                                            <div className="md:col-span-4 space-y-1.5">
                                                                <span className="block text-[9px] font-bold uppercase tracking-widest opacity-50">Attachment Preview</span>
                                                                <div className="border border-current/10 rounded overflow-hidden aspect-video max-h-32">
                                                                    <img
                                                                        src={item.image}
                                                                        alt="attachment"
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => e.currentTarget.src = "https://placehold.co/100"}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="pt-3 border-t flex flex-wrap gap-x-8 gap-y-2 opacity-60 text-[10px]">
                                                        <span>Campaign Status: <b className="uppercase">{item.status}</b></span>
                                                        <span>Sent Date: <b>{new Date(item.createdAt).toLocaleString()}</b></span>
                                                        <span>Sent By: <b>{item.sentBy ? `${item.sentBy.name} (${item.sentBy.email})` : "Automated System"}</b></span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest pt-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                className={`px-4 py-2 border transition-all cursor-pointer ${
                                    page === 1
                                        ? "opacity-35 cursor-not-allowed border-current/10"
                                        : isDark ? "border-[#2A2A2A] hover:border-brand-gold text-brand-cream hover:text-brand-gold" : "border-[#E8E2D5] hover:border-brand-maroon text-[#6B6358] hover:text-brand-maroon"
                                }`}
                            >
                                Previous
                            </button>
                            <span className="opacity-80">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                className={`px-4 py-2 border transition-all cursor-pointer ${
                                    page === totalPages
                                        ? "opacity-35 cursor-not-allowed border-current/10"
                                        : isDark ? "border-[#2A2A2A] hover:border-brand-gold text-brand-cream hover:text-brand-gold" : "border-[#E8E2D5] hover:border-brand-maroon text-[#6B6358] hover:text-brand-maroon"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
