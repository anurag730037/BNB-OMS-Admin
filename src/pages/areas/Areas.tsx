import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { getAllAreas, createArea, editArea } from "../../api/area/areas";

type AreaItem = {
  _id: string;
  name: string;
  isActive: boolean;
};

const Areas: React.FC = () => {
  const { isDark } = useTheme();
  
  // Real database states
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAreaName, setNewAreaName] = useState("");
  
  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await getAllAreas();
      if (data.success) {
        setAreas(data.areas);
      }
    } catch (err: any) {
      toast.error("Failed to load areas from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    try {
      const res = await createArea(newAreaName);
      if (res.success) {
        toast.success("Area created successfully!");
        setNewAreaName("");
        fetchAreas();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create area");
    }
  };

  const handleStartEdit = (area: AreaItem) => {
    setEditingId(area._id);
    setEditingName(area.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error("Area name cannot be empty");
      return;
    }

    try {
      const res = await editArea(id, editingName);
      if (res.success) {
        toast.success("Area updated successfully!");
        setEditingId(null);
        fetchAreas();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update area");
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header */}
      <div className={`border-b pb-4 mb-8 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Area Management</h1>
        <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
          Define and manage delivery regions and territories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inline Quick Add Form Card */}
        <div className={`p-6 border rounded-none h-fit ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <h2 className="font-serif text-lg uppercase tracking-wider mb-4">Quick Add Area</h2>
          <form onSubmit={handleAddArea} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider">Area Name</label>
              <input
                type="text"
                required
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="e.g. Noida Sector 62"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark 
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2.5 font-bold tracking-[0.2em] text-[10px] uppercase border transition-all duration-300 rounded-none cursor-pointer ${
                isDark 
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold" 
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              Add Area
            </button>
          </form>
        </div>

        {/* Areas List Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`border overflow-hidden rounded-none ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            {loading ? (
              <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                Fetching areas...
              </div>
            ) : areas.length === 0 ? (
              <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                No areas found. Add your first area to begin.
              </div>
            ) : (
              <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                    <th className="p-4 font-bold">Area Name</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => {
                    const isEditing = editingId === area._id;
                    return (
                      <tr key={area._id} className={`border-b transition-colors duration-150 ${
                        isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"
                      }`}>
                        <td className="p-4 font-semibold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className={`px-2 py-1 bg-transparent border text-xs focus:outline-none ${
                                isDark ? "border-brand-gold text-brand-cream" : "border-brand-maroon text-brand-charcoal"
                              }`}
                            />
                          ) : (
                            area.name
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[9px] font-bold ${
                            area.isActive 
                              ? "bg-green-900/20 text-green-400 border border-green-800/40" 
                              : "bg-red-900/20 text-red-400 border border-red-800/40"
                          }`}>
                            {area.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(area._id)}
                                className={`px-2.5 py-1 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                                  isDark 
                                    ? "bg-brand-gold border-brand-gold text-brand-charcoal hover:bg-transparent hover:text-brand-gold" 
                                    : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:text-brand-maroon"
                                }`}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className={`px-2.5 py-1 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                                  isDark 
                                    ? "border-[#2A2A2A] text-brand-beige hover:border-brand-cream hover:text-brand-cream" 
                                    : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-charcoal hover:text-brand-charcoal"
                                }`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(area)}
                                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                                  isDark 
                                    ? "border-[#2A2A2A] bg-transparent text-brand-beige hover:border-brand-gold hover:text-brand-gold" 
                                    : "border-[#E8E2D5] bg-transparent text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                                }`}
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Areas;
