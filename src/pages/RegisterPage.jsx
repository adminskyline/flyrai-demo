import { useState } from "react";
import { useAuth } from "../AuthContext";
import { INP, BTN_P, Card } from "../components/SharedUI";

export default function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountType) { setError("Please select an account type"); return; }
    setError("");
    setLoading(true);
    try {
      await register(email, password, accountType, name);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:14 }}>{"\u2726"}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, margin:"0 0 8px", letterSpacing:"-1px", color:"#0f172a" }}>GetPosted</h1>
          <p style={{ fontSize:14, color:"#64748b", margin:0 }}>Create your account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background:"white", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
          {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:13, color:"#dc2626" }}>{error}</div>}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#334155", display:"block", marginBottom:4 }}>Full Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={INP} placeholder="Your full name" required />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#334155", display:"block", marginBottom:4 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={INP} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#334155", display:"block", marginBottom:4 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={INP} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>Account Type</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[{t:"lo",icon:"\u{1F4BC}",label:"Loan Officer",desc:"Mortgage marketing"},{t:"realtor",icon:"\u{1F3D8}\uFE0F",label:"Realtor\u00AE",desc:"Listing flyers & guides"}].map(o=>(
              <Card key={o.t} sel={accountType===o.t} onClick={()=>setAccountType(o.t)} sm>
                <div style={{ fontSize:24, marginBottom:4 }}>{o.icon}</div>
                <div style={{ fontWeight:700, fontSize:13 }}>{o.label}</div>
                <div style={{ color:"#94a3b8", fontSize:11 }}>{o.desc}</div>
              </Card>
            ))}
          </div>
          <button type="submit" disabled={loading} style={{ ...BTN_P, width:"100%", opacity:loading?.5:1 }}>{loading?"Creating account...":"Create Account"}</button>
          <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#64748b" }}>
            Already have an account?{" "}
            <span onClick={onSwitch} style={{ color:"#1e3a5f", fontWeight:700, cursor:"pointer" }}>Sign In</span>
          </div>
        </form>
      </div>
    </div>
  );
}
