import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { getSupportInfo, updateSupportInfo, type SupportInfoPayload } from "../../api/support/support";
import ConfirmationModal from "../../components/ConfirmationModal";

const Support: React.FC = () => {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<SupportInfoPayload>({
    phone: "",
    whatsapp: "",
    email: "",
    timing: "",
    address: "",
    message: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      const res = await getSupportInfo();
      if (res.success && res.support) {
        setFormData({
          phone: res.support.phone || "",
          whatsapp: res.support.whatsapp || "",
          email: res.support.email || "",
          timing: res.support.timing || "",
          address: res.support.address || "",
          message: res.support.message || "",
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load support information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setConfirmModal({
      isOpen: true,
      title: "Confirm Support Information Update",
      message: "Are you sure you want to update the contact details and help notice for all users?",
      confirmText: "Update Support Info",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          setSaving(true);
          const res = await updateSupportInfo(formData);
          if (res.success) {
            toast.success(res.message || "Support information updated successfully!");
            if (res.support) {
              setFormData({
                phone: res.support.phone || "",
                whatsapp: res.support.whatsapp || "",
                email: res.support.email || "",
                timing: res.support.timing || "",
                address: res.support.address || "",
                message: res.support.message || "",
              });
            }
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to update support information");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen flex items-center justify-center font-sans ${
        isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
      }`}>
        <div className="text-xs uppercase tracking-widest font-bold animate-pulse">
          Loading support information...
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 font-sans ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header */}
      <div className={`border-b pb-4 mb-6 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">
          Support Information
        </h1>
        <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
          Manage customer care contact numbers, WhatsApp, email, timings, and help messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className={`lg:col-span-2 p-6 border rounded-none ${
          isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
        }`}>
          <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-6 border-b pb-3 border-inherit">
            Edit Contact & Help Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  className={`w-full px-3 py-2 bg-transparent border text-xs tracking-wider transition-all duration-200 rounded-none focus:outline-none ${
                    isDark
                      ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                      : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                  }`}
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  className={`w-full px-3 py-2 bg-transparent border text-xs tracking-wider transition-all duration-200 rounded-none focus:outline-none ${
                    isDark
                      ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                      : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Support Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Support Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. support@bnbwholesale.com"
                  className={`w-full px-3 py-2 bg-transparent border text-xs tracking-wider transition-all duration-200 rounded-none focus:outline-none ${
                    isDark
                      ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                      : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                  }`}
                />
              </div>

              {/* Operating Timings */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Operating Hours / Timings
                </label>
                <input
                  type="text"
                  name="timing"
                  value={formData.timing}
                  onChange={handleChange}
                  placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM"
                  className={`w-full px-3 py-2 bg-transparent border text-xs tracking-wider transition-all duration-200 rounded-none focus:outline-none ${
                    isDark
                      ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                      : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                  }`}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider">
                HQ / Office Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. BNB Wholesale HQ, Main Market"
                className={`w-full px-3 py-2 bg-transparent border text-xs tracking-wider transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Help Message Notice */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider">
                Help / Support Notice Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. For any queries or assistance with your orders, please contact our support team."
                className={`w-full p-3 bg-transparent border text-xs transition-all duration-200 rounded-none focus:outline-none resize-y ${
                  isDark
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 font-bold tracking-[0.2em] text-[10px] uppercase border transition-all duration-300 rounded-none cursor-pointer ${
                  isDark
                    ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                    : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {saving ? "Saving Changes..." : "Save Support Information"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Card Preview Column */}
        <div className="space-y-6">
          <div className={`p-6 border rounded-none ${
            isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
          }`}>
            <h2 className="font-sans text-xs uppercase font-extrabold tracking-wider mb-4 border-b pb-2 flex items-center justify-between">
              <span>Retailer App Live Preview</span>
              <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">● Active</span>
            </h2>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-black/5 dark:bg-white/5 p-3 border border-inherit">
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block mb-1">
                  Help Message
                </span>
                <p className="italic leading-relaxed text-[11px]">
                  "{formData.message || "No custom message set."}"
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block">Phone</span>
                  <span className="font-mono font-bold text-brand-gold">{formData.phone || "N/A"}</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block">WhatsApp</span>
                  <span className="font-mono font-bold text-green-500">{formData.whatsapp || "N/A"}</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block">Email</span>
                  <span className="font-mono text-brand-beige">{formData.email || "N/A"}</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block">Operating Hours</span>
                  <span>{formData.timing || "N/A"}</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block">Address</span>
                  <span className="leading-relaxed block">{formData.address || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Support;
