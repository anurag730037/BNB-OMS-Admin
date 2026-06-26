import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import { getAllRetailers, toggleRetailerStatus } from "../../api/retailers/retailers";

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

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const data = await getAllRetailers();
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
  }, []);

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
          <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Retailer Network</h1>
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
                  <td className="p-4">{retailer.area?.name || "N/A"}</td>
                  <td className="p-4">
                    <span 
                      onClick={() => handleToggleStatus(retailer._id)}
                      className={`px-2 py-1 text-[9px] font-bold select-none cursor-pointer transition-all duration-200 ${
                        retailer.isActive 
                          ? "bg-green-900/20 text-green-400 border border-green-800/40 hover:bg-green-900/40" 
                          : "bg-red-900/20 text-red-400 border border-red-800/40 hover:bg-red-900/40"
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