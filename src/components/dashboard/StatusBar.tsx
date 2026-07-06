import React from "react";

interface StatusBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  displayValue?: string;
  isDark: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  label,
  value,
  max = 100,
  color = "bg-brand-maroon dark:bg-brand-gold",
  displayValue,
  isDark,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-gray-500 dark:text-gray-400 capitalize truncate">
          {label}
        </span>
        <span className="font-extrabold text-brand-charcoal dark:text-brand-cream">
          {displayValue || `${value}/${max}`}
        </span>
      </div>
      <div
        className={`w-full h-2 rounded-full overflow-hidden ${
          isDark ? "bg-[#2A2A2A]" : "bg-[#E8E2D5]/40"
        }`}
      >
        <div
          style={{ width: `${percentage}%` }}
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
        />
      </div>
    </div>
  );
};
