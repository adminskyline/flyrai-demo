import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import GetPosted from "./GetPosted";

function AppRoutes() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("login");

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

  // Logged in routes
  if (page === "admin" && user.is_admin) return <AdminPage onBack={() => setPage("dashboard")} />;
  if (page === "wizard") return <GetPosted onDone={() => setPage("dashboard")} />;
  if (page === "settings") return <SettingsPage onBack={() => setPage("dashboard")} />;

  return (
    <DashboardPage
      onNewFlyer={() => setPage("wizard")}
      onSettings={() => setPage("settings")}
      onAdmin={user.is_admin ? () => setPage("admin") : null}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
