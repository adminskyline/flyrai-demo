import { forwardRef } from "react";
import { FLYER_FORMATS, fmt$ } from "../data/constants";
import HouseScene from "./HouseScene";

const FlyerCard = forwardRef(function FlyerCard({ tIdx, flyerData, property, profile, partner, cobrand, accountType, selectedStates, formatId }, ref) {
  const fmt = FLYER_FORMATS.find(f=>f.id===formatId) || FLYER_FORMATS[0];
  const W = fmt.w; const H = fmt.h;
  const scale = W/340; const s = n=>Math.round(n*scale);

  const pals = [
    { bg:"#f7f8fc", surface:"#fff",    text:"#0f172a", muted:"#64748b", accent:"#1a3f6f", accentFg:"#fff",    divider:"#e2e8f0", cta:"#e05a3a", ctaFg:"#fff",    gradStop:"rgba(247,248,252,0.95)" },
    { bg:"#070707", surface:"#111",    text:"#f5f0e4", muted:"#a89070", accent:"#0a0a0a", accentFg:"#c9a94b", divider:"#222",    cta:"#c9a94b", ctaFg:"#070707", gradStop:"rgba(7,7,7,0.95)" },
    { bg:"#0c1628", surface:"#132040", text:"#e8f0ff", muted:"#7a9bc0", accent:"#0d2b2b", accentFg:"#fff",    divider:"#1e3050", cta:"#f5c84a", ctaFg:"#0c1628", gradStop:"rgba(12,22,40,0.95)" },
  ];
  const p = pals[tIdx];
  const showPartner = cobrand && partner?.name;
  const heroH = Math.round(H * 0.54);
  const hasImages = property.images && property.images.length > 0;

  return (
    <div ref={ref} style={{ width:W, height:H, background:p.bg, borderRadius:s(10), overflow:"hidden", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 20px 60px rgba(0,0,0,.28)", flexShrink:0 }}>

      {/* Hero */}
      <div style={{ position:"relative", height:heroH, flexShrink:0, overflow:"hidden" }}>
        {hasImages ? (
          <img src={property.images[0]} crossOrigin="anonymous" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <HouseScene variant={tIdx} width={W} height={heroH} accent={p.accent} />
        )}
        {/* Cinematic gradient overlay */}
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,.03) 35%,rgba(0,0,0,.35) 70%,${p.gradStop} 100%)` }} />

        {/* Badge */}
        <div style={{ position:"absolute", top:s(9), left:s(9), background:p.cta, color:p.ctaFg, fontSize:s(8), fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", padding:`${s(3)}px ${s(9)}px`, borderRadius:s(3) }}>
          {flyerData.badge||"NEW LISTING"}
        </div>

        {/* Thumbnail stack - right side */}
        {W >= 280 && (
          <div style={{ position:"absolute", top:s(9), right:s(9), display:"flex", flexDirection:"column", gap:s(3) }}>
            {(hasImages ? property.images.slice(1,3) : [1,2]).map((img,i) => (
              <div key={i} style={{ width:s(42), height:s(34), borderRadius:s(4), overflow:"hidden", border:`1.5px solid rgba(255,255,255,.3)`, boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>
                {hasImages ? (
                  <img src={img} crossOrigin="anonymous" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  <HouseScene variant={(tIdx+i+1)%4} width={s(42)} height={s(34)} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Price strip */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:`${s(8)}px ${s(10)}px ${s(10)}px`, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:s(7), fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:p.muted, marginBottom:s(2) }}>LIST PRICE</div>
            <span style={{ fontSize:s(22), fontWeight:900, color:p.text, fontFamily:"'Playfair Display',serif", lineHeight:1, textShadow:"0 2px 12px rgba(0,0,0,.5)" }}>
              {fmt$(property.price||"489000")}
            </span>
          </div>
          {/* Frosted stat pills */}
          <div style={{ display:"flex", gap:s(4), marginBottom:s(2) }}>
            {[
              { val: property.beds||4, lbl:"BD" },
              { val: property.baths||3, lbl:"BA" },
              { val: property.sqft||"2,340", lbl:"SF" },
            ].map((st,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,.15)", backdropFilter:"blur(8px)", borderRadius:s(4), padding:`${s(3)}px ${s(6)}px`, textAlign:"center", border:"1px solid rgba(255,255,255,.1)" }}>
                <div style={{ fontSize:s(10), fontWeight:800, color:p.text, lineHeight:1.1 }}>{st.val}</div>
                <div style={{ fontSize:s(6), fontWeight:700, color:p.muted, letterSpacing:"0.5px" }}>{st.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy */}
      <div style={{ flex:1, padding:`${s(10)}px ${s(12)}px ${s(5)}px`, display:"flex", flexDirection:"column", gap:s(4), overflow:"hidden" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:s(14), fontWeight:900, color:p.text, lineHeight:1.15, letterSpacing:"-0.5px" }}>
          {flyerData.headline}
        </div>
        <div style={{ fontSize:s(10.5), color:p.muted, lineHeight:1.5 }}>
          {flyerData.subheadline}
        </div>
        {H >= 320 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:`${s(2)}px ${s(8)}px` }}>
            {(flyerData.bullets||[]).slice(0,4).map((b,i)=>(
              <div key={i} style={{ fontSize:s(9), color:p.muted, display:"flex", alignItems:"center", gap:s(3) }}>
                <span style={{ color:p.cta, fontSize:s(7) }}>{"\u25CF"}</span>{b.replace(/^[^\w\d]+/,"")}
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize:s(9), color:p.muted, marginTop:"auto", opacity:.7 }}>
          {"\u{1F4CD}"} {property.address||"2847 Cypress Lake Dr, Tampa, FL 33618"}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:`${s(7)}px ${s(12)}px`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:s(8) }}>
          <div style={{ background:p.cta, color:p.ctaFg, padding:`${s(5)}px ${s(14)}px`, borderRadius:s(20), fontSize:s(10), fontWeight:700, whiteSpace:"nowrap" }}>
            {flyerData.cta}
          </div>
          <div style={{ fontSize:s(8), color:p.muted, opacity:.7 }}>{flyerData.footnote}</div>
        </div>
      </div>

      {/* Agent bar */}
      <div style={{ background:p.surface, borderTop:`1px solid ${p.divider}`, padding:`${s(7)}px ${s(10)}px`, display:"flex", gap:s(7), flexShrink:0 }}>
        {[profile, showPartner&&partner].filter(Boolean).map((ag,i)=>(
          <div key={i} style={{ flex:1, display:"flex", alignItems:"center", gap:s(6), paddingRight:i===0&&showPartner?s(7):0, borderRight:i===0&&showPartner?`1px solid ${p.divider}`:"none" }}>
            <div style={{ width:s(28), height:s(28), borderRadius:"50%", flexShrink:0, overflow:"hidden", background:`linear-gradient(135deg,${p.cta}55,${p.cta}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:s(13), border:`1.5px solid ${p.divider}` }}>
              {ag.headshot ? <img src={ag.headshot} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span>{ag.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:s(9), fontWeight:700, color:p.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ag.name}</div>
              <div style={{ fontSize:s(8), color:p.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ag.company}</div>
              <div style={{ fontSize:s(8), color:p.muted, opacity:.8 }}>{ag.phone}</div>
              {ag.type==="lo"&&ag.nmls&&<div style={{ fontSize:s(7), color:p.muted, opacity:.6 }}>NMLS #{ag.nmls}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance footer */}
      <div style={{ background:p.bg, padding:`${s(3)}px ${s(10)}px ${s(4)}px`, borderTop:`1px solid ${p.divider}`, flexShrink:0 }}>
        <div style={{ fontSize:s(6.5), color:p.muted, opacity:.55, lineHeight:1.5 }}>
          {accountType==="lo"
            ? `${profile?.company} NMLS #${profile?.companyNmls || profile?.company_nmls} | Not a commitment to lend | Equal Housing Opportunity | Licensed in ${selectedStates.join(", ")}`
            : `Equal Housing Opportunity | ${profile?.company} | Lic. #${profile?.license} | ${selectedStates.join(", ")}`}
        </div>
      </div>
    </div>
  );
});

export default FlyerCard;
