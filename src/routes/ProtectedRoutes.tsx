import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const ProtectedRoutes = () => {
    const { token } = useAuth();

    if (!token) {
        return <Navigate to="/" replace />
    }
    return <Outlet />;
}

export default ProtectedRoutes;