import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


const ProtectedRoute = () => {
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


  /*
   * Admin ko student pages access
   * nahi karne dena.
   */

  if (user?.role === "Admin") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }


  /*
   * Sirf Student role allowed.
   */

  if (user?.role !== "Student") {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return <Outlet />;
};


export default ProtectedRoute;