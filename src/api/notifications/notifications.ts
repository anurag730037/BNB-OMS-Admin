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
    // Map target to targetType and "retailer" to "single"
    let targetType: string = payload.target;
    if (targetType === "retailer") {
        targetType = "single";
    }

    const backendPayload = {
        title: payload.title,
        body: payload.body,
        image: payload.imageUrl || "",
        targetType: targetType,
        retailerId: payload.retailerId,
        retailerIds: payload.retailerIds,
        areaId: payload.areaId,
        inactiveDays: payload.target === "inactive" ? 7 : undefined // Default to 7 days
    };

    const response = await API.post("/admin/notifications/send", backendPayload);
    return response.data;
}

export type HistoryFilterParams = {
  search?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  sentBy?: string;
  page?: number;
  limit?: number;
};

/**
 * Fetches the paginated history of custom sent notifications
 */
export const getNotificationHistory = async (params: HistoryFilterParams) => {
  const response = await API.get("/admin/notifications", { params });
  return response.data;
};