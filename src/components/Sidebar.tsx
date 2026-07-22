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
    },
    {
      name: "Support Info",
      path: "/support",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r transition-all duration-300 lg:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          } ${isDark
            ? "bg-[#111111] border-[#1E1E1E] text-brand-cream"
            : "bg-[#FDFCF9] border-[#E8E2D5] text-brand-charcoal"
          }`}
      >
        {/* Top section: Logo + Nav */}
        <div className="flex-1 overflow-y-auto">
          {/* Logo Brand Box */}
          <div className="px-5 pt-6 pb-5 flex items-center justify-between">
            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
              <img
                src={logo}
                alt="BNB Logo"
                className="h-11 w-11 object-contain select-none rounded-lg"
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
                <h2 className="font-sans text-[13px] tracking-wide font-extrabold uppercase leading-tight">
                  Balaji<br />Namkeen
                </h2>
                <p className={`text-[9px] font-bold tracking-[0.25em] uppercase mt-0.5 ${isDark ? "text-brand-gold" : "text-brand-maroon"
                  }`}>
                  Bhandar
                </p>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className={`p-1.5 lg:hidden cursor-pointer rounded-lg transition-colors ${isDark ? "text-gray-500 hover:text-brand-cream hover:bg-white/5" : "text-gray-400 hover:text-brand-charcoal hover:bg-black/5"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 mt-1">
            <div className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[16px] font-semibold rounded-lg transition-all duration-200 ${isActive
                      ? isDark
                        ? "bg-brand-maroon text-white"
                        : "bg-brand-maroon text-white"
                      : isDark
                        ? "text-gray-400 hover:text-brand-cream hover:bg-white/[0.04]"
                        : "text-[#6B6358] hover:text-brand-charcoal hover:bg-[#F3EFE7]"
                      }`}
                  >
                    <span className={isActive ? "" : isDark ? "text-gray-600" : "text-[#A9A093]"}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom Section: CTA Card + Footer */}
        <div className="mt-auto px-4 pb-4">
          {/* Grow your business CTA card */}


          {/* Footer */}
          <div className={`mt-3 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${isDark ? "border-[#1E1E1E] text-gray-600" : "border-[#E8E2D5] text-[#B5AF9F]"
            }`}>
            <span>© {new Date().getFullYear()} BNB</span>
            <button
              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? "hover:bg-white/5 text-gray-600 hover:text-gray-400" : "hover:bg-black/5 text-[#B5AF9F] hover:text-[#7A7263]"
                }`}
              title="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
