import API from "../axios"


type LoginPayload = {
    email: string,
    password: string
}

export const loginAdmin = async (data: LoginPayload) => {
    const response = await API.post("/admin/login", data);
    return response.data;
}