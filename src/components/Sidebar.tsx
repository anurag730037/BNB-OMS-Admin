import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logoBNB.png";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: "Orders",
      path: "/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      name: "Retailers",
      path: "/retailers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: "Products",
      path: "/products",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: "Categories",
      path: "/categories",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: "Subcategories",
      path: "/subcategories",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h12m-8 6h8" />
        </svg>
      )
    },
    {
      name: "Areas",
      path: "/areas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r transition-all duration-300 lg:translate-x-0 rounded-none flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDark 
            ? "bg-[#161616] border-[#2A2A2A] text-brand-cream" 
            : "bg-[#FFFFFF] border-[#E8E2D5] text-brand-charcoal"
        }`}
      >
        <div>
          {/* Logo Brand Box */}
          <div className={`p-6 border-b flex items-center justify-between ${
            isDark ? "border-[#2A2A2A]" : "border-[#E8E2D5]"
          }`}>
            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="BNB Logo" 
                className="h-10 w-auto object-contain select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const span = document.createElement('span');
                    span.className = 'text-brand-maroon dark:text-brand-gold font-serif text-xl tracking-wider';
                    span.innerText = 'BNB';
                    parent.appendChild(span);
                  }
                }}
              />
              <div>
                <h2 className="font-serif text-sm tracking-widest font-bold uppercase leading-tight">
                  Balaji Namkeen
                </h2>
                <p className={`text-[8px] font-bold tracking-[0.2em] uppercase ${
                  isDark ? "text-brand-gold" : "text-brand-maroon"
                }`}>
                  Bhandar
                </p>
              </div>
            </Link>

            {/* Mobile close button */}
            <button 
              onClick={onClose} 
              className={`p-1 lg:hidden cursor-pointer ${
                isDark ? "text-[#777777] hover:text-brand-cream" : "text-[#8E8677] hover:text-brand-charcoal"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 text-xs tracking-wider uppercase font-bold border-l-2 transition-all duration-200 rounded-none ${
                    isActive
                      ? isDark
                        ? "bg-[#222222]/30 border-brand-gold text-brand-gold"
                        : "bg-brand-maroon/5 border-brand-maroon text-brand-maroon"
                      : isDark
                        ? "border-transparent text-brand-beige/50 hover:text-brand-cream hover:bg-[#222222]/10"
                        : "border-transparent text-[#7A7263] hover:text-brand-charcoal hover:bg-[#F9F7F2]"
                  }`}
                >
                  <span className={isActive ? "" : isDark ? "text-[#555555]" : "text-[#A29C8F]"}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t text-[10px] uppercase font-bold tracking-widest text-center ${
          isDark ? "border-[#2A2A2A] text-[#444444]" : "border-[#E8E2D5] text-[#B5AF9F]"
        }`}>
          © {new Date().getFullYear()} BNB
        </div>
      </aside>
    </>
  );
};
