import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Excel from "./pages/Excel";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* ROTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ROTAS PRIVADAS COM SIDEBAR */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>

        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/excel" element={<Excel />} />

      </Route>

    </Routes>
  );
}

export default AppRoutes;