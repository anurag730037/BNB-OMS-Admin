import React from "react";

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
  className?: string;
  headerBorder?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  actions,
  children,
  isDark,
  className = "",
  headerBorder = true,
}) => {
  return (
    <div
      className={`p-6 border rounded-2xl shadow-sm transition-all duration-300 ${
        isDark
          ? "bg-[#181818] border-[#2A2A2A] text-brand-cream"
          : "bg-white border-[#E8E2D5] text-brand-charcoal"
      } ${className}`}
    >
      {(title || icon || actions) && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 ${
            headerBorder
              ? "border-b border-gray-500/10 dark:border-gray-700/20"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            {icon && (
              <span className={isDark ? "text-brand-gold" : "text-brand-maroon"}>
                {icon}
              </span>
            )}
            {title && (
              <h3 className="font-sans text-xs uppercase font-extrabold tracking-wider">
                {title}
              </h3>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
