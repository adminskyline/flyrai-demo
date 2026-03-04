import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import api from "../api";
import { INP, BTN_P, BTN_S, CARD, Card } from "../components/SharedUI";
import { STATES } from "../data/constants";

export default function SettingsPage({ onBack }) {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [pexelsKey, setPexelsKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/profile").then(d => setProfile(d.profile));
    api.get("/settings").then(d => setSettings(d));
  }, []);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    setProfile(p => ({ ...p, [field]: base64 }));
  };

  const saveProfile = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await api.put("/profile", {
        name: profile.name,
        title: profile.title,
        phone: profile.phone,
        company: profile.company,
        nmls: profile.nmls,
        company_nmls: profile.company_nmls,
        license: profile.license,
        states: profile.states,
        headshot_url: profile.headshot_url || null,
        logo_url: profile.logo_url || null,
      });
      setProfile(res.profile);
      await refreshUser();
      setMsg("Profile saved!");
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true); setMsg("");
    try {
      const body = { ai_provider: settings.ai_provider };
      if (apiKey) body.api_key = apiKey;
      if (pexelsKey) body.pexels_key = pexelsKey;
      const res = await api.put("/settings", body);
      setSettings(res);
      setApiKey("");
      setPexelsKey("");
      setMsg("Settings saved!");
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setSaving(false);
  };

  const toggleState = (s) => {
    setProfile(p => ({
      ...p,
      states: p.states.includes(s) ? p.states.filter(x=>x!==s) : [...p.states, s],
    }));
  };

  if (!profile || !settings) return <div style={{ padding:40, textAlign:"center", color:"#94a3b8" }}>Loading...</div>;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)", padding:20, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:17 }}>{"\u2726"}</span>
            <span style={{ fontWeight:900, fontSize:17, letterSpacing:"-0.5px", fontFamily:"'Playfair Display',serif" }}>FlyrAI</span>
          </div>
          <button onClick={onBack} style={{ ...BTN_S, fontSize:13, padding:"7px 14px" }}>{"\u2190"} Back</button>
        </div>

        {msg && <div style={{ background:msg.startsWith("Error")?"#fef2f2":"#dcfce7", border:`1px solid ${msg.startsWith("Error")?"#fecaca":"#86efac"}`, borderRadius:8, padding:"8px 14px", marginBottom:14, fontSize:13, color:msg.startsWith("Error")?"#dc2626":"#15803d" }}>{msg}</div>}

        {/* Profile Section */}
        <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,.07)", marginBottom:16 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, margin:"0 0 16px" }}>Profile</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <input placeholder="Full Name" value={profile.name||""} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} style={INP} />
            <input placeholder="Title / Role" value={profile.title||""} onChange={e=>setProfile(p=>({...p,title:e.target.value}))} style={INP} />
            <input placeholder="Phone" value={profile.phone||""} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} style={INP} />
            <input placeholder="Company" value={profile.company||""} onChange={e=>setProfile(p=>({...p,company:e.target.value}))} style={INP} />
            {user.account_type === "lo" && (
              <>
                <input placeholder="Individual NMLS ID" value={profile.nmls||""} onChange={e=>setProfile(p=>({...p,nmls:e.target.value}))} style={INP} />
                <input placeholder="Company NMLS ID" value={profile.company_nmls||""} onChange={e=>setProfile(p=>({...p,company_nmls:e.target.value}))} style={INP} />
              </>
            )}
            {user.account_type === "realtor" && (
              <input placeholder="State License #" value={profile.license||""} onChange={e=>setProfile(p=>({...p,license:e.target.value}))} style={INP} />
            )}
            {/* Headshot & Logo uploads */}
            <div style={{ display:"flex", gap:16, marginTop:4 }}>
              {/* Headshot */}
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>Headshot</div>
                <div style={{ width:80, height:80, borderRadius:"50%", overflow:"hidden", margin:"0 auto 8px", background:"#f1f5f9", border:"2px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>
                  {profile.headshot_url ? <img src={profile.headshot_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "\u{1F464}"}
                </div>
                <label style={{ display:"inline-block", padding:"5px 12px", borderRadius:6, border:"1.5px solid #93c5fd", background:"#f8faff", cursor:"pointer", fontSize:11, fontWeight:600, color:"#1e3a5f" }}>
                  Upload
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImageUpload("headshot_url",e.target.files?.[0])}/>
                </label>
                {profile.headshot_url && <button onClick={()=>setProfile(p=>({...p,headshot_url:null}))} style={{display:"block",margin:"4px auto 0",background:"none",border:"none",color:"#dc2626",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>}
              </div>
              {/* Logo */}
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>Company Logo</div>
                <div style={{ width:80, height:80, borderRadius:10, overflow:"hidden", margin:"0 auto 8px", background:"#f1f5f9", border:"2px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>
                  {profile.logo_url ? <img src={profile.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/> : "\u{1F3E2}"}
                </div>
                <label style={{ display:"inline-block", padding:"5px 12px", borderRadius:6, border:"1.5px solid #93c5fd", background:"#f8faff", cursor:"pointer", fontSize:11, fontWeight:600, color:"#1e3a5f" }}>
                  Upload
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImageUpload("logo_url",e.target.files?.[0])}/>
                </label>
                {profile.logo_url && <button onClick={()=>setProfile(p=>({...p,logo_url:null}))} style={{display:"block",margin:"4px auto 0",background:"none",border:"none",color:"#dc2626",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>}
              </div>
            </div>

            <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginTop:4 }}>Licensed States</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, maxHeight:120, overflowY:"auto" }}>
              {STATES.map(s=>(
                <div key={s} onClick={()=>toggleState(s)}
                  style={{ padding:"4px 9px", borderRadius:4, fontSize:11, fontWeight:700, cursor:"pointer", background:profile.states?.includes(s)?"#1e3a5f":"#f1f5f9", color:profile.states?.includes(s)?"white":"#334155" }}>
                  {s}
                </div>
              ))}
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ ...BTN_P, marginTop:8, opacity:saving?.5:1 }}>Save Profile</button>
          </div>
        </div>

        {/* AI Settings */}
        <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, margin:"0 0 16px" }}>AI Settings</h2>
          <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>Provider</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
            {[{v:"anthropic",l:"Anthropic (Claude)"},{v:"openai",l:"OpenAI (GPT)"}].map(o=>(
              <Card key={o.v} sel={settings.ai_provider===o.v} onClick={()=>setSettings(s=>({...s,ai_provider:o.v}))} sm>
                <div style={{ fontWeight:600, fontSize:13 }}>{o.l}</div>
              </Card>
            ))}
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:4 }}>API Key</div>
          <div style={{ fontSize:12, color:"#64748b", marginBottom:8 }}>
            {settings.hasApiKey ? "Key is saved (encrypted). Enter a new one to replace it." : "No API key set. Generations will use mock data."}
          </div>
          <input type="password" placeholder={settings.hasApiKey ? "Enter new key to replace..." : "sk-... or sk-ant-..."} value={apiKey} onChange={e=>setApiKey(e.target.value)} style={INP} />
          <button onClick={saveSettings} disabled={saving} style={{ ...BTN_P, marginTop:12, opacity:saving?.5:1 }}>Save AI Settings</button>
        </div>

        {/* Pexels Stock Photos */}
        <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,.07)", marginTop:16 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, margin:"0 0 8px" }}>Pexels Stock Photos</h2>
          <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6, marginBottom:12 }}>
            Add a Pexels API key to get professional stock photos in your playbooks. Free at{" "}
            <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" style={{ color:"#1e3a5f", fontWeight:600 }}>pexels.com/api</a>
          </div>
          <div style={{ fontSize:12, color:"#64748b", marginBottom:8 }}>
            {settings.hasPexelsKey ? "Pexels key is saved (encrypted). Enter a new one to replace it." : "No Pexels key set. Playbooks will use default layouts without stock photos."}
          </div>
          <input type="password" placeholder={settings.hasPexelsKey ? "Enter new key to replace..." : "Pexels API key..."} value={pexelsKey} onChange={e=>setPexelsKey(e.target.value)} style={INP} />
          <button onClick={saveSettings} disabled={saving} style={{ ...BTN_P, marginTop:12, opacity:saving?.5:1 }}>Save Pexels Key</button>
        </div>
      </div>
    </div>
  );
}
