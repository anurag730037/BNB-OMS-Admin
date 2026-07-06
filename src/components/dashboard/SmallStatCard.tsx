import React from "react";

interface SmallStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  isDark: boolean;
  loading?: boolean;
}

export const SmallStatCard: React.FC<SmallStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  isDark,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        className={`p-4 border rounded-2xl animate-pulse flex items-center gap-4 ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}
      >
        <div className={`p-3 rounded-xl w-10 h-10 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
        <div className="space-y-2 flex-1">
          <div className={`h-2.5 w-16 rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
          <div className={`h-4.5 w-12 rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 border rounded-2xl flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow hover:border-brand-gold/40 ${
        isDark
          ? "bg-[#181818] border-[#2A2A2A] text-brand-cream"
          : "bg-white border-[#E8E2D5] text-brand-charcoal"
      }`}
    >
      {icon && (
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${
            isDark ? "bg-[#111111] text-brand-gold" : "bg-[#F9F7F2] text-brand-maroon"
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 truncate">
          {title}
        </p>
        <h4 className="text-lg font-extrabold my-0.5 tracking-tight text-[#2A2A2A] dark:text-[#E8E2D5] truncate">
          {value}
        </h4>
        {subtitle && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
