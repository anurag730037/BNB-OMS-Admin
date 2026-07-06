import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    label?: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  isDark: boolean;
  loading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  isDark,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        className={`p-6 border rounded-2xl animate-pulse transition-all duration-200 ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`h-2.5 w-24 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          <div className={`h-8 w-8 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>
        <div className={`h-8 w-32 rounded mb-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
        <div className={`h-2 w-48 rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-6 border rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-sm ${
        onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-md" : ""
      } ${
        isDark
          ? "bg-[#181818] border-[#2A2A2A] text-brand-cream hover:border-brand-gold/60"
          : "bg-white border-[#E8E2D5] text-brand-charcoal hover:border-brand-maroon/40"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold mt-2 tracking-tight text-[#2A2A2A] dark:text-[#E8E2D5]">
            {value}
          </h3>
        </div>
        {icon && (
          <div
            className={`p-3 rounded-xl flex-shrink-0 transition-transform duration-300 ${
              isDark ? "bg-[#111111] text-brand-gold" : "bg-[#F9F7F2] text-brand-maroon"
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-dashed border-gray-500/10 dark:border-gray-700/20 flex flex-wrap items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] ${
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-full">
              {subtitle} {trend?.label && <span className="font-normal">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
