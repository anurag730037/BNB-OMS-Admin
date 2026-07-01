import API from "../axios";

export const getAllOrders = async (filters: {
    retailerId?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    areaId?: string;
} = {}) => {
    const response = await API.get("/order", { params: filters });
    return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await API.patch(`/order/status/${orderId}`, { status });
    return response.data;
};

export const getSingleOrder = async (orderId: string) => {
    const response = await API.get(`/order/admin/${orderId}`);
    return response.data;
};

export const editOrder = async (orderId: string, items: any[], adminNote: string) => {
    const response = await API.put(`/order/edit/${orderId}`, { items, adminNote });
    return response.data;
};

