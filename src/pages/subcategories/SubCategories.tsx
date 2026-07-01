import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { getAllCategories } from "../../api/categories/categories";
import {
  getAllSubcategories,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus
} from "../../api/subcategories/subcategories";

type CategoryDetail = {
  _id: string;
  name: string;
};

type SubcategoryItem = {
  _id: string;
  name: string;
  categoryId: CategoryDetail | null;
  isActive: boolean;
};

const SubCategories: React.FC = () => {
  const { isDark } = useTheme();

  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Quick add state
  const [newName, setNewName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");

  // Fetch initial filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const catRes = await getAllCategories();
        if (catRes.success) {
          setCategoriesList(catRes.categories);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchFilters();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch;
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (selectedStatus !== "") params.isActive = selectedStatus;

      const subRes = await getAllSubcategories(params);
      if (subRes.success) {
        setSubcategories(subRes.subcategories);
      }
    } catch (err: any) {
      toast.error("Failed to load subcategory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, filterCategoryId, selectedStatus]);

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !selectedCategoryId) {
      toast.error("Name and Parent Category are required");
      return;
    }

    try {
      const res = await createSubcategory(newName, selectedCategoryId);
      if (res.success) {
        toast.success("Subcategory created successfully!");
        setNewName("");
        setSelectedCategoryId("");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create subcategory");
    }
  };

  const handleStartEdit = (sub: SubcategoryItem) => {
    setEditingId(sub._id);
    setEditingName(sub.name);
    setEditingCategoryId(sub.categoryId?._id || "");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim() || !editingCategoryId) {
      toast.error("Name and Parent Category cannot be empty");
      return;
    }

    try {
      const res = await updateSubcategory(id, editingName, editingCategoryId);
      if (res.success) {
        toast.success("Subcategory updated successfully!");
        setEditingId(null);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subcategory");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleSubcategoryStatus(id);
      if (res.success) {
        toast.success(res.message || "Status updated");
        setSubcategories((prev) =>
          prev.map((s) =>
            s._id === id ? { ...s, isActive: res.subcategory.isActive } : s
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
      {/* Header */}
      <div className={`border-b pb-4 mb-6 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Subcategories Management</h1>
        <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
          Define detailed sub-classifications for products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Add Subcategory Form */}
        <div className={`p-6 border rounded-none h-fit ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-4">Quick Add Subcategory</h2>
          <form onSubmit={handleAddSubcategory} className="space-y-4">
            {/* Subcategory Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider">Subcategory Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Potato Chips"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Parent Category Select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider">Parent Category</label>
              <select
                required
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                }`}
              >
                <option value="" disabled>Select Category</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 font-bold tracking-[0.2em] text-[10px] uppercase border transition-all duration-300 rounded-none cursor-pointer ${
                isDark
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              Add Subcategory
            </button>
          </form>
        </div>

        {/* Subcategories List Container */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className={`p-4 border flex flex-col sm:flex-row gap-4 items-center justify-between ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            <div className="w-full sm:w-1/2 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subcategories..."
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

            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end">
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className={`px-3 py-2 bg-transparent border text-[10px] font-bold uppercase tracking-wider rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                }`}
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                    {cat.name}
                  </option>
                ))}
              </select>

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

          <div className={`border overflow-hidden rounded-none ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            {loading ? (
              <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                Fetching subcategories...
              </div>
            ) : subcategories.length === 0 ? (
              <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                No subcategories found. Add your first subcategory to begin.
              </div>
            ) : (
              <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                    <th className="p-4 font-bold">Subcategory</th>
                    <th className="p-4 font-bold">Parent Category</th>
                    <th className="p-4 font-bold">Status (Click to toggle)</th>
                    <th className="p-4 font-bold text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map((sub) => {
                    const isEditing = editingId === sub._id;
                    return (
                      <tr key={sub._id} className={`border-b transition-colors duration-150 ${
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
                            sub.name
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <select
                              value={editingCategoryId}
                              onChange={(e) => setEditingCategoryId(e.target.value)}
                              className={`px-2 py-1 bg-transparent border text-xs focus:outline-none ${
                                isDark ? "border-brand-gold text-brand-cream bg-[#181818]" : "border-brand-maroon text-brand-charcoal bg-white"
                              }`}
                            >
                              {categoriesList.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            sub.categoryId?.name || "N/A"
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            onClick={() => handleToggleStatus(sub._id)}
                            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest select-none cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-150 border rounded-full ${
                              sub.isActive
                                ? isDark ? "bg-green-500/10 text-green-400 border-green-500/25 hover:bg-green-500/20" : "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                                : isDark ? "bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20" : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                            }`}
                            title="Click to toggle status"
                          >
                            {sub.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(sub._id)}
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
                                onClick={() => handleStartEdit(sub)}
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

export default SubCategories;
