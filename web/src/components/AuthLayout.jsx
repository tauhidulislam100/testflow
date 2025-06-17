import { Navigate, Outlet, useLocation } from "react-router";
import { useGetProfileQuery } from "../api/userApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/authSlice";

const AuthLayout = () => {
  const location = useLocation();

  const userInStore = useSelector(selectCurrentUser);

  const { isLoading, isSuccess } = useGetProfileQuery();

  if (isLoading) {
    return <p className="text-lg text-gray-700">Verifying session...</p>;
  }

  const isAuthenticated = isSuccess || !!userInStore;

  if (isAuthenticated) {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  } else {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      return <Outlet />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default AuthLayout;
