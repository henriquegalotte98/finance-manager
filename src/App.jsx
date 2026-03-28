import { AuthProvider } from "./components/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext"; // Importe o ThemeProvider
import AppRoutes from "./AppRoutes";
import "./App.css";

function App() {
  return (
    <ThemeProvider> {/* Envolva tudo com ThemeProvider */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;