import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { tokenManager } from "../../utils/token";

// Protects routes by ensuring a valid authenticated user exists
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const token = tokenManager.getAccessToken();
    if (!token || tokenManager.isTokenExpired(token)) {
      if (token && tokenManager.isTokenExpired(token)) {
        tokenManager.clearAuth();
      }
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location.pathname + location.search }}
        />
      );
    }
  }

  return <Outlet />;
};
