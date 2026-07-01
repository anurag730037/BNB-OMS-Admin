import API from "../axios"

export const getAllProducts = async (params?: { search?: string; categoryId?: string; subCategoryId?: string; isAvailable?: boolean }) => {
    const response = await API.get("/product/all", { params });
    return response.data;
}

export const createProduct = async (data: any) => {
    const response = await API.post("/product/create", data);
    return response.data;
}

export const getProductById = async (id: string) => {
    const response = await API.get(`/product/${id}`);
    return response.data;
}

export const updateProduct = async (id: string, data: any) => {
    const response = await API.put(`/product/update/${id}`, data);
    return response.data;
}

export const toggleProductAvailability = async (id: string) => {
    const response = await API.patch(`/product/toggle/${id}`);
    return response.data;
}