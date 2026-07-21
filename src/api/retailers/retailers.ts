import API from "../axios";

export type RetailerPayload = {
    shopName: string;
    ownerName: string;
    phone: string;
    password: string;
    area: string; // Will hold the Area's MongoDB ObjectId
    address: string;
}

export const registerRetailer = async (data: RetailerPayload) => {
    const response = await API.post("/retailer/register", data);
    return response.data;
};

export const getAllRetailers = async (params?: { search?: string; area?: string; isActive?: boolean }) => {
    const response = await API.get("/retailer", { params });
    return response.data;
};

export const toggleRetailerStatus = async (retailerId: string) => {
    const response = await API.patch(`/retailer/${retailerId}/toggle-status`);
    return response.data;
};

export const getSingleRetailer = async (retailerId: string) => {
    const response = await API.get(`/retailer/${retailerId}`);
    return response.data;
};

export const updateRetailer = async (retailerId: string, data: Partial<RetailerPayload>) => {
    const response = await API.put(`/retailer/${retailerId}`, data);
    return response.data;
};

export const resetRetailerPassword = async (retailerId: string, newPassword: string) => {
    const response = await API.patch(`/retailer/${retailerId}/reset-password`, { newPassword });
    return response.data;
};

