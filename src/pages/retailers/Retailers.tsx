import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import { getAllRetailers, toggleRetailerStatus } from "../../api/retailers/retailers";
import { getAllAreas } from "../../api/area/areas";

type AreaDetail = {
  _id: string;
  name: string;
};

type RetailerItem = {
  _id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  area: AreaDetail | null;
  isActive: boolean;
};

const Retailers: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [retailers, setRetailers] = useState<RetailerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [areasList, setAreasList] = useState<AreaDetail[]>([]);

  // Fetch areas on mount
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areaRes = await getAllAreas();
        if (areaRes.success) setAreasList(areaRes.areas);
      } catch (err) {
        console.error("Failed to load areas list", err);
      }
    };
    fetchAreas();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch;
      if (selectedArea) params.area = selectedArea;
      if (selectedStatus !== "") params.isActive = selectedStatus;

      const data = await getAllRetailers(params);
      if (data.success) {
        setRetailers(data.retailers);
      }
    } catch (err: any) {
      toast.error("Failed to load retailers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, [debouncedSearch, selectedArea, selectedStatus]);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleRetailerStatus(id);
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        // Update local state without full reload for better UX
        setRetailers((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, isActive: res.retailer.isActive } : r
          )
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header with Add Button */}
      <div className={`border-b pb-4 mb-6 flex items-center justify-between ${
        isDark ? "border-[#222222]" : "border-[#E8E2D5]"
      }`}>
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Retailer Network</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Manage registered retail partners
          </p>
        </div>
        <button
          onClick={() => navigate("/retailers/add")}
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold" 
              : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
          }`}
        >
          Add Retailer
        </button>
      </div>

      {/* Search and Filters controls */}
      <div className={`p-4 border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between ${
        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
      }`}>
        <div className="w-full md:w-1/3 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shop, owner, phone..."
            className={`w-full pl-9 pr-3 py-2 bg-transparent border text-xs uppercase tracking-wider transition-all duration-200 rounded-none focus:outline-none ${
              isDark
                ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
            }`}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto justify-end">
          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className={`px-3 py-2 bg-transparent border text-[10px] font-bold uppercase tracking-wider rounded-none focus:outline-none ${
              isDark
                ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
            }`}
          >
            <option value="">All Areas</option>
            {areasList.map((area) => (
              <option key={area._id} value={area._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                {area.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-3 py-2 bg-transparent border text-[10px] font-bold uppercase tracking-wider rounded-none focus:outline-none ${
              isDark
                ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
            }`}
          >
            <option value="">All Statuses</option>
            <option value="true" className={isDark ? "bg-[#181818]" : "bg-white"}>Active</option>
            <option value="false" className={isDark ? "bg-[#181818]" : "bg-white"}>Disabled</option>
          </select>
        </div>
      </div>

      {/* List Table container */}
      <div className={`border overflow-hidden rounded-none ${
        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
      }`}>
        {loading ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
            Fetching retailers...
          </div>
        ) : retailers.length === 0 ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
            No retailers registered yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                <th className="p-4 font-bold">Shop Name</th>
                <th className="p-4 font-bold">Owner Name</th>
                <th className="p-4 font-bold">Phone</th>
                <th className="p-4 font-bold">Area</th>
                <th className="p-4 font-bold">Status (Click to toggle)</th>
                <th className="p-4 font-bold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {retailers.map((retailer) => (
                <tr key={retailer._id} className={`border-b transition-colors duration-150 ${
                  isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"
                }`}>
                  <td className="p-4 font-semibold">{retailer.shopName}</td>
                  <td className="p-4">{retailer.ownerName}</td>
                  <td className="p-4">{retailer.phone}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full ${isDark
                        ? "bg-brand-maroon/20 text-brand-beige border-brand-maroon/30"
                        : "bg-brand-maroon/5 text-brand-maroon border-brand-maroon/15"
                      }`}>
                      {retailer.area?.name || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span 
                      onClick={() => handleToggleStatus(retailer._id)}
                      className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest select-none cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-150 border rounded-full ${
                        retailer.isActive 
                          ? isDark ? "bg-green-500/10 text-green-400 border-green-500/25 hover:bg-green-500/20" : "bg-green-50 text-green-800 border-green-200 hover:bg-green-100" 
                          : isDark ? "bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20" : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                      }`}
                      title="Click to toggle status"
                    >
                      {retailer.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6 space-x-2">
                    <button
                      onClick={() => navigate(`/retailers/edit/${retailer._id}`)}
                      className={`px-2.5 py-1 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                        isDark 
                          ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold" 
                          : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/orders?retailerId=${retailer._id}`)}
                      className={`px-2.5 py-1 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                        isDark 
                          ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold" 
                          : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                      }`}
                    >
                      Orders
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Retailers;