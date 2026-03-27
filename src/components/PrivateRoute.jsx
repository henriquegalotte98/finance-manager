import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return user ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoute;