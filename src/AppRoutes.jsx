import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Excel from "./components/Excel";
import { Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PrivateLayout from "./components/PrivateLayout";
import Market from "./components/Market";
import Travel from "./components/Travel";
import Profile from "./components/Profile";
import Economy from "./components/Economias";
function AppRoutes() {
  return (
    <Routes>

      {/* ROTAS PÚBLICAS */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ROTAS PRIVADAS */}
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/app/market" element={<Market />} />
          <Route path="/app/travel" element={<Travel />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" />} />
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/excel" element={<Excel />} />
          <Route path="/app/economy" element={<Economy />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default AppRoutes;