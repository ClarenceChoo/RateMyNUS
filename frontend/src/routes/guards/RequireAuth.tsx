import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  return <Outlet />;
}
