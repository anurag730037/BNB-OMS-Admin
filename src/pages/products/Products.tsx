import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getAllProducts, toggleProductAvailability } from "../../api/products/products";
import { getAllCategories } from "../../api/categories/categories";
import { getAllSubcategories } from "../../api/subcategories/subcategories";
import toast from "react-hot-toast";

type categoryDetails = {
  _id: string;
  name: string
}

type productItem = {
  _id: string;
  name: string;
  categoryId: categoryDetails | null;
  subCategoryId: categoryDetails | null;
  price: number | null;
  showPrice: boolean;
  availableSizes: string[];
  isAvailable: boolean;
  images?: string[];
}

const Products: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [products, setProducts] = useState<productItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");

  const [categoriesList, setCategoriesList] = useState<categoryDetails[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);

  // Fetch filters list on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const catRes = await getAllCategories();
        if (catRes.success) setCategoriesList(catRes.categories);

        const subRes = await getAllSubcategories();
        if (subRes.success) setSubcategoriesList(subRes.subcategories);
      } catch (err) {
        console.error("Failed to load filter dropdown lists", err);
      }
    };
    fetchFilters();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedSubCategory) params.subCategoryId = selectedSubCategory;
      if (selectedAvailability !== "") params.isAvailable = selectedAvailability;

      const data = await getAllProducts(params);
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory, selectedSubCategory, selectedAvailability]);

  const handleToggleAvailability = async (id: string) => {
    try {
      const res = await toggleProductAvailability(id);
      if (res.success) {
        toast.success(res.message);
        fetchProducts();
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Failed to toggle product availability")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
      }`}>
      {/* Header with Add Button */}
      <div className={`border-b pb-4 mb-6 flex items-center justify-between ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"
        }`}>
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Product Inventory</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Manage available catalog items
          </p>
        </div>
        <button
          onClick={() => navigate("/products/add")}
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${isDark
            ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
            : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
            }`}
        >
          Add Product
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
            placeholder="Search products by name..."
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
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubCategory(""); // Reset subcategory when category changes
            }}
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

          {/* Subcategory Filter */}
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className={`px-3 py-2 bg-transparent border text-[10px] font-bold uppercase tracking-wider rounded-none focus:outline-none ${
              isDark
                ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
            }`}
          >
            <option value="">All Subcategories</option>
            {(selectedCategory
              ? subcategoriesList.filter((s) => s.categoryId?._id === selectedCategory)
              : subcategoriesList
            ).map((sub) => (
              <option key={sub._id} value={sub._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className={`px-3 py-2 bg-transparent border text-[10px] font-bold uppercase tracking-wider rounded-none focus:outline-none ${
              isDark
                ? "border-[#333333] text-[#E8DCC4] bg-[#181818] focus:border-brand-gold"
                : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
            }`}
          >
            <option value="">All Stock Status</option>
            <option value="true" className={isDark ? "bg-[#181818]" : "bg-white"}>Available</option>
            <option value="false" className={isDark ? "bg-[#181818]" : "bg-white"}>Out of stock</option>
          </select>
        </div>
      </div>

      {/* List Table container */}
      <div className={`border overflow-hidden rounded-none ${isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
        {loading ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
            Fetching product inventory...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest font-bold">
            No products found. Add your first product to begin.
          </div>
        ) : (
          <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
                <th className="p-4 font-bold w-20">Image</th>
                <th className="p-4 font-bold">Product Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Packaging Sizes</th>
                <th className="p-4 font-bold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className={`border-b transition-colors duration-150 ${isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"
                  }`}>
                  <td className="p-4">
                    <div className={`w-12 h-12 border overflow-hidden flex items-center justify-center ${isDark ? "border-[#2A2A2A] bg-[#222222]" : "border-[#E8E2D5] bg-white"
                      }`}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-gray-500 font-bold">No Image</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full ${isDark
                          ? "bg-brand-maroon/20 text-brand-beige border-brand-maroon/30"
                          : "bg-brand-maroon/5 text-brand-maroon border-brand-maroon/15"
                        }`}>
                        {product.categoryId?.name || "N/A"}
                      </span>
                      {product.subCategoryId && (
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full ${isDark
                            ? "bg-[#222222] text-[#E8DCC4] border-[#333333]"
                            : "bg-[#ECE8DF] text-brand-charcoal border-[#E2DCCE]"
                          }`}>
                          {product.subCategoryId.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-semibold font-mono">
                    {product.showPrice && product.price !== null ? `₹${product.price}` : "Hidden"}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {product.availableSizes.map((size) => (
                        <span key={size} className={`px-2.5 py-0.5 text-[9px] font-semibold border rounded-full ${isDark
                            ? "bg-[#222222] text-[#E8DCC4] border-[#333333]"
                            : "bg-[#ECE8DF] text-brand-charcoal border-[#E8E2D5]"
                          }`}>
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-4">
                      {/* Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${product.isAvailable ? "text-green-500" : "text-red-500"}`}>
                          {product.isAvailable ? "Available" : "Out of Stock"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={product.isAvailable}
                            onChange={() => handleToggleAvailability(product._id)}
                            className="sr-only peer"
                          />
                          <div className={`w-9 h-5 rounded-full relative transition-all duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 ${isDark
                              ? "bg-[#2A2A2A] peer-checked:bg-green-800/80 border border-[#3A3A3A] peer-checked:border-green-700"
                              : "bg-gray-200 peer-checked:bg-green-600 border border-gray-300 peer-checked:border-green-500"
                            }`} />
                        </label>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/products/edit/${product._id}`)}
                        className={`px-2.5 py-1 text-[9px] font-bold border transition-all duration-200 rounded-none cursor-pointer ${isDark
                            ? "border-[#2A2A2A] text-brand-beige hover:border-brand-gold hover:text-brand-gold"
                            : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
                          }`}
                      >
                        Edit
                      </button>
                    </div>
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

export default Products;
