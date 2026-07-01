import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getAllCategories } from "../../api/categories/categories";
import { getAllSubcategories } from "../../api/subcategories/subcategories";
import { getProductById, updateProduct } from "../../api/products/products";
import toast from "react-hot-toast";
import axios from "axios";

const EditProduct: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");

  // Image Upload states
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // API Selection lists & Loading states
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loadingSelectors, setLoadingSelectors] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Category / Subcategory lists on mount
  useEffect(() => {
    const fetchSelectors = async () => {
      try {
        setLoadingSelectors(true);
        const [catRes, subcatRes] = await Promise.all([
          getAllCategories(),
          getAllSubcategories()
        ]);
        
        if (catRes.success) {
          setCategories(catRes.categories.filter((c: any) => c.isActive));
        }
        if (subcatRes.success) {
          setSubCategories(subcatRes.subcategories.filter((s: any) => s.isActive));
        }
      } catch (error) {
        toast.error("Failed to load categories or subcategories");
      } finally {
        setLoadingSelectors(false);
      }
    };
    fetchSelectors();
  }, []);

  // Fetch Product details on mount/id change
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        setLoadingProduct(true);
        const res = await getProductById(id);
        if (res.success && res.product) {
          const prod = res.product;
          setName(prod.name || "");
          setCategoryId(
            typeof prod.categoryId === "object" && prod.categoryId !== null 
              ? prod.categoryId._id 
              : prod.categoryId || ""
          );
          setSubCategoryId(
            typeof prod.subCategoryId === "object" && prod.subCategoryId !== null 
              ? prod.subCategoryId._id 
              : prod.subCategoryId || ""
          );
          setDescription(prod.description || "");
          setPrice(prod.price !== null ? String(prod.price) : "");
          setShowPrice(prod.showPrice || false);
          setAvailableSizes(prod.availableSizes || []);
          setImages(prod.images || []);
        } else {
          toast.error("Failed to fetch product details");
        }
      } catch (error) {
        toast.error("Error loading product");
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary config is missing");
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds the 5MB size limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );

        if (response.data.secure_url) {
          uploadedUrls.push(response.data.secure_url);
        }
      }
      setImages(uploadedUrls);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload one or more images.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Filter subcategories that belong to the currently selected category
  const filteredSubCategories = subCategories.filter((sub) => {
    if (!categoryId) return false;
    const parentId = typeof sub.categoryId === "object" && sub.categoryId !== null 
      ? sub.categoryId._id 
      : sub.categoryId;
    return parentId === categoryId;
  });

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    setSubCategoryId(""); // Reset subcategory when category changes to avoid mismatch
  };

  const handleAddSize = (size: string) => {
    const trimmed = size.trim();
    if (!trimmed) return;
    if (!availableSizes.includes(trimmed)) {
      setAvailableSizes((prev) => [...prev, trimmed]);
    }
    setSizeInput("");
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setAvailableSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !id) return;

    if (!categoryId) {
      toast.error("Please select a product category");
      return;
    }

    try {
      setSubmitting(true);
      const productPayload = {
        name,
        categoryId,
        subCategoryId: subCategoryId || null,
        description,
        price: price ? Number(price) : null,
        showPrice,
        availableSizes,
        images
      };

      const res = await updateProduct(id, productPayload);
      if (res.success) {
        toast.success(res.message || "Product updated successfully!");
        navigate("/products");
      } else {
        toast.error(res.message || "Failed to update product");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const isPageLoading = loadingSelectors || loadingProduct;

  return (
    <div className={`p-4 sm:p-8 min-h-screen transition-colors duration-300 rounded-none ${
      isDark ? "bg-[#111111] text-brand-cream" : "bg-[#F9F7F2] text-brand-charcoal"
    }`}>
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto border-b pb-4 mb-6 sm:mb-8 flex items-center justify-between border-brand-maroon/20 dark:border-[#222222]">
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wider">Edit Product</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-brand-gold" : "text-brand-maroon"}`}>
            Update catalog item configuration
          </p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className={`px-4 py-2 text-xs uppercase font-bold tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
            isDark 
              ? "border-[#2A2A2A] text-brand-beige hover:border-brand-cream hover:text-brand-cream" 
              : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon"
          }`}
        >
          Back to List
        </button>
      </div>

      {isPageLoading ? (
        <div className="max-w-7xl mx-auto p-12 text-center text-xs uppercase tracking-widest font-bold">
          Loading product configuration...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: Core Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-5 sm:p-8 border transition-all duration-300 rounded-none shadow-lg ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}>
              <h2 className="text-xs font-sans uppercase font-extrabold tracking-wider mb-6 border-b pb-2 border-brand-maroon/20 dark:border-brand-gold/20">
                Core Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aloo Bhujia Premium"
                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                      isDark 
                        ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                        : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                    }`}
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider">Category</label>
                  <select
                    required
                    disabled={submitting}
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                      isDark 
                        ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold" 
                        : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                    }`}
                  >
                    <option value="" disabled className={isDark ? "bg-[#181818]" : "bg-white"}>Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory selection */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider">Subcategory (Optional)</label>
                  <select
                    disabled={submitting || !categoryId}
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                      !categoryId 
                        ? "opacity-50 cursor-not-allowed border-[#333333]/50 text-gray-500"
                        : isDark 
                          ? "border-[#333333] text-brand-cream bg-[#181818] focus:border-brand-gold" 
                          : "border-[#D6CFC1] text-brand-charcoal bg-white focus:border-brand-maroon"
                    }`}
                  >
                    <option value="" className={isDark ? "bg-[#181818]" : "bg-white"}>None</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub._id} value={sub._id} className={isDark ? "bg-[#181818]" : "bg-white"}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider">Base Price (₹)</label>
                  <input
                    type="number"
                    disabled={submitting}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 150"
                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none ${
                      isDark 
                        ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                        : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                    }`}
                  />
                </div>

                {/* Show Price toggle */}
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    id="show-price"
                    type="checkbox"
                    disabled={submitting}
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className={`w-4 h-4 rounded-none border transition-all duration-200 cursor-pointer ${
                      isDark 
                        ? "border-[#444444] checked:bg-brand-gold checked:border-brand-gold" 
                        : "border-[#CCC5B8] checked:bg-brand-maroon checked:border-brand-maroon"
                    }`}
                  />
                  <label htmlFor="show-price" className="text-xs uppercase font-bold tracking-wider cursor-pointer select-none">
                    Display price in catalogs
                  </label>
                </div>

                {/* Packaging Sizes Tag Input */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider">Available Packaging Sizes</label>

                  {/* Display selected sizes as badges */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {availableSizes.length === 0 ? (
                      <span className="text-xs text-gray-500 italic">No packaging sizes added yet.</span>
                    ) : (
                      availableSizes.map((size) => (
                        <span
                          key={size}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border ${
                            isDark
                              ? "bg-[#222222] text-brand-gold border-brand-gold/30"
                              : "bg-[#F9F7F2] text-brand-maroon border-brand-maroon/20"
                          }`}
                        >
                          {size}
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleRemoveSize(size)}
                            className="text-xs hover:text-red-500 font-bold ml-1 transition-colors focus:outline-none cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Input field to add custom sizes */}
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      disabled={submitting}
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSize(sizeInput);
                        }
                      }}
                      placeholder="Type size (e.g. 900gm) and press Enter"
                      className={`flex-1 px-3 py-2 text-sm border focus:outline-none rounded-none ${
                        isDark
                          ? "border-[#333333] bg-[#1a1a1a] text-brand-cream focus:border-brand-gold"
                          : "border-[#D6CFC1] bg-white text-brand-charcoal focus:border-brand-maroon"
                      }`}
                    />
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleAddSize(sizeInput)}
                      className={`px-4 py-2 text-xs uppercase font-bold border rounded-none transition-all duration-200 cursor-pointer ${
                        isDark
                          ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                          : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon"
                      }`}
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick click presets for convenience */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-[10px] uppercase font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Quick Presets:
                    </span>
                    {["250gm", "500gm", "1kg", "2kg", "5kg"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={submitting || availableSizes.includes(preset)}
                        onClick={() => handleAddSize(preset)}
                        className={`px-2 py-0.5 text-[9px] font-mono border transition-all duration-150 rounded-none ${
                          availableSizes.includes(preset)
                            ? "opacity-30 cursor-not-allowed border-gray-600 text-gray-500 bg-transparent"
                            : isDark
                              ? "border-[#333333] text-gray-400 hover:border-brand-gold hover:text-brand-gold bg-transparent cursor-pointer"
                              : "border-[#E8E2D5] text-[#7A7263] hover:border-brand-maroon hover:text-brand-maroon bg-transparent cursor-pointer"
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider">Description</label>
                  <textarea
                    rows={4}
                    disabled={submitting}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Traditional spicy potato noodles infused with premium condiments..."
                    className={`w-full px-3 py-2 bg-transparent border text-sm transition-all duration-200 rounded-none focus:outline-none resize-none ${
                      isDark 
                        ? "border-[#333333] text-brand-cream placeholder-[#555555] focus:border-brand-gold" 
                        : "border-[#D6CFC1] text-brand-charcoal placeholder-[#A29C8F] focus:border-brand-maroon"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Image Upload Gallery (1/3 width) */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <div className={`p-5 sm:p-8 border transition-all duration-300 rounded-none shadow-lg ${
              isDark ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-[#E8E2D5]"
            }`}>
              <div className="flex justify-between items-center mb-6 border-b pb-2 border-brand-maroon/20 dark:border-brand-gold/20">
                <h2 className="text-xs font-sans uppercase font-extrabold tracking-wider">
                  Product Gallery
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                  images.length === 5 
                    ? "border-red-500/30 bg-red-500/10 text-red-400" 
                    : isDark ? "border-brand-gold/20 text-brand-gold bg-brand-gold/5" : "border-brand-maroon/20 text-brand-maroon bg-brand-maroon/5"
                }`}>
                  {images.length}/5 Images
                </span>
              </div>

              <p className={`text-[10px] mb-4 leading-relaxed ${isDark ? "text-brand-beige/50" : "text-[#7A7263]"}`}>
                Upload up to 5 images. The first image will be set as the main cover thumbnail.
              </p>

              {/* Upload Dropzone */}
              {images.length < 5 && (
                <label
                  className={`w-full min-h-[160px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer p-6 transition-all duration-300 relative group rounded-none mb-6 ${
                    uploading 
                      ? "opacity-50 cursor-not-allowed border-gray-600 bg-transparent" 
                      : isDark
                        ? "border-[#333333] bg-[#141414] hover:border-brand-gold hover:bg-[#1C1C1C]"
                        : "border-[#D6CFC1] bg-[#FDFCFB] hover:border-brand-maroon hover:bg-[#F6F2EB]"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={submitting || uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-brand-gold" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold animate-pulse">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <svg className={`w-10 h-10 mb-2 transition-colors duration-300 ${
                        isDark ? "text-brand-gold/60 group-hover:text-brand-gold" : "text-brand-maroon/60 group-hover:text-brand-maroon"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] uppercase font-bold tracking-widest block">Add Photos</span>
                      <span className="text-[9px] text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </label>
              )}

              {/* Previews Grid */}
              <div className="grid grid-cols-2 gap-4">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-[4/3] border overflow-hidden group transition-all duration-300 ${
                      isDark ? "border-[#222222] bg-[#181818]" : "border-[#E8E2D5] bg-white"
                    }`}
                  >
                    <img
                      src={url.toString()}
                      alt={`Product preview ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Cover image label */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-brand-gold text-brand-charcoal text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 z-10">
                        Cover
                      </span>
                    )}

                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={submitting || uploading}
                        onClick={() => handleRemoveImage(idx)}
                        className="px-2.5 py-1.5 bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM ACTIONS ROW: Centered button spanning below both sections on desktop, full width on mobile */}
          <div className="lg:col-span-3 flex justify-center pt-4 w-full">
            <button
              type="submit"
              disabled={submitting || uploading}
              className={`w-full sm:w-auto sm:px-24 py-4 font-bold tracking-[0.2em] text-[11px] uppercase border transition-all duration-300 rounded-none ${
                submitting || uploading
                  ? "opacity-50 border-gray-600 text-gray-500 cursor-not-allowed bg-transparent"
                  : isDark 
                    ? "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-gold hover:text-brand-gold cursor-pointer" 
                    : "bg-brand-maroon border-brand-maroon text-brand-cream hover:bg-transparent hover:border-brand-maroon hover:text-brand-maroon cursor-pointer"
              }`}
            >
              {submitting ? "Saving..." : "Save Product"}
            </button>
          </div>
          
        </form>
      )}
    </div>
  );
};

export default EditProduct;
