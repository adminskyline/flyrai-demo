import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import FlyrAI from "./FlyrAI";

function AppRoutes() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("login"); // login | register | dashboard | wizard | settings

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#94a3b8" }}>
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (page === "register") return <RegisterPage onSwitch={() => setPage("login")} />;
    return <LoginPage onSwitch={() => setPage("register")} />;
  }

  // Logged in
  if (page === "wizard") return <FlyrAI onDone={() => setPage("dashboard")} />;
  if (page === "settings") return <SettingsPage onBack={() => setPage("dashboard")} />;
  return <DashboardPage onNewFlyer={() => setPage("wizard")} onSettings={() => setPage("settings")} />;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
