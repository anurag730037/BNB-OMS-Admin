import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getAllAreas } from "../../api/area/areas";
import { getSingleRetailer, updateRetailer, resetRetailerPassword } from "../../api/retailers/retailers";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";

const EditRetailer: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");

  const [areasList, setAreasList] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Password reset modal & confirmation state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch areas
        const areasRes = await getAllAreas();
        if (areasRes.success) {
          setAreasList(areasRes.areas);
        }

        // Fetch retailer details
        if (id) {
          const retailerRes = await getSingleRetailer(id);
          if (retailerRes.success) {
            const r = retailerRes.retailer;
            setShopName(r.shopName || "");
            setOwnerName(r.ownerName || "");
            setPhone(r.phone || "");
            setArea(r.area?._id || r.area || "");
            setAddress(r.address || "");
          }
        }
      } catch (err: any) {
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const res = await updateRetailer(id, {
        shopName,
        ownerName,
        phone,
        area,
        address,
      });
      if (res.success) {
        toast.success("Retailer updated successfully!");
        navigate("/retailers");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleOpenPasswordModal = () => {
    setNewPasswordInput("");
    setPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    setIsPasswordModalOpen(false);

    setConfirmModal({
      isOpen: true,
      title: "⚠️ Warning: Force Password Reset",
      message: (
        <span>
          Are you sure you want to reset password for{" "}
          <strong className="text-brand-gold font-bold">{shopName || "this retailer"}</strong>?
          <span className="block mt-2 font-bold text-red-500">
            ⚠️ IMPORTANT WARNING: Resetting password will immediately force logout the retailer from their mobile app.
          </span>
          They will need to log back in using this newly set password.
        </span>
      ),
      confirmText: "Reset & Logout Retailer",
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        if (!id) return;
        try {
          setIsSubmittingPassword(true);
          const res = await resetRetailerPassword(id, newPasswordInput);
          if (res.success) {
            toast.success(res.message || "Password reset successfully! Retailer has been logged out.");
          } else {
            toast.error(res.message || "Failed to reset password");
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
          setIsSubmittingPassword(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
      }`}>
        <p className="text-xs uppercase tracking-widest font-bold">Loading retailer details...</p>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header with Back Button */}
      <div className={`border-b pb-4 mb-8 flex items-center justify-between ${
        isDark ? "border-[#222222]" : "border-[#E8E2D5]"
      }`}>
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Edit Retailer</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Update retailer network partner details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenPasswordModal}
            className="px-3 py-1.5 text-[10px] uppercase font-extrabold tracking-wider border border-orange-500/40 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-200 cursor-pointer rounded-none"
            title="Force reset retailer password (will logout retailer)"
          >
            🔑 Reset Password
          </button>
          <button
            onClick={() => navigate("/retailers")}
            className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
              isDark
                ? "border-[#2A2A2A] text-brand-beige hover:border-brand-cream hover:text-brand-cream"
                : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
            }`}
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className={`max-w-2xl p-8 border transition-all duration-300 rounded-none shadow-lg ${
        isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Shop Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Metro Grocery"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. John Doe"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                }`}
              />
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider">Area / Region</label>
              <select
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                  isDark
                    ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold"
                    : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                }`}
              >
                <option value="" disabled>Select Area</option>
                {areasList.map((a) => (
                  <option key={a._id} value={a._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Address */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider">Full Address</label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 456 Market Lane, Sector 4, Indirapuram"
              className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none resize-none ${
                isDark
                  ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold"
                  : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
              }`}
            />
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className={`px-8 py-3 font-bold tracking-[0.2em] text-[11px] uppercase border transition-all duration-300 rounded-none cursor-pointer ${
                isDark
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Reset Password Input Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsPasswordModalOpen(false)}
          />
          <div className={`relative w-full max-w-md border shadow-2xl p-6 z-10 ${
            isDark ? "bg-[#181818] border-[#2A2A2A] text-brand-cream" : "bg-white border-[#E8E2D5] text-brand-charcoal"
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
            <h3 className="font-sans text-sm font-extrabold uppercase tracking-wider mb-2">
              🔑 Reset Retailer Password
            </h3>
            <p className="text-xs opacity-70 mb-4 font-sans leading-relaxed">
              Enter a new password for <strong className="text-brand-gold">{shopName}</strong> ({ownerName}).
            </p>

            <form onSubmit={handlePasswordModalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
                  New Assigned Password
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => {
                    setNewPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Minimum 6 characters..."
                  className={`w-full px-3 py-2 bg-transparent border text-xs font-mono transition-all duration-200 rounded-none focus:outline-none ${
                    isDark
                      ? "border-[#333333] text-brand-cream focus:border-brand-gold"
                      : "border-[#D6CFC1] text-brand-charcoal focus:border-brand-maroon"
                  }`}
                />
                {passwordError && (
                  <p className="text-[10px] font-semibold text-red-500 mt-1">{passwordError}</p>
                )}
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-[10px] opacity-90 leading-relaxed font-sans">
                ⚠️ <strong>Note:</strong> Resetting password is a rare administrative operation. The retailer will be immediately logged out of their mobile app.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-150 cursor-pointer ${
                    isDark
                      ? "border-[#333333] text-brand-cream hover:bg-[#222222]"
                      : "border-[#E8E2D5] text-brand-charcoal hover:bg-[#F9F7F2]"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-4 py-2 text-xs uppercase font-bold tracking-widest border border-orange-600 bg-orange-600 text-white hover:bg-orange-700 transition-all duration-150 cursor-pointer"
                >
                  Proceed ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default EditRetailer;
