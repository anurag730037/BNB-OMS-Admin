import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from "../../api/categories/categories";

type CategoryItem = {
  _id: string;
  name: string;
  isActive: boolean;
};

const Categories: React.FC = () => {
  const { isDark } = useTheme();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err: any) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await createCategory(newCategoryName);
      if (res.success) {
        toast.success("Category created successfully!");
        setNewCategoryName("");
        fetchCategories();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const res = await updateCategory(id, editingName);
      if (res.success) {
        toast.success("Category updated successfully!");
        setEditingId(null);
        fetchCategories();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleCategoryStatus(id);
      if (res.success) {
        toast.success(res.message || "Status updated");
        setCategories((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, isActive: res.category.isActive } : c
          )
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success("Category deleted successfully!");
        fetchCategories();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header */}
      <div className={`border-b pb-4 mb-8 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Categories Management</h1>
        <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
          Define product categories for catalog organization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inline Quick Add Form Card */}
        <div className={`p-6 border rounded-none h-fit ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <h2 className="font-serif text-lg uppercase tracking-wider mb-4">Quick Add Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Namkeen"
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
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`border overflow-hidden rounded-none ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            {loading ? (
              <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                Fetching categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
                No categories found. Add your first category to begin.
              </div>
            ) : (
              <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                    <th className="p-4 font-bold">Category Name</th>
                    <th className="p-4 font-bold">Status (Click to toggle)</th>
                    <th className="p-4 font-bold text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const isEditing = editingId === cat._id;
                    return (
                      <tr key={cat._id} className={`border-b transition-colors duration-150 ${
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
                            cat.name
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            onClick={() => handleToggleStatus(cat._id)}
                            className={`px-2 py-1 text-[9px] font-bold select-none cursor-pointer transition-all duration-200 ${
                              cat.isActive
                                ? "bg-green-900/20 text-green-400 border border-green-800/40 hover:bg-green-900/40"
                                : "bg-red-900/20 text-red-400 border border-red-800/40 hover:bg-red-900/40"
                            }`}
                            title="Click to toggle status"
                          >
                            {cat.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(cat._id)}
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
                                onClick={() => handleStartEdit(cat)}
                                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                                  isDark
                                    ? "border-[#2A2A2A] bg-transparent text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                                    : "border-[#E8E2D5] bg-transparent text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(cat._id)}
                                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold border transition-all duration-200 rounded-none cursor-pointer ${
                                  isDark
                                    ? "bg-transparent border-[#2A2A2A] text-red-400 hover:border-red-600 hover:text-red-500"
                                    : "bg-transparent border-[#E8E2D5] text-red-600 hover:border-red-800 hover:text-red-800"
                                }`}
                              >
                                Delete
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

export default Categories;
