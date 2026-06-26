import API from "../axios";

export const getAllCategories = async () => {
    const response = await API.get("/category/all");
    return response.data;
};

export const createCategory = async (name: string) => {
    const response = await API.post("/category/create", { name });
    return response.data;
};

export const updateCategory = async (categoryId: string, name: string) => {
    const response = await API.put(`/category/update/${categoryId}`, { name });
    return response.data;
};

export const deleteCategory = async (categoryId: string) => {
    const response = await API.delete(`/category/delete/${categoryId}`);
    return response.data;
};

export const toggleCategoryStatus = async (categoryId: string) => {
    const response = await API.patch(`/category/toggle/${categoryId}`);
    return response.data;
};
