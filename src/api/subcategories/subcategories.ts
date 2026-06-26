import API from "../axios";

export const getAllSubcategories = async () => {
    const response = await API.get("/subcategory/all");
    return response.data;
};

export const createSubcategory = async (name: string, categoryId: string) => {
    const response = await API.post("/subcategory/create", { name, categoryId });
    return response.data;
};

export const updateSubcategory = async (subcategoryId: string, name: string, categoryId: string) => {
    const response = await API.put(`/subcategory/update/${subcategoryId}`, { name, categoryId });
    return response.data;
};

export const toggleSubcategoryStatus = async (subcategoryId: string) => {
    const response = await API.patch(`/subcategory/toggle/${subcategoryId}`);
    return response.data;
};
