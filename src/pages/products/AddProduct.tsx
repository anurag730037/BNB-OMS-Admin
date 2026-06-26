import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const AddProduct: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>(["500gm", "1kg"]);

  const handleSizeToggle = (size: string) => {
    setAvailableSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Product submitted:", { 
      name, categoryId, subCategoryId, description, price: Number(price), showPrice, availableSizes 
    });
    navigate("/products");
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header with Back Button */}
      <div className={`border-b pb-4 mb-8 flex items-center justify-between ${
        isDark ? "border-[#222222]" : "border-[#E8E2D5]"
      }`}>
        <div>
          <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Add New Product</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Configure a new catalog item
          </p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "border-[#2A2A2A] text-brand-beige hover:border-brand-cream hover:text-brand-cream" 
              : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
          }`}
        >
          Back to List
        </button>
      </div>

      {/* Form Card */}
      <div className={`max-w-2xl p-8 border transition-all duration-300 rounded-none shadow-lg ${
        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aloo Bhujia Premium"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark 
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark 
                    ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold" 
                    : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                }`}
              >
                <option value="" disabled className={isDark ? "bg-[#181818]" : "bg-white"}>Select Category</option>
                <option value="cat1" className={isDark ? "bg-[#181818]" : "bg-white"}>Namkeen</option>
                <option value="cat2" className={isDark ? "bg-[#181818]" : "bg-white"}>Sweets</option>
              </select>
            </div>

            {/* Subcategory selection */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Subcategory (Optional)</label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark 
                    ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold" 
                    : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                }`}
              >
                <option value="" className={isDark ? "bg-[#181818]" : "bg-white"}>None</option>
                <option value="subcat1" className={isDark ? "bg-[#181818]" : "bg-white"}>Spicy</option>
                <option value="subcat2" className={isDark ? "bg-[#181818]" : "bg-white"}>Sweet-Sour</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Base Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 150"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark 
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Show Price toggle */}
            <div className="flex items-center space-x-2 pt-6">
              <input
                id="show-price"
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className={`w-4 h-4 rounded-none border transition-all duration-200 cursor-pointer ${
                  isDark 
                    ? "border-[#444444] checked:bg-brand-gold checked:border-brand-gold" 
                    : "border-[#CCC5B8] checked:bg-brand-maroon checked:border-brand-maroon"
                }`}
              />
              <label htmlFor="show-price" className="text-xs uppercase font-bold tracking-wider cursor-pointer">
                Display price in catalogs
              </label>
            </div>
          </div>

          {/* Available Sizes checkboxes */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider">Available Packaging Sizes</label>
            <div className="flex gap-4">
              {["500gm", "1kg", "2kg", "5kg"].map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={availableSizes.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                    className={`w-4 h-4 rounded-none border transition-all duration-200 cursor-pointer ${
                      isDark 
                        ? "border-[#444444] checked:bg-brand-gold checked:border-brand-gold" 
                        : "border-[#CCC5B8] checked:bg-brand-maroon checked:border-brand-maroon"
                    }`}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Traditional spicy potato noodles infused with premium condiments..."
              className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none resize-none ${
                isDark 
                  ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                  : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
              }`}
            />
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className={`px-8 py-3 font-bold tracking-[0.2em] text-[11px] uppercase border transition-all duration-300 rounded-none cursor-pointer ${
                isDark 
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold" 
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
