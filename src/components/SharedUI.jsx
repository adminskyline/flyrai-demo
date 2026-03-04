export const CARD = { background:"white", border:"1.5px solid #e2e8f0", borderRadius:10, padding:15 };
export const INP = { width:"100%", padding:"9px 13px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, fontFamily:"inherit", color:"#1a1a2e", background:"#fafafa" };
export const CatLbl = { fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", color:"#94a3b8", marginBottom:8 };
export const BTN_P = { background:"#1e3a5f", color:"white", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" };
export const BTN_S = { background:"white", color:"#334155", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"10px 20px", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" };

export function SH({ n, of, title, sub }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", color:"#94a3b8", marginBottom:4 }}>Step {n} of {of}</div>
      <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, letterSpacing:"-0.4px", fontFamily:"'Playfair Display',serif" }}>{title}</h2>
      <p style={{ margin:0, color:"#64748b", fontSize:13 }}>{sub}</p>
    </div>
  );
}

export function Card({ children, sel, onClick, sm }) {
  return (
    <div onClick={onClick}
      style={{ background:sel?"#f0f4ff":"white", border:`2px solid ${sel?"#1e3a5f":"#e2e8f0"}`, borderRadius:10, padding:sm?"11px 13px":18, cursor:"pointer", transition:"all .2s" }}
      onMouseEnter={e=>{ if(!sel) e.currentTarget.style.borderColor="#94a3b8"; }}
      onMouseLeave={e=>{ if(!sel) e.currentTarget.style.borderColor="#e2e8f0"; }}>
      {children}
    </div>
  );
}

export function Toggle({ on, onToggle, label, sub }) {
  return (
    <div onClick={onToggle} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 15px", borderRadius:10, cursor:"pointer", border:`2px solid ${on?"#1e3a5f":"#e2e8f0"}`, background:on?"#f0f4ff":"white", transition:"all .2s" }}>
      <div><div style={{ fontWeight:600, fontSize:14 }}>{label}</div><div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{sub}</div></div>
      <div style={{ width:40, height:22, borderRadius:11, background:on?"#1e3a5f":"#cbd5e1", position:"relative", transition:"background .2s", flexShrink:0, marginLeft:12 }}>
        <div style={{ position:"absolute", top:3, left:on?21:3, width:16, height:16, borderRadius:"50%", background:"white", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.3)" }}/>
      </div>
    </div>
  );
}

export function AvatarBox({ agent, size=44 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, overflow:"hidden", background:"linear-gradient(135deg,#1e3a5f,#2d6a8f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:Math.round(size*.45), border:"1.5px solid #e2e8f0" }}>
      {agent?.headshot ? <img src={agent.headshot} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span>{agent?.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
    </div>
  );
}

export function Btn({ children, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background:"#1e3a5f", color:"white", border:"none", borderRadius:8, padding:"11px 22px", fontWeight:700, fontSize:14, cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1, fontFamily:"inherit", transition:"opacity .15s" }}>{children}</button>;
}
