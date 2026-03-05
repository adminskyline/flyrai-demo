import { useState } from "react";
import { useAuth } from "../AuthContext";
import api from "../api";
import { BTN_P, BTN_S } from "../components/SharedUI";

export default function SubscriptionPage({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sub = user?.subscription;
  const isActive = sub?.status === "active";

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/subscription/create-checkout");
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not create checkout session");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const data = await api.post("/subscription/portal");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>{"\u2726"}</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, margin: "0 0 8px", letterSpacing: "-1px", color: "#0f172a" }}>GetPosted Pro</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Unlimited AI-powered marketing content</p>
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>
          {isActive ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{"\u2705"}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "#15803d" }}>You're Subscribed!</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                  Plan: <strong>{sub.plan || "Pro"}</strong>
                  {sub.expires && <> | Renews: <strong>{new Date(sub.expires).toLocaleDateString()}</strong></>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onBack} style={{ ...BTN_P, flex: 1 }}>Go to Dashboard</button>
                <button onClick={handleManage} disabled={loading} style={{ ...BTN_S, flex: 1, opacity: loading ? .5 : 1 }}>Manage Subscription</button>
              </div>
            </>
          ) : (
            <>
              {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 13, color: "#dc2626" }}>{error}</div>}

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, color: "#0f172a" }}>
                  $29<span style={{ fontSize: 16, fontWeight: 400, color: "#64748b" }}>/mo</span>
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Unlimited access to everything</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  "Unlimited flyer & playbook generation",
                  "AI-powered copy with Claude & GPT",
                  "All social media formats + print",
                  "Professional PDF playbooks with stock photos",
                  "Co-branding with partners",
                  "Multi-state compliance engine",
                  "Pexels stock photo integration",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#22c55e", fontSize: 14, flexShrink: 0 }}>{"\u2713"}</span>
                    <span style={{ fontSize: 13, color: "#334155" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleSubscribe} disabled={loading} style={{ ...BTN_P, width: "100%", fontSize: 16, padding: "14px 20px", opacity: loading ? .5 : 1 }}>
                {loading ? "Redirecting to checkout..." : "Subscribe Now"}
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Back to dashboard</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
