import { useState } from "react";
import { useAuth } from "../AuthContext";
import { INP, BTN_P, BTN_S } from "../components/SharedUI";

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:14 }}>{"\u2726"}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, margin:"0 0 8px", letterSpacing:"-1px", color:"#0f172a" }}>FlyrAI</h1>
          <p style={{ fontSize:14, color:"#64748b", margin:0 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background:"white", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
          {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:13, color:"#dc2626" }}>{error}</div>}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#334155", display:"block", marginBottom:4 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={INP} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#334155", display:"block", marginBottom:4 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={INP} placeholder="Your password" required />
          </div>
          <button type="submit" disabled={loading} style={{ ...BTN_P, width:"100%", opacity:loading?.5:1 }}>{loading?"Signing in...":"Sign In"}</button>
          <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#64748b" }}>
            Don't have an account?{" "}
            <span onClick={onSwitch} style={{ color:"#1e3a5f", fontWeight:700, cursor:"pointer" }}>Register</span>
          </div>
        </form>
      </div>
    </div>
  );
}
