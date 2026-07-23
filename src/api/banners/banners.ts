import API from "../axios";

/**
 * Fetches the active list of public banners
 */
export const getBannersList = async () => {
  const response = await API.get("/banners");
  return response.data;
};

/**
 * Updates the banner list (Admin only)
 * Payload format: { images: ["url1", "url2", ...] }
 */
export const saveBannersList = async (images: string[]) => {
  const response = await API.put("/admin/banners", { images });
  return response.data;
};
