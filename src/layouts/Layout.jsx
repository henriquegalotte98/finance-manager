// Layout.jsx
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "./App.css";

function Layout() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;