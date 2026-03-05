import { useState, useEffect } from "react";
import api from "../api";
import { BTN_P, BTN_S, CARD } from "../components/SharedUI";

export default function AdminPage({ onBack }) {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").then(d => setStats(d)),
      api.get("/admin/users").then(d => setUsers(d.users)),
      api.get("/admin/subscriptions").then(d => setSubscriptions(d.subscriptions)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadUserDetail = async (id) => {
    try {
      const d = await api.get(`/admin/users/${id}`);
      setSelectedUser(d);
    } catch { /* silent */ }
  };

  const statCard = (label, value, color = "#1e3a5f") => (
    <div style={{ flex: 1, background: "white", borderRadius: 12, padding: "20px 18px", boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "'Playfair Display',serif" }}>{value}</div>
    </div>
  );

  const statusBadge = (status) => {
    const colors = {
      active: { bg: "#dcfce7", text: "#15803d" },
      inactive: { bg: "#f1f5f9", text: "#64748b" },
      cancelled: { bg: "#fef2f2", text: "#dc2626" },
      past_due: { bg: "#fef9c3", text: "#a16207" },
    };
    const c = colors[status] || colors.inactive;
    return (
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", padding: "3px 8px", borderRadius: 4, background: c.bg, color: c.text }}>
        {status || "inactive"}
      </span>
    );
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading admin data...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)", padding: 20, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 17 }}>{"\u2726"}</span>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.5px", fontFamily: "'Playfair Display',serif" }}>GetPosted</span>
            <span style={{ fontSize: 10, fontWeight: 700, background: "#1e3a5f", color: "white", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "1px" }}>ADMIN</span>
          </div>
          <button onClick={onBack} style={{ ...BTN_S, fontSize: 13, padding: "7px 14px" }}>{"\u2190"} Back to App</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "users", label: "Users" },
            { id: "subscriptions", label: "Subscriptions" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedUser(null); }}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: tab === t.id ? "#1e3a5f" : "#f1f5f9", color: tab === t.id ? "white" : "#334155", transition: "all .2s", fontFamily: "inherit" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && stats && (
          <div>
            <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
              {statCard("Total Users", stats.totalUsers)}
              {statCard("Active Subscriptions", stats.activeSubscriptions, "#15803d")}
              {statCard("Total Creations", stats.totalItems, "#7c3aed")}
              {statCard("New This Week", stats.recentUsers, "#2563eb")}
            </div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>Recent Users</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{u.email} | {u.account_type}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {statusBadge(u.sub_status)}
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{u.item_count} items</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && !selectedUser && (
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>All Users ({users.length})</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>User</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Type</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Subscription</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Items</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Joined</th>
                  <th style={{ padding: "8px 10px" }}></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: u.account_type === "lo" ? "#1e3a5f" : "#7c3aed" }}>{u.account_type === "lo" ? "Loan Officer" : "Realtor"}</span>
                    </td>
                    <td style={{ padding: "10px 10px" }}>{statusBadge(u.sub_status)}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{u.item_count}</td>
                    <td style={{ padding: "10px 10px", fontSize: 11, color: "#94a3b8" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <button onClick={() => loadUserDetail(u.id)} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#334155", fontFamily: "inherit" }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Detail */}
        {tab === "users" && selectedUser && (
          <div>
            <button onClick={() => setSelectedUser(null)} style={{ ...BTN_S, fontSize: 12, padding: "6px 12px", marginBottom: 14 }}>{"\u2190"} Back to Users</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>User Info</h3>
                {[
                  ["Name", selectedUser.user.name],
                  ["Email", selectedUser.user.email],
                  ["Type", selectedUser.user.account_type === "lo" ? "Loan Officer" : "Realtor"],
                  ["Company", selectedUser.user.company],
                  ["Phone", selectedUser.user.phone],
                  ["NMLS", selectedUser.user.nmls],
                  ["Joined", selectedUser.user.created_at ? new Date(selectedUser.user.created_at).toLocaleString() : "-"],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>Subscription</h3>
                <div style={{ marginBottom: 12 }}>{statusBadge(selectedUser.user.sub_status)}</div>
                {[
                  ["Plan", selectedUser.user.sub_plan || "None"],
                  ["Stripe Customer", selectedUser.user.stripe_customer_id || "-"],
                  ["Stripe Sub ID", selectedUser.user.stripe_subscription_id || "-"],
                  ["Period Start", selectedUser.user.sub_start ? new Date(selectedUser.user.sub_start).toLocaleDateString() : "-"],
                  ["Period End", selectedUser.user.sub_expires ? new Date(selectedUser.user.sub_expires).toLocaleDateString() : "-"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, wordBreak: "break-all" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {selectedUser.items?.length > 0 && (
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0", marginTop: 14 }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>Recent Creations</h3>
                {selectedUser.items.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: item.item_type === "flyer" ? "#1e3a5f" : "#7c3aed", background: item.item_type === "flyer" ? "#eff6ff" : "#f5f3ff", padding: "2px 6px", borderRadius: 3 }}>{item.item_type}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{item.label || item.asset_id}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {tab === "subscriptions" && (
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>All Subscriptions ({subscriptions.length})</h3>
            {subscriptions.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No subscriptions yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>User</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Status</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Plan</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Stripe Customer</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700, color: "#64748b" }}>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 10px" }}>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.email}</div>
                      </td>
                      <td style={{ padding: "10px 10px" }}>{statusBadge(s.status)}</td>
                      <td style={{ padding: "10px 10px", fontWeight: 600 }}>{s.plan || "-"}</td>
                      <td style={{ padding: "10px 10px", fontSize: 11, color: "#64748b", wordBreak: "break-all" }}>{s.stripe_customer_id || "-"}</td>
                      <td style={{ padding: "10px 10px", fontSize: 11, color: "#94a3b8" }}>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
