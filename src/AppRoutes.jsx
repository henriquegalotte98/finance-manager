import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext.jsx";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Excel from "./components/Excel";
import Profile from "./components/Profile";
import ImportFile from "./components/ImportFile.jsx";
import Economias from "./components/Economias.jsx";
import Market from "./components/Market";
import Travel from "./components/Travel";
import PrivateRoute from "./components/PrivateRoute.jsx";

export default function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/app/*"
        element={
          <PrivateRoute>
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="importfile" element={<ImportFile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="excel" element={<Excel />} />
              <Route path="market" element={<Market />} />
              <Route path="economias" element={<Economias />} />
              <Route path="travel" element={<Travel />} />
            </Routes>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to={token ? "/app" : "/login"} />} />
    </Routes>
  );
}