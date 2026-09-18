import {
    Navigate,
    Outlet,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";


const AdminRoute = () => {
    const {
        user,
        isAuthenticated,
        isInitializing,
    } = useAuth();


    if (isInitializing) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    background:
                        "#08070d",
                    fontFamily:
                        "Inter, sans-serif",
                }}
            >
                Checking your session...
            </div>
        );
    }


    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    if (user?.role !== "Admin") {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    return <Outlet />;
};


export default AdminRoute;