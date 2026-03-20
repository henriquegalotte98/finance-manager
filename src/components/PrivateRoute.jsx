import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  return token && userId ? children : <Navigate to="/login" />;
}

export default PrivateRoute;