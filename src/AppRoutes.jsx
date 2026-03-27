import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Excel from "./components/Excel";

import PrivateRoute from "./components/PrivateRoute";
import PrivateLayout from "./components/PrivateLayout";

function AppRoutes() {
  return (
    <Routes>

      {/* ROTAS PÚBLICAS */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ROTAS PRIVADAS */}
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>

          <Route path="/app" element={<Navigate to="/app/dashboard" />} />
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/excel" element={<Excel />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default AppRoutes;