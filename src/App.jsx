import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Excel from "./components/Excel";
import Profile from "./components/Profile";
import ImportFile from "./components/ImportFile.jsx";
import Economias from "./components/Economias.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Market from "./components/Market";
import Travel from "./components/Travel";
import SideMenu from "./components/SideMenu";
import { AuthProvider } from "./components/AuthContext.jsx";
import { useAuth } from "./components/AuthContext.jsx";

import "./App.css";

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Rota de login */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/app/*"
        element={
          <PrivateRoute>
            <div className="app_container">
              <div className="side_menu_container">
                <SideMenu />
              </div>
              <div className="app">
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="importfile" element={<ImportFile />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="excel" element={<Excel />} />
                  <Route path="market" element={<Market />} />
                  <Route path="economias" element={<Economias />} />
                  <Route path="travel" element={<Travel />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        }
      />

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to={token ? "/app" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;