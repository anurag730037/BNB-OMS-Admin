import React from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

type NavbarProps = {
  onMenuClick: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();

  // Map location path to readable titles
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/orders":
        return "Order Registry";
      case "/retailers":
        return "Retailer Network";
      case "/retailers/add":
        return "Register Retailer";
      case "/products":
        return "Product Inventory";
      case "/products/add":
        return "Add Product";
      case "/categories":
        return "Classifications";
      case "/subcategories":
        return "Sub-Classifications";
      case "/areas":
        return "Area Management";
      default:
        return "Administrative Panel";
    }
  };

  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between transition-all duration-300 relative z-30 ${
        isDark 
          ? "bg-[#161616] border-[#2A2A2A] text-brand-cream" 
          : "bg-[#FFFFFF] border-[#E8E2D5] text-brand-charcoal"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Toggle Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-1.5 border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "border-[#2A2A2A] text-[#888888] hover:text-brand-cream hover:border-[#444444]" 
              : "border-[#E8E2D5] text-[#7A7263] hover:text-brand-charcoal hover:border-[#D6CFC1]"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Dynamic page title */}
        <h2 className="font-serif text-base uppercase tracking-[0.15em] font-light hidden sm:block">
          {getPageTitle()}
        </h2>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        {/* Light/Dark mode switcher */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "border-[#2A2A2A] text-[#888888] hover:text-brand-gold hover:border-[#444444]" 
              : "border-[#E8E2D5] text-[#7A7263] hover:text-brand-maroon hover:border-[#D6CFC1]"
          }`}
          title="Toggle Theme"
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.707.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "border-[#2A2A2A] bg-transparent text-brand-beige hover:border-brand-maroon hover:text-brand-cream hover:bg-brand-maroon" 
              : "border-[#E8E2D5] bg-transparent text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon hover:bg-brand-maroon/5"
          }`}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
