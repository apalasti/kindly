import { Navigate, Outlet, useLocation } from "react-router-dom";
import { tokenManager } from "../../utils/token";
import { AuthProvider } from "../../contexts/AuthContext";

// Protects routes by ensuring a valid authenticated user exists
export const ProtectedRoute = () => {
  const location = useLocation();

  const token = tokenManager.getAccessToken();
  if (!token || tokenManager.isTokenExpired(token)) {
    if (token) tokenManager.clearAuth();
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  const user = tokenManager.getUserFromToken();
  if (!user) {
    tokenManager.clearAuth();
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Provide a non-null user to the protected subtree
  return (
    <AuthProvider initialUser={user}>
      <Outlet />
    </AuthProvider>
  );
};
