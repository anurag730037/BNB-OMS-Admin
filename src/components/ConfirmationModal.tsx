import React from "react";
import { useTheme } from "../context/ThemeContext";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-md border shadow-2xl p-6 transition-all transform scale-100 ${
          isDark
            ? "bg-[#181818] border-[#2A2A2A] text-brand-cream"
            : "bg-white border-[#E8E2D5] text-brand-charcoal"
        }`}
      >
        {/* Top Decorative Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isDanger ? "bg-red-600" : "bg-brand-gold"
          }`}
        />

        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          <div
            className={`p-3 rounded-full flex-shrink-0 flex items-center justify-center ${
              isDanger
                ? isDark
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-red-50 text-red-600 border border-red-200"
                : isDark
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {isDanger ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-sans text-sm font-extrabold uppercase tracking-wider mb-2">
              {title}
            </h3>
            <div className="text-xs leading-relaxed opacity-80 mb-6 font-sans">
              {message}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-inherit">
              <button
                type="button"
                onClick={onCancel}
                className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-150 cursor-pointer ${
                  isDark
                    ? "border-[#333333] text-brand-cream hover:bg-[#222222]"
                    : "border-[#E8E2D5] text-brand-charcoal hover:bg-[#F9F7F2]"
                }`}
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-150 cursor-pointer shadow-md ${
                  isDanger
                    ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                    : isDark
                    ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                    : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
