import { useLocation, Navigate, Outlet } from "react-router";
import { useGetProfileQuery } from "../api/userApiSlice";

const RequireAuth = () => {
  const location = useLocation();
  const {
    data: user,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetProfileQuery();

  if (isLoading) {
    return <p className="text-lg text-gray-700">Verifying your session...</p>;
  }

  if (isSuccess && user) {
    return <Outlet />;
  }

  if (isError) {
    console.error("Authentication check failed:", error);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;
