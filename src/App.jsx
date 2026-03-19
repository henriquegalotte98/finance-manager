import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Excel from "./components/Excel";
import Profile from "./components/Profile";
import ImportFile from "./components/ImportFile.jsx";
import Market from "./components/Market";
import Economias from "./components/Economias.jsx";
import Travel from "./components/Travel";
import SideMenu from "./components/SideMenu"; 
import { AuthProvider } from "./components/AuthContext.jsx";

import "./App.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/app" />} />

        <Route
          path="/app/*"
          element={
            token ? (
              <div className="app_container">
                {/* MENU LATERAL */}
                <div className="side_menu_container">
                  <SideMenu />
                </div>

                {/* ÁREA PRINCIPAL */}
                <div className="app">
                  <Routes>
                    <Route path="importfile" element={<ImportFile />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="" element={<Dashboard />} />
                    <Route path="excel" element={<Excel />} />
                    <Route path="market" element={<Market />} />
                    <Route path="economias" element={<Economias />} />
                    <Route path="travel" element={<Travel />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to={token ? "/app" : "/login"} />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
      );
}

export default App;