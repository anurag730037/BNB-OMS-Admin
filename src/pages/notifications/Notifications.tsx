import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import { getAllAreas } from "../../api/area/areas";
import { getAllRetailers } from "../../api/retailers/retailers";
import { sendCustomNotification } from "../../api/notifications/notifications";

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

const Notifications: React.FC = () => {
    const { isDark } = useTheme();

    // Form Fields
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [target, setTarget] = useState<"all" | "selected" | "area" | "retailer" | "inactive">("all");
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState("");
    const [selectedRetailersList, setSelectedRetailersList] = useState<string[]>([]); // Store selected ID list

    // Data Lists
    const [areas, setAreas] = useState<AreaItem[]>([]);
    const [retailers, setRetailers] = useState<RetailerItem[]>([]);

    // Search filter for Retailer selection
    const [retailerSearch, setRetailerSearch] = useState("");

    // Loading States
    const [sending, setSending] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [loadingRetailers, setLoadingRetailers] = useState(false);

    // Fetch Areas list when target is "area"
    useEffect(() => {
        if (target === 'area' && areas.length === 0) {
            const fetchAreas = async () => {
                setLoadingAreas(true);
                try {
                    const res = await getAllAreas();
                    if (res.success) {
                        setAreas(res.areas);
                    }
                } catch (err) {
                    toast.error("Failed to load areas list");
                } finally {
                    setLoadingAreas(false);
                }
            }
            fetchAreas();
        }
    }, [target, areas.length]);

    // Fetch Retailers list when target requires a retailer search (single or multi-select)
    useEffect(() => {
        if ((target === "retailer" || target === "selected") && retailers.length === 0) {
            const fetchRetailers = async () => {
                setLoadingRetailers(true);
                try {
                    const res = await getAllRetailers();
                    if (res.success) {
                        setRetailers(res.retailers);
                    }
                } catch (err) {
                    toast.error("Failed to load retailers list");
                } finally {
                    setLoadingRetailers(false);
                }
            }
            fetchRetailers();
        }
    }, [target, retailers.length]);

    // Filter retailers locally by search text
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

        // Validation
        if (!title.trim()) {
            toast.error("Notification Title is required.");
            return;
        }
        if (!body.trim()) {
            toast.error("Notification Body is required.");
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
                toast.success("Push notification dispatched successfully!");
                // Reset form fields
                setTitle("");
                setBody("");
                setImageUrl("");
                setSelectedArea("");
                setSelectedRetailer("");
                setSelectedRetailersList([]);
                setRetailerSearch("");
            } else {
                toast.error(res.message || "Failed to dispatch notification.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong while sending.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
            isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
        }`}>
            {/* Title Header */}
            <div className={`border-b pb-4 mb-8 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
                <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Push Notifications</h1>
                <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
                    Compose and dispatch push alerts directly to retail client devices
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Side: Composing Form */}
                <div className={`lg:col-span-7 p-8 border rounded-none shadow-lg h-fit ${
                    isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                }`}>
                    <h2 className="font-sans text-sm uppercase font-extrabold tracking-wider mb-6">
                        Compose Custom Alert
                    </h2>
                    <form onSubmit={handleSend} className="space-y-6">
                        {/* Title Input */}
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

                        {/* Body Textarea */}
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

                        {/* Image URL Optional */}
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

                        {/* Targeting Option Grid */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider">Target Audience</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                {/* All Retailers */}
                                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                    target === "all"
                                        ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5"
                                        : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                }`}>
                                    <input
                                        type="radio"
                                        name="target"
                                        value="all"
                                        checked={target === "all"}
                                        onChange={() => setTarget("all")}
                                        className="accent-brand-maroon h-4 w-4"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">All Retailers</span>
                                </label>

                                {/* Selected Retailers */}
                                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                    target === "selected"
                                        ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5"
                                        : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                }`}>
                                    <input
                                        type="radio"
                                        name="target"
                                        value="selected"
                                        checked={target === "selected"}
                                        onChange={() => setTarget("selected")}
                                        className="accent-brand-maroon h-4 w-4"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">Selected Retailers</span>
                                </label>

                                {/* Area Wise */}
                                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                    target === "area"
                                        ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5"
                                        : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                }`}>
                                    <input
                                        type="radio"
                                        name="target"
                                        value="area"
                                        checked={target === "area"}
                                        onChange={() => setTarget("area")}
                                        className="accent-brand-maroon h-4 w-4"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">Area Wise</span>
                                </label>

                                {/* Single Retailer */}
                                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none ${
                                    target === "retailer"
                                        ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5"
                                        : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                }`}>
                                    <input
                                        type="radio"
                                        name="target"
                                        value="retailer"
                                        checked={target === "retailer"}
                                        onChange={() => setTarget("retailer")}
                                        className="accent-brand-maroon h-4 w-4"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">Single Retailer</span>
                                </label>

                                {/* Inactive Retailers (7+ days) */}
                                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 rounded-none md:col-span-2 ${
                                    target === "inactive"
                                        ? isDark ? "border-brand-gold bg-brand-gold/10" : "border-brand-maroon bg-brand-maroon/5"
                                        : isDark ? "border-[#2A2A2A] hover:bg-white/[0.02]" : "border-[#E8E2D5] hover:bg-black/[0.01]"
                                }`}>
                                    <input
                                        type="radio"
                                        name="target"
                                        value="inactive"
                                        checked={target === "inactive"}
                                        onChange={() => setTarget("inactive")}
                                        className="accent-brand-maroon h-4 w-4"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">Inactive (7+ days)</span>
                                </label>
                            </div>
                        </div>

                        {/* Target: Selected Retailers Panel */}
                        {target === "selected" && (
                            <div className="space-y-4 animate-fadeIn duration-200">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider">
                                        Search Retailers
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="🔍 Search..."
                                        value={retailerSearch}
                                        onChange={(e) => setRetailerSearch(e.target.value)}
                                        className={`w-full px-3 py-2 bg-transparent border text-xs transition-all duration-200 rounded-none focus:outline-none mb-2 ${
                                            isDark
                                                ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                                                : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                                        }`}
                                    />

                                    {/* Action Buttons to Select / Deselect match results */}
                                    <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider mb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const matches = filteredRetailers.map((r) => r._id);
                                                setSelectedRetailersList((prev) => Array.from(new Set([...prev, ...matches])));
                                            }}
                                            className={`cursor-pointer transition-colors ${
                                                isDark ? "text-brand-gold hover:text-white" : "text-brand-maroon hover:opacity-80"
                                            }`}
                                        >
                                            Select All Matching
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const matches = new Set(filteredRetailers.map((r) => r._id));
                                                setSelectedRetailersList((prev) => prev.filter((id) => !matches.has(id)));
                                            }}
                                            className={`cursor-pointer transition-colors ${
                                                isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-black"
                                            }`}
                                        >
                                            Deselect All Matching
                                        </button>
                                    </div>

                                    {loadingRetailers ? (
                                        <div className="text-xs italic py-2">Loading Retailers...</div>
                                    ) : (
                                        <div className={`border max-h-56 overflow-y-auto rounded-none p-2 space-y-1 ${
                                            isDark ? "border-[#2A2A2A] bg-[#111111]" : "border-[#E8E2D5] bg-[#FDFCF9]"
                                        }`}>
                                            {filteredRetailers.length === 0 ? (
                                                <div className="text-xs text-gray-500 p-2 uppercase tracking-wider font-semibold">
                                                    No retailers match your search
                                                </div>
                                            ) : (
                                                filteredRetailers.map((r) => {
                                                    const isChecked = selectedRetailersList.includes(r._id);
                                                    return (
                                                        <label
                                                            key={r._id}
                                                            className={`flex items-center gap-3 p-2 text-xs transition-colors duration-150 cursor-pointer rounded-none ${
                                                                isChecked
                                                                    ? isDark ? "bg-white/5 text-white" : "bg-[#F3EFE7] text-brand-charcoal"
                                                                    : isDark ? "hover:bg-white/[0.02]" : "hover:bg-[#FDFCF9]"
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    if (isChecked) {
                                                                        setSelectedRetailersList((prev) => prev.filter((id) => id !== r._id));
                                                                    } else {
                                                                        setSelectedRetailersList((prev) => [...prev, r._id]);
                                                                    }
                                                                }}
                                                                className="accent-brand-maroon h-4 w-4 rounded-sm border-gray-300"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-extrabold uppercase tracking-wide truncate">{r.shopName}</p>
                                                                <p className={`text-[10px] opacity-60 ${isDark ? "text-gray-400" : "text-[#6B6358]"}`}>
                                                                    {r.ownerName} • {r.phone}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[11px] font-bold uppercase tracking-wider mt-1">
                                    Selected: <span className={isDark ? "text-brand-gold" : "text-brand-maroon"}>{selectedRetailersList.length}</span> Retailers
                                </div>
                            </div>
                        )}

                        {/* Conditional Dropdown for Area-Wise Target */}
                        {target === "area" && (
                            <div className="space-y-1 animate-fadeIn duration-200">
                                <label className="block text-[11px] font-bold uppercase tracking-wider">Target Area / Region *</label>
                                {loadingAreas ? (
                                    <div className="text-xs italic py-2">Loading Areas...</div>
                                ) : (
                                    <select
                                        required
                                        value={selectedArea}
                                        onChange={(e) => setSelectedArea(e.target.value)}
                                        className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                                            isDark
                                                ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                                                : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                                        }`}
                                    >
                                        <option value="" disabled className={isDark ? "bg-[#181818]" : "bg-white"}>
                                            Select Target Area
                                        </option>
                                        {areas.map((a) => (
                                            <option key={a._id} value={a._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Conditional Filter Select for Single Retailer Target */}
                        {target === "retailer" && (
                            <div className="space-y-3 animate-fadeIn duration-200">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider">
                                        Search & Select Retailer *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Type to filter retailers by shop or owner name..."
                                        value={retailerSearch}
                                        onChange={(e) => setRetailerSearch(e.target.value)}
                                        className={`w-full px-3 py-2 bg-transparent border text-xs transition-all duration-200 rounded-none focus:outline-none mb-2 ${
                                            isDark
                                                ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                                                : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                                        }`}
                                    />
                                    {loadingRetailers ? (
                                        <div className="text-xs italic py-2">Loading Retailers...</div>
                                    ) : (
                                        <select
                                            required
                                            value={selectedRetailer}
                                            onChange={(e) => setSelectedRetailer(e.target.value)}
                                            className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                                                isDark
                                                    ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                                                    : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                                            }`}
                                        >
                                            <option value="" disabled className={isDark ? "bg-[#181818]" : "bg-white"}>
                                                Select Target Retailer ({filteredRetailers.length} matching)
                                            </option>
                                            {filteredRetailers.map((r) => (
                                                <option key={r._id} value={r._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                                                    {r.shopName} ({r.ownerName} - {r.phone})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Send Button */}
                        <button
                            type="submit"
                            disabled={sending}
                            className={`w-full py-3 font-bold tracking-[0.25em] text-xs uppercase border transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2 ${
                                sending
                                    ? "opacity-50 cursor-not-allowed border-gray-500 text-gray-500 bg-transparent"
                                    : isDark
                                    ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                                    : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                            }`}
                        >
                            {sending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Dispatching...</span>
                                </>
                            ) : (
                                <span>Send Notification</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side: Device Preview Mockup */}
                <div className="lg:col-span-5 flex flex-col justify-start items-center">
                    <h2 className="font-sans text-xs uppercase font-extrabold tracking-widest mb-6 self-start">
                        Device Live Preview
                    </h2>
                    {/* Smartphone Frame Wrapper */}
                    <div className={`relative w-80 h-[560px] border-[12px] shadow-2xl overflow-hidden rounded-[40px] flex flex-col ${
                        isDark ? "border-[#222222] bg-[#000000]" : "border-[#E8E2D5] bg-[#FFFFFF]"
                    }`}>
                        {/* Speaker Camera Notch */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl z-20 ${
                            isDark ? "bg-[#222222]" : "bg-[#E8E2D5]"
                        }`} />
                        {/* Notification Interface Container */}
                        <div className="p-4 pt-10 flex-1 flex flex-col justify-start relative">
                            {/* Wallpaper background overlay */}
                            <div className={`absolute inset-0 z-0 opacity-40 filter blur-xl ${
                                isDark
                                    ? "bg-gradient-to-tr from-brand-maroon via-purple-950 to-slate-900"
                                    : "bg-gradient-to-tr from-brand-beige via-yellow-100 to-amber-200"
                            }`} />
                            {/* Status Bar */}
                            <div className={`absolute top-1.5 inset-x-0 px-6 flex justify-between items-center text-[10px] font-semibold z-10 ${
                                isDark ? "text-white/60" : "text-black/60"
                            }`}>
                                <span>12:00</span>
                                <div className="flex items-center gap-1">
                                    <span>5G</span>
                                    <div className={`w-4 h-2.5 border rounded-sm flex items-center p-0.5 ${isDark ? "border-white/50" : "border-black/50"}`}>
                                        <div className={`h-full w-full rounded-2xs ${isDark ? "bg-white" : "bg-black"}`} />
                                    </div>
                                </div>
                            </div>
                            {/* Notification Push Bubble Card */}
                            <div className={`z-10 w-full p-4 rounded-2xl shadow-lg border transition-all duration-300 select-none ${
                                isDark
                                    ? "bg-[#181818]/90 border-white/10 text-white backdrop-blur-md"
                                    : "bg-white/95 border-black/5 text-[#1B1B1B] backdrop-blur-md"
                            }`}>
                                {/* Header of Push Card */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-brand-maroon rounded-md flex items-center justify-center font-bold text-[9px] text-white">
                                            BNB
                                        </div>
                                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                                            Balaji Namkeen
                                        </span>
                                    </div>
                                    <span className="text-[9px] opacity-50 font-medium">now</span>
                                </div>
                                {/* Title and Body */}
                                <div className="space-y-1">
                                    <h4 className="text-[13px] font-extrabold leading-tight tracking-wide">
                                        {title.trim() ? title : "Notification Title Preview"}
                                    </h4>
                                    <p className="text-[11px] leading-relaxed opacity-70">
                                        {body.trim() ? body : "Write some body text in the form to see it load and render live inside this push notification container."}
                                    </p>
                                </div>
                                {/* Dynamic Image Preview block */}
                                {imageUrl.trim() && (
                                    <div className="mt-3 overflow-hidden rounded-lg aspect-video border border-black/5">
                                        <img
                                            src={imageUrl}
                                            alt="Banner Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://placehold.co/600x400/7b1113/f8f4ec?text=Invalid+Image+URL";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Background Mockup Screen widgets */}
                            <div className="mt-6 flex-1 flex flex-col justify-end items-center z-10 opacity-30 pb-4">
                                <div className={`w-full p-3 rounded-xl mb-3 flex items-center justify-between ${
                                    isDark ? "bg-white/5" : "bg-black/5"
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                                        <div className="space-y-1">
                                            <div className={`w-20 h-2 rounded ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                                            <div className={`w-12 h-1.5 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                                </div>
                                <div className={`h-1 w-28 rounded-full ${isDark ? "bg-white/40" : "bg-black/40"}`} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Notifications;
