import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { getBannersList, saveBannersList } from "../../api/banners/banners";

const Banners: React.FC = () => {
  const { isDark } = useTheme();

  // State holding 5 banner slots
  const [banners, setBanners] = useState<string[]>(["", "", "", "", ""]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // File input refs to trigger programmatically
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Load existing banners on mount
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getBannersList();
      if (res.success && res.images) {
        const list = [...res.images];
        while (list.length < 5) {
          list.push("");
        }
        setBanners(list.slice(0, 5));
      }
    } catch (err) {
      toast.error("Failed to load current banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUrlChange = (index: number, val: string) => {
    const updated = [...banners];
    updated[index] = val;
    setBanners(updated);
  };

  // Upload to Cloudinary Logic
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Image exceeds 5MB limit.`);
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing in your .env file.");
      return;
    }

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      if (response.data.secure_url) {
        handleUrlChange(index, response.data.secure_url);
        toast.success(`Banner #${index + 1} uploaded successfully!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Check your upload preset setting.");
    } finally {
      setUploadingIndex(null);
      // Reset input value to allow triggering change on same file again
      if (fileInputRefs[index].current) {
        fileInputRefs[index].current!.value = "";
      }
    }
  };

  const triggerFileInput = (index: number) => {
    if (uploadingIndex !== null || saving) return;
    fileInputRefs[index].current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanedImages = banners.map(url => url.trim()).filter(url => url !== "");
      const res = await saveBannersList(cleanedImages);

      if (res.success) {
        toast.success("Banners saved successfully!");
        fetchBanners();
      } else {
        toast.error(res.message || "Failed to update banners.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Title Header */}
      <div className={`border-b pb-4 mb-8 ${isDark ? "border-[#222222]" : "border-[#E8E2D5]"}`}>
        <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">App Banners</h1>
        <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
          Configure dynamic homepage carousel banners for the retail client application
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-xs uppercase tracking-widest font-bold">
          <svg className="animate-spin h-5 w-5 mr-3 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading Banner Settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {banners.map((url, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-none shadow-sm space-y-3 flex flex-col justify-between ${
                  isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-1.5">
                  <h3 className="font-sans text-[10px] uppercase font-extrabold tracking-wider">
                    Slot #{index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {url.trim() && (
                      <button
                        type="button"
                        onClick={() => handleUrlChange(index, "")}
                        className={`text-[9px] font-bold uppercase tracking-wider transition-colors hover:text-red-500 cursor-pointer ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Clear
                      </button>
                    )}
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${
                      url.trim() ? "text-green-500" : "text-amber-500"
                    }`}>
                      {url.trim() ? "Active" : "Empty"}
                    </span>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRefs[index]}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden"
                />

                {/* Wide Aspect Ratio Interactive Upload Box */}
                <div 
                  onClick={() => triggerFileInput(index)}
                  className={`group relative w-full aspect-[2.1/1] overflow-hidden border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    isDark ? "border-[#2A2A2A] bg-[#111111]" : "border-[#E8E2D5] bg-[#FDFCF9]"
                  }`}
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-200 z-10">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                      {url.trim() ? "Change Image" : "Upload Image"}
                    </span>
                  </div>

                  {/* Image View / Empty / Upload state */}
                  {uploadingIndex === index ? (
                    <div className="absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center gap-1">
                      <svg className="animate-spin h-5 w-5 text-brand-gold" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-brand-gold animate-pulse">
                        Uploading...
                      </span>
                    </div>
                  ) : url.trim() ? (
                    <img
                      src={url}
                      alt={`Slot #${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/1024x480/7b1113/f8f4ec?text=Failed";
                      }}
                    />
                  ) : (
                    <div className="p-2 text-center space-y-1 select-none">
                      <svg className={`w-5 h-5 mx-auto opacity-40 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-[8px] font-bold uppercase tracking-wider opacity-60">Upload Image</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Save Button */}
          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={saving || uploadingIndex !== null}
              className={`px-6 py-2.5 font-bold tracking-[0.25em] text-[10px] uppercase border transition-all duration-300 rounded-none cursor-pointer flex items-center gap-2 ${
                saving || uploadingIndex !== null
                  ? "opacity-50 cursor-not-allowed border-gray-500 text-gray-500 bg-transparent"
                  : isDark
                  ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                  : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Banners</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Banners;
