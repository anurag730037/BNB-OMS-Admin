import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Products: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Mock list items for visual demonstration
  const mockProducts = [
    { id: "1", name: "Aloo Bhujia Premium", category: "Namkeen", price: "₹150", sizes: "500gm, 1kg", status: "Available" },
    { id: "2", name: "Kaju Katli Special", category: "Sweets", price: "₹800", sizes: "1kg", status: "Out of Stock" },
  ];

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header with Add Button */}
      <div className={`border-b pb-4 mb-6 flex items-center justify-between ${
        isDark ? "border-[#222222]" : "border-[#E8E2D5]"
      }`}>
        <div>
          <h1 className="font-serif text-3xl uppercase tracking-[0.1em] font-light">Product Inventory</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Manage available catalog items
          </p>
        </div>
        <button
          onClick={() => navigate("/products/add")}
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold" 
              : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
          }`}
        >
          Add Product
        </button>
      </div>

      {/* List Table container */}
      <div className={`border overflow-hidden rounded-none ${
        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
      }`}>
        <table className="w-full text-left text-xs uppercase tracking-wider font-sans border-collapse">
          <thead>
            <tr className={`border-b ${isDark ? "border-[#2A2A2A] bg-[#222222]/30" : "border-[#E8E2D5] bg-[#F9F7F2]/50"}`}>
              <th className="p-4 font-bold">Product Name</th>
              <th className="p-4 font-bold">Category</th>
              <th className="p-4 font-bold">Price</th>
              <th className="p-4 font-bold">Packaging Sizes</th>
              <th className="p-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product) => (
              <tr key={product.id} className={`border-b transition-colors duration-150 ${
                isDark ? "border-[#222222] hover:bg-[#222222]/10" : "border-[#F2ECE0] hover:bg-[#F9F7F2]/30"
              }`}>
                <td className="p-4 font-semibold">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{product.price}</td>
                <td className="p-4">{product.sizes}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[9px] font-bold ${
                    product.status === "Available" 
                      ? "bg-green-900/20 text-green-400 border border-green-800/40" 
                      : "bg-red-900/20 text-red-400 border border-red-800/40"
                  }`}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
