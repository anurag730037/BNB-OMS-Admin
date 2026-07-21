import API from "../axios";

export type SupportInfoPayload = {
    phone: string;
    whatsapp: string;
    email: string;
    timing: string;
    address: string;
    message: string;
};

export const getSupportInfo = async () => {
    const response = await API.get("/support");
    return response.data;
};

export const updateSupportInfo = async (data: SupportInfoPayload) => {
    const response = await API.put("/support", data);
    return response.data;
};
