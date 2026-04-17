import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/store";

function ProtectedRoute({ adminOnly = false }) {
  const location = useLocation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);

  if (!initialized) {
    return <div className="container-shell py-24 text-center text-smoke">Loading your jewellery lounge...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
