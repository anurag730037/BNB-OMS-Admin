import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark ? "bg-[#111111]" : "bg-[#F9F7F2]"
    }`}>
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Navbar Header */}
        <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;