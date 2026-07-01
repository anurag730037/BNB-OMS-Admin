import API from "../axios";

export const getAllAreas = async (params?: { search?: string }) => {
    const response = await API.get("/area/all", { params });
    return response.data;
};

export const createArea = async (name: string) => {
    const response = await API.post("/area/create", { name });
    return response.data;
};

export const editArea = async (id: string, name: string) => {
    const response = await API.put(`/area/edit/${id}`, { name });
    return response.data;
};
