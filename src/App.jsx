import { AuthProvider } from "./components/AuthContext.jsx";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./AppRoutes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="layout">
        <Sidebar />

        <main className="layout-content">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;