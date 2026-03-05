import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import api from "../api";
import { BTN_P, BTN_S } from "../components/SharedUI";
import { ASSET_TYPES } from "../data/constants";

export default function DashboardPage({ onNewFlyer, onSettings, onAdmin }) {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/flyers").then(d => { setItems(d.items); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const deleteItem = async (id) => {
    try {
      await api.del(`/flyers/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)", padding:20, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:17 }}>{"\u2726"}</span>
            <span style={{ fontWeight:900, fontSize:17, letterSpacing:"-0.5px", fontFamily:"'Playfair Display',serif" }}>GetPosted</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:13, color:"#64748b" }}>{user?.name}</span>
            {onAdmin && <button onClick={onAdmin} style={{ ...BTN_S, fontSize:12, padding:"6px 12px", background:"#1e3a5f", color:"white", border:"none" }}>Admin</button>}
            <button onClick={onSettings} style={{ ...BTN_S, fontSize:12, padding:"6px 12px" }}>Settings</button>
            <button onClick={logout} style={{ ...BTN_S, fontSize:12, padding:"6px 12px" }}>Logout</button>
          </div>
        </div>

        {/* Welcome */}
        <div style={{ background:"white", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 24px rgba(0,0,0,.07)", marginBottom:20, textAlign:"center" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, margin:"0 0 8px", color:"#0f172a" }}>Welcome, {user?.name?.split(" ")[0]}!</h1>
          <p style={{ fontSize:14, color:"#64748b", margin:"0 0 20px" }}>Create AI-powered marketing flyers & playbooks</p>
          <button onClick={onNewFlyer} style={{ ...BTN_P, fontSize:15, padding:"13px 28px" }}>+ Create New</button>
        </div>

        {/* Saved items */}
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, margin:"0 0 14px", color:"#0f172a" }}>Your Creations</h2>
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ background:"white", borderRadius:12, padding:"40px 20px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,.04)", color:"#94a3b8" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>{"\u{1F4C4}"}</div>
            <div style={{ fontSize:14 }}>No saved items yet. Create your first flyer or playbook!</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {items.map(item => {
              const asset = ASSET_TYPES.find(a=>a.id===item.asset_id);
              const data = item.generated_data;
              return (
                <div key={item.id} style={{ background:"white", borderRadius:12, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.04)", border:"1px solid #e2e8f0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:item.item_type==="flyer"?"#1e3a5f":"#7c3aed", background:item.item_type==="flyer"?"#eff6ff":"#f5f3ff", padding:"2px 7px", borderRadius:4 }}>
                        {item.item_type}
                      </span>
                      <div style={{ fontWeight:700, fontSize:14, marginTop:6, color:"#0f172a" }}>{data.headline || data.title || asset?.label}</div>
                    </div>
                    <button onClick={()=>deleteItem(item.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#94a3b8", padding:4 }}>{"\u{1F5D1}\uFE0F"}</button>
                  </div>
                  <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>
                    {data.subheadline || data.subtitle || ""}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{asset?.icon} {asset?.label}</span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
