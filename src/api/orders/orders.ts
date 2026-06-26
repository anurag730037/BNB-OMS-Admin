import API from "../axios";

export const getAllOrders = async (retailerId?: string) => {
    const response = await API.get("/order", {
        params: retailerId ? { retailerId } : {}
    });
    return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await API.patch(`/order/status/${orderId}`, { status });
    return response.data;
};
