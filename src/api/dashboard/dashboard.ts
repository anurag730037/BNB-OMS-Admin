import API from "../axios";

export const getOverviewStats = async () => {
  const response = await API.get("/dashboard/overview");
  return response.data;
};

export const getStatusRatios = async () => {
  const response = await API.get("/dashboard/status-ratios");
  return response.data;
};

export const getRecentOrders = async () => {
  const response = await API.get("/dashboard/recent-orders");
  return response.data;
};

export const getBusinessReports = async () => {
  const response = await API.get("/dashboard/reports");
  return response.data;
};

export const getTopRegions = async () => {
  const response = await API.get("/dashboard/top-regions");
  return response.data;
};

export const getOperationalInsights = async () => {
  const response = await API.get("/dashboard/insights");
  return response.data;
};

export const getTopProducts = async () => {
  const response = await API.get("/dashboard/top-products");
  return response.data;
};
