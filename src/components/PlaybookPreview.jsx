import { forwardRef } from "react";
import { ASSET_TYPES } from "../data/constants";

const PlaybookPreview = forwardRef(function PlaybookPreview({ playbookData, profile, partner, cobrand, accountType, selectedStates, assetId, pexelsImages = {} }, ref) {
  const asset = ASSET_TYPES.find(a=>a.id===assetId);
  const showPartner = cobrand && partner?.name;
  const pages = playbookData?.pages || [];
  const brandColor = "#1e3a5f";
  const accentGold = "#f0c040";

  return (
    <div ref={ref} style={{ width:"100%", maxWidth:480, margin:"0 auto", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Cover page */}
      <div data-playbook-page="cover" style={{ background:brandColor, borderRadius:12, overflow:"hidden", marginBottom:8, boxShadow:"0 20px 60px rgba(0,0,0,.28)", position:"relative" }}>
        {/* Full-bleed hero image */}
        {pexelsImages.cover && (
          <div style={{ position:"absolute", inset:0 }}>
            <img src={pexelsImages.cover} crossOrigin="anonymous" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(30,58,95,.6) 0%,rgba(30,58,95,.85) 50%,rgba(30,58,95,.95) 100%)" }} />
          </div>
        )}

        <div style={{ padding:"28px 28px 20px", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#7ab8e0", marginBottom:8 }}>
            {selectedStates.join(" \u00B7 ")} {"\u2014"} {new Date().getFullYear()} EDITION
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:"white", margin:"0 0 10px", lineHeight:1.2 }}>
            {playbookData?.title || asset?.label}
          </h2>
          <p style={{ fontSize:13, color:"#a8c8e0", margin:"0 0 20px", lineHeight:1.6 }}>
            {playbookData?.subtitle || "Your complete step-by-step guide"}
          </p>
          <div style={{ display:"flex", gap:8 }}>
            {(playbookData?.keyStats||[]).map((stat,i)=>(
              <div key={i} style={{ flex:1, background:"rgba(255,255,255,.12)", borderRadius:8, padding:"12px 12px", textAlign:"center", backdropFilter:"blur(4px)" }}>
                <div style={{ fontSize:22, fontWeight:900, color:accentGold, fontFamily:"'Playfair Display',serif" }}>{stat.value}</div>
                <div style={{ fontSize:10, color:"#a8c8e0", marginTop:3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents on cover */}
        <div style={{ background:"rgba(0,0,0,.3)", padding:"12px 24px", display:"flex", gap:10, alignItems:"center", position:"relative", zIndex:1 }}>
          {[profile, showPartner&&partner].filter(Boolean).map((ag,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flex:1, paddingRight:i===0&&showPartner?10:0, borderRight:i===0&&showPartner?"1px solid rgba(255,255,255,.2)":"none" }}>
              <div style={{ width:34, height:34, borderRadius:"50%", overflow:"hidden", background:"linear-gradient(135deg,#2d6a8f,#3a9abf)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:"2px solid rgba(255,255,255,.3)", flexShrink:0 }}>
                {ag.headshot ? <img src={ag.headshot} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span>{ag.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"white" }}>{ag.name}</div>
                <div style={{ fontSize:10, color:"#a8c8e0" }}>{ag.company}</div>
                {ag.type==="lo"&&<div style={{ fontSize:9, color:"#7ab8e0" }}>NMLS #{ag.nmls}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALL interior pages */}
      {pages.map((page,pi)=>{
        const isEven = pi % 2 === 0;
        const pageImg = pexelsImages[`page_${pi}`];
        const pullQuote = page.body ? page.body.split(/[.!?]/)[0] + "." : "";

        return (
          <div key={pi} data-playbook-page={`page_${pi}`} style={{ background:"white", borderRadius:10, overflow:"hidden", marginBottom:8, boxShadow:"0 4px 20px rgba(0,0,0,.08)", border:"1px solid #e2e8f0" }}>
            {/* Brand accent bar */}
            <div style={{ height:3, background:`linear-gradient(90deg, ${brandColor}, #3b82f6)` }} />

            {/* Page header */}
            <div style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0", padding:"10px 18px", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:brandColor, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>
                {pi+1}
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{page.title}</div>
            </div>

            {/* Section hero image - every page */}
            {pageImg && (
              <div style={{ width:"100%", height:isEven ? 140 : 100, overflow:"hidden", position:"relative" }}>
                <img src={pageImg} crossOrigin="anonymous" alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 40%,rgba(255,255,255,.8) 100%)" }} />
              </div>
            )}

            <div style={{ padding:"14px 18px" }}>
              {/* Odd pages: pull-quote layout */}
              {!isEven && (
                <div style={{ borderLeft:`3px solid ${brandColor}`, paddingLeft:14, marginBottom:12 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:"#1e293b", lineHeight:1.55, margin:0, fontStyle:"italic" }}>
                    {pullQuote}
                  </p>
                </div>
              )}

              {/* Body text */}
              <p style={{ fontSize:12, color:"#475569", lineHeight:1.65, margin:"0 0 12px" }}>{page.body}</p>

              {/* Big number stat */}
              {page.stat && (
                <div style={{ display:"flex", alignItems:"center", gap:10, background:"#f0f7ff", borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:900, color:brandColor, lineHeight:1 }}>{page.stat.value}</div>
                  <div style={{ fontSize:11, color:"#64748b", lineHeight:1.4 }}>{page.stat.label}</div>
                </div>
              )}

              {/* Tips */}
              {page.tips && (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {page.tips.map((tip,ti)=>(
                    <div key={ti} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"#eff6ff", border:"1.5px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0, marginTop:1 }}>{"\u2713"}</div>
                      <span style={{ fontSize:12, color:"#334155", lineHeight:1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Compliance footer */}
      <div data-playbook-page="footer" style={{ background:"#f8fafc", borderRadius:8, padding:"10px 14px", border:"1px solid #e2e8f0" }}>
        <div style={{ fontSize:9, color:"#94a3b8", lineHeight:1.6 }}>
          {accountType==="lo"
            ? `${profile?.company} NMLS #${profile?.companyNmls || profile?.company_nmls} | Not a commitment to lend | Equal Housing Opportunity | Licensed in ${selectedStates.join(", ")}`
            : `Equal Housing Opportunity | ${profile?.company} | Lic. #${profile?.license} | ${selectedStates.join(", ")}`}
        </div>
      </div>
    </div>
  );
});

export default PlaybookPreview;
