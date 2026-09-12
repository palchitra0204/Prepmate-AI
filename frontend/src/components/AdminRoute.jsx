import {
    Navigate,
    Outlet,
} from "react-router-dom";

const AdminRoute = () => {
    const token =
        localStorage.getItem("token");

    let user = null;

    try {
        const storedUser =
            localStorage.getItem("user");

        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch (error) {
        console.error(
            "Unable to read user:",
            error
        );

        localStorage.removeItem("user");
    }

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        !user ||
        user.role !== "Admin"
    ) {
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