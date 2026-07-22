import API from "../axios";

export type NotificationPayload = {
    title: string;
    body: string;
    imageUrl?: string;
    target: "all" | "selected" | "area" | "retailer" | "inactive";
    areaId?: string;
    retailerId?: string;
    retailerIds?: string[]; // Used when targeting specific "selected" retailers
}

/**
 * Sends a custom push notification to targeted users
 */

export const sendCustomNotification = async (payload: NotificationPayload) => {
    const response = await API.post("/notification/send", payload);
    return response.data;
}