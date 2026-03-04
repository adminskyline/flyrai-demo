import { forwardRef, useState, useCallback } from "react";
import { FLYER_FORMATS, fmt$ } from "../data/constants";
import HouseScene from "./HouseScene";

const PALETTES = [
  // Light
  { bg:"#f7f8fc", surface:"#fff", text:"#0f172a", muted:"#64748b", accent:"#1a3f6f", accentFg:"#fff", divider:"#e2e8f0", cta:"#e05a3a", ctaFg:"#fff", gradStop:"rgba(247,248,252,0.95)", badgeBg:"#e05a3a", badgeFg:"#fff" },
  // Dark
  { bg:"#070707", surface:"#111", text:"#f5f0e4", muted:"#a89070", accent:"#0a0a0a", accentFg:"#c9a94b", divider:"#222", cta:"#c9a94b", ctaFg:"#070707", gradStop:"rgba(7,7,7,0.95)", badgeBg:"#c9a94b", badgeFg:"#070707" },
  // Navy
  { bg:"#0c1628", surface:"#132040", text:"#e8f0ff", muted:"#7a9bc0", accent:"#0d2b2b", accentFg:"#fff", divider:"#1e3050", cta:"#f5c84a", ctaFg:"#0c1628", gradStop:"rgba(12,22,40,0.95)", badgeBg:"#f5c84a", badgeFg:"#0c1628" },
];

const FlyerCard = forwardRef(function FlyerCard({ designIdx = 0, colorIdx = 0, flyerData, property, profile, partner, cobrand, accountType, selectedStates, formatId, photoOrder, editable, onUpdate }, ref) {
  const fmt = FLYER_FORMATS.find(f=>f.id===formatId) || FLYER_FORMATS[0];
  const W = fmt.w; const H = fmt.h;
  const scale = W/340; const s = n=>Math.round(n*scale);
  const p = PALETTES[colorIdx] || PALETTES[0];
  const showPartner = cobrand && partner?.name;
  const hasImages = property.images && property.images.length > 0;

  // Get image by slot, respecting photoOrder
  const getImg = (slotIdx) => {
    if (!hasImages) return null;
    const order = photoOrder || property.images.map((_,i)=>i);
    const imgIdx = order[slotIdx];
    return imgIdx !== undefined ? property.images[imgIdx] : null;
  };

  // Editable text wrapper
  const EditableText = useCallback(({ field, children, style, tag: Tag = "span" }) => {
    if (!editable || !onUpdate) return <Tag style={style}>{children}</Tag>;
    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        style={{ ...style, cursor: "text", outline: "none", borderBottom: "1px dashed rgba(128,128,128,.3)" }}
        onBlur={e => onUpdate(field, e.currentTarget.textContent)}
      >
        {children}
      </Tag>
    );
  }, [editable, onUpdate]);

  // Compliance footer
  const complianceFooter = (
    <div style={{ background:p.bg, padding:`${s(3)}px ${s(10)}px ${s(4)}px`, borderTop:`1px solid ${p.divider}`, flexShrink:0 }}>
      <div style={{ fontSize:s(6.5), color:p.muted, opacity:.55, lineHeight:1.5 }}>
        {accountType==="lo"
          ? `${profile?.company} NMLS #${profile?.companyNmls || profile?.company_nmls} | Not a commitment to lend | Equal Housing Opportunity | Licensed in ${selectedStates.join(", ")}`
          : `Equal Housing Opportunity | ${profile?.company} | Lic. #${profile?.license} | ${selectedStates.join(", ")}`}
      </div>
    </div>
  );

  // Agent bar (horizontal)
  const agentBarH = (
    <div style={{ background:p.surface, borderTop:`1px solid ${p.divider}`, padding:`${s(7)}px ${s(10)}px`, display:"flex", gap:s(7), flexShrink:0, alignItems:"center" }}>
      {profile?.logo && (
        <div style={{ width:s(28), height:s(28), flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginRight:s(2) }}>
          <img src={profile.logo} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/>
        </div>
      )}
      {[profile, showPartner&&partner].filter(Boolean).map((ag,i)=>(
        <div key={i} style={{ flex:1, display:"flex", alignItems:"center", gap:s(6), paddingRight:i===0&&showPartner?s(7):0, borderRight:i===0&&showPartner?`1px solid ${p.divider}`:"none" }}>
          <div style={{ width:s(28), height:s(28), borderRadius:"50%", flexShrink:0, overflow:"hidden", background:`linear-gradient(135deg,${p.cta}55,${p.cta}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:s(13), border:`1.5px solid ${p.divider}` }}>
            {ag.headshot ? <img src={ag.headshot} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span>{ag.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:s(9), fontWeight:700, color:p.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ag.name}</div>
            <div style={{ fontSize:s(8), color:p.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ag.company}</div>
            <div style={{ fontSize:s(8), color:p.muted, opacity:.8 }}>{ag.phone}</div>
            {ag.type==="lo"&&(ag.nmls||ag.companyNmls||ag.company_nmls)&&<div style={{ fontSize:s(7), color:p.muted, opacity:.6 }}>{ag.nmls?`NMLS #${ag.nmls}`:""}{ag.nmls&&(ag.companyNmls||ag.company_nmls)?" | ":""}{(ag.companyNmls||ag.company_nmls)?`Co. NMLS #${ag.companyNmls||ag.company_nmls}`:""}</div>}
          </div>
        </div>
      ))}
    </div>
  );

  // Agent bar (vertical — for Split design)
  const agentBarV = (
    <div style={{ background:p.surface, borderTop:`1px solid ${p.divider}`, padding:`${s(6)}px ${s(8)}px`, flexShrink:0 }}>
      {[profile, showPartner&&partner].filter(Boolean).map((ag,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:s(5), marginBottom:i===0&&showPartner?s(4):0, paddingBottom:i===0&&showPartner?s(4):0, borderBottom:i===0&&showPartner?`1px solid ${p.divider}`:"none" }}>
          <div style={{ width:s(22), height:s(22), borderRadius:"50%", flexShrink:0, overflow:"hidden", background:`linear-gradient(135deg,${p.cta}55,${p.cta}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:s(10), border:`1.5px solid ${p.divider}` }}>
            {ag.headshot ? <img src={ag.headshot} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span>{ag.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:s(8), fontWeight:700, color:p.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ag.name}</div>
            <div style={{ fontSize:s(7), color:p.muted }}>{ag.company}</div>
            <div style={{ fontSize:s(7), color:p.muted, opacity:.8 }}>{ag.phone}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Design A: Magazine ──
  const renderMagazine = () => {
    const heroH = Math.round(H * 0.54);
    const img0 = getImg(0);
    return (
      <div ref={ref} style={{ width:W, height:H, background:p.bg, borderRadius:s(10), overflow:"hidden", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 20px 60px rgba(0,0,0,.28)", flexShrink:0 }}>
        {/* Hero */}
        <div style={{ position:"relative", height:heroH, flexShrink:0, overflow:"hidden" }}>
          {img0 ? (
            <img src={img0} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}} />
          ) : (
            <HouseScene variant={colorIdx} width={W} height={heroH} accent={p.accent} />
          )}
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,.03) 35%,rgba(0,0,0,.35) 70%,${p.gradStop} 100%)` }} />

          {/* Floating price badge */}
          <div style={{ position:"absolute", top:s(9), left:s(9), background:p.cta, color:p.ctaFg, fontSize:s(8), fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", padding:`${s(3)}px ${s(9)}px`, borderRadius:s(3) }}>
            <EditableText field="badge">{flyerData.badge||"NEW LISTING"}</EditableText>
          </div>

          {/* Thumbnail stack */}
          {W >= 280 && (
            <div style={{ position:"absolute", top:s(9), right:s(9), display:"flex", flexDirection:"column", gap:s(3) }}>
              {[1,2].map(i => {
                const img = getImg(i);
                return (
                  <div key={i} style={{ width:s(42), height:s(34), borderRadius:s(4), overflow:"hidden", border:"1.5px solid rgba(255,255,255,.3)", boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>
                    {img ? <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}} /> : <HouseScene variant={(colorIdx+i+1)%4} width={s(42)} height={s(34)} />}
                  </div>
                );
              })}
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
            <div style={{ display:"flex", gap:s(4), marginBottom:s(2) }}>
              {[{val:property.beds||4,lbl:"BD"},{val:property.baths||3,lbl:"BA"},{val:property.sqft||"2,340",lbl:"SF"}].map((st,i)=>(
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
          <EditableText field="headline" tag="div" style={{ fontFamily:"'Playfair Display',serif", fontSize:s(14), fontWeight:900, color:p.text, lineHeight:1.15, letterSpacing:"-0.5px" }}>
            {flyerData.headline}
          </EditableText>
          <EditableText field="subheadline" tag="div" style={{ fontSize:s(10.5), color:p.muted, lineHeight:1.5 }}>
            {flyerData.subheadline}
          </EditableText>
          {H >= 320 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:`${s(2)}px ${s(8)}px` }}>
              {(flyerData.bullets||[]).slice(0,4).map((b,i)=>(
                <div key={i} style={{ fontSize:s(9), color:p.muted, display:"flex", alignItems:"center", gap:s(3) }}>
                  <span style={{ color:p.cta, fontSize:s(7) }}>{"\u25CF"}</span>
                  <EditableText field={`bullets.${i}`}>{b.replace(/^[^\w\d]+/,"")}</EditableText>
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
              <EditableText field="cta">{flyerData.cta}</EditableText>
            </div>
            <EditableText field="footnote" tag="div" style={{ fontSize:s(8), color:p.muted, opacity:.7 }}>{flyerData.footnote}</EditableText>
          </div>
        </div>

        {agentBarH}
        {complianceFooter}
      </div>
    );
  };

  // ── Design B: Split ──
  const renderSplit = () => {
    const leftW = Math.round(W * 0.48);
    const rightW = W - leftW;
    const img0 = getImg(0);
    const img1 = getImg(1);
    return (
      <div ref={ref} style={{ width:W, height:H, background:p.bg, borderRadius:s(10), overflow:"hidden", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 20px 60px rgba(0,0,0,.28)", flexShrink:0 }}>
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {/* Left — photo */}
          <div style={{ width:leftW, position:"relative", overflow:"hidden", flexShrink:0 }}>
            {img0 ? (
              <img src={img0} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}} />
            ) : (
              <HouseScene variant={colorIdx} width={leftW} height={H} accent={p.accent} />
            )}
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,transparent 60%,${p.bg} 100%)` }} />
            {/* Small second photo bottom-left */}
            {img1 && (
              <div style={{ position:"absolute", bottom:s(8), left:s(8), width:s(52), height:s(40), borderRadius:s(4), overflow:"hidden", border:`2px solid ${p.surface}`, boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>
                <img src={img1} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            )}
          </div>

          {/* Right — content */}
          <div style={{ width:rightW, display:"flex", flexDirection:"column", padding:`${s(12)}px ${s(10)}px ${s(6)}px`, overflow:"hidden" }}>
            {/* Badge */}
            <div style={{ alignSelf:"flex-start", background:p.badgeBg, color:p.badgeFg, fontSize:s(7), fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", padding:`${s(2)}px ${s(7)}px`, borderRadius:s(3), marginBottom:s(6) }}>
              <EditableText field="badge">{flyerData.badge||"NEW LISTING"}</EditableText>
            </div>

            {/* Price */}
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:s(18), fontWeight:900, color:p.text, lineHeight:1.1, marginBottom:s(4) }}>
              {fmt$(property.price||"489000")}
            </div>

            {/* Stats row */}
            <div style={{ display:"flex", gap:s(6), marginBottom:s(8) }}>
              {[{val:property.beds||4,lbl:"Beds"},{val:property.baths||3,lbl:"Baths"},{val:property.sqft||"2,340",lbl:"Sqft"}].map((st,i)=>(
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:s(11), fontWeight:800, color:p.text }}>{st.val}</div>
                  <div style={{ fontSize:s(6), color:p.muted, fontWeight:600 }}>{st.lbl}</div>
                </div>
              ))}
            </div>

            {/* Headline */}
            <EditableText field="headline" tag="div" style={{ fontFamily:"'Playfair Display',serif", fontSize:s(12), fontWeight:900, color:p.text, lineHeight:1.2, marginBottom:s(4) }}>
              {flyerData.headline}
            </EditableText>

            <EditableText field="subheadline" tag="div" style={{ fontSize:s(9), color:p.muted, lineHeight:1.5, marginBottom:s(6) }}>
              {flyerData.subheadline}
            </EditableText>

            {/* Bullets */}
            {H >= 300 && (
              <div style={{ display:"flex", flexDirection:"column", gap:s(3), marginBottom:s(6) }}>
                {(flyerData.bullets||[]).slice(0,4).map((b,i)=>(
                  <div key={i} style={{ fontSize:s(8), color:p.muted, display:"flex", alignItems:"center", gap:s(3) }}>
                    <span style={{ color:p.cta, fontSize:s(6) }}>{"\u25CF"}</span>
                    <EditableText field={`bullets.${i}`}>{b.replace(/^[^\w\d]+/,"")}</EditableText>
                  </div>
                ))}
              </div>
            )}

            {/* Address */}
            <div style={{ fontSize:s(8), color:p.muted, opacity:.7, marginTop:"auto" }}>
              {"\u{1F4CD}"} {property.address||"2847 Cypress Lake Dr, Tampa, FL 33618"}
            </div>

            {/* CTA */}
            <div style={{ marginTop:s(6) }}>
              <div style={{ background:p.cta, color:p.ctaFg, padding:`${s(4)}px ${s(10)}px`, borderRadius:s(20), fontSize:s(9), fontWeight:700, textAlign:"center" }}>
                <EditableText field="cta">{flyerData.cta}</EditableText>
              </div>
            </div>
          </div>
        </div>

        {agentBarV}
        {complianceFooter}
      </div>
    );
  };

  // ── Design C: Grid ──
  const renderGrid = () => {
    const gridH = Math.round(H * 0.40);
    const imgs = [getImg(0), getImg(1), getImg(2), getImg(3)];
    const hasMultiple = imgs.filter(Boolean).length > 1;

    return (
      <div ref={ref} style={{ width:W, height:H, background:p.bg, borderRadius:s(10), overflow:"hidden", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 20px 60px rgba(0,0,0,.28)", flexShrink:0 }}>
        {/* Photo grid */}
        <div style={{ height:gridH, flexShrink:0, overflow:"hidden", display:"grid", gridTemplateColumns: hasMultiple ? "1fr 1fr" : "1fr", gridTemplateRows: hasMultiple ? "1fr 1fr" : "1fr", gap:2 }}>
          {hasMultiple ? (
            imgs.slice(0,4).map((img,i)=>(
              <div key={i} style={{ overflow:"hidden", position:"relative", background:p.surface }}>
                {img ? (
                  <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}} />
                ) : (
                  <HouseScene variant={(colorIdx+i)%4} width={W/2} height={gridH/2} accent={p.accent} />
                )}
              </div>
            ))
          ) : (
            <div style={{ overflow:"hidden", position:"relative" }}>
              {imgs[0] ? (
                <img src={imgs[0]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : (
                <HouseScene variant={colorIdx} width={W} height={gridH} accent={p.accent} />
              )}
            </div>
          )}
        </div>

        {/* Stats ribbon */}
        <div style={{ display:"flex", justifyContent:"space-around", padding:`${s(6)}px ${s(8)}px`, background:p.surface, borderBottom:`1px solid ${p.divider}`, flexShrink:0 }}>
          {[
            { val: fmt$(property.price||"489000"), lbl: "Price" },
            { val: property.beds||4, lbl: "Beds" },
            { val: property.baths||3, lbl: "Baths" },
            { val: property.sqft||"2,340", lbl: "Sqft" },
          ].map((st,i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:s(11), fontWeight:900, color:p.cta, fontFamily:"'Playfair Display',serif" }}>{st.val}</div>
              <div style={{ fontSize:s(6), fontWeight:700, color:p.muted, letterSpacing:"0.5px", textTransform:"uppercase" }}>{st.lbl}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:`${s(8)}px ${s(12)}px ${s(4)}px`, display:"flex", flexDirection:"column", gap:s(3), overflow:"hidden" }}>
          {/* Badge */}
          <div style={{ alignSelf:"flex-start", background:p.badgeBg, color:p.badgeFg, fontSize:s(7), fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", padding:`${s(2)}px ${s(7)}px`, borderRadius:s(3) }}>
            <EditableText field="badge">{flyerData.badge||"NEW LISTING"}</EditableText>
          </div>

          <EditableText field="headline" tag="div" style={{ fontFamily:"'Playfair Display',serif", fontSize:s(13), fontWeight:900, color:p.text, lineHeight:1.15 }}>
            {flyerData.headline}
          </EditableText>
          <EditableText field="subheadline" tag="div" style={{ fontSize:s(9.5), color:p.muted, lineHeight:1.5 }}>
            {flyerData.subheadline}
          </EditableText>

          {H >= 320 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:`${s(2)}px ${s(8)}px` }}>
              {(flyerData.bullets||[]).slice(0,4).map((b,i)=>(
                <div key={i} style={{ fontSize:s(8.5), color:p.muted, display:"flex", alignItems:"center", gap:s(3) }}>
                  <span style={{ color:p.cta, fontSize:s(6) }}>{"\u25CF"}</span>
                  <EditableText field={`bullets.${i}`}>{b.replace(/^[^\w\d]+/,"")}</EditableText>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize:s(8), color:p.muted, marginTop:"auto", opacity:.7 }}>
            {"\u{1F4CD}"} {property.address||"2847 Cypress Lake Dr, Tampa, FL 33618"}
          </div>

          {/* CTA */}
          <div style={{ display:"flex", alignItems:"center", gap:s(6), marginTop:s(2) }}>
            <div style={{ background:p.cta, color:p.ctaFg, padding:`${s(4)}px ${s(12)}px`, borderRadius:s(20), fontSize:s(9), fontWeight:700 }}>
              <EditableText field="cta">{flyerData.cta}</EditableText>
            </div>
            <EditableText field="footnote" tag="div" style={{ fontSize:s(7), color:p.muted, opacity:.7 }}>{flyerData.footnote}</EditableText>
          </div>
        </div>

        {/* Rounded card agent section */}
        <div style={{ margin:`0 ${s(8)}px ${s(4)}px`, background:p.surface, borderRadius:s(8), border:`1px solid ${p.divider}`, padding:`${s(6)}px ${s(10)}px`, display:"flex", gap:s(6), alignItems:"center" }}>
          {profile?.logo && (
            <div style={{ width:s(24), height:s(24), flexShrink:0 }}>
              <img src={profile.logo} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/>
            </div>
          )}
          {[profile, showPartner&&partner].filter(Boolean).map((ag,i)=>(
            <div key={i} style={{ flex:1, display:"flex", alignItems:"center", gap:s(5), paddingRight:i===0&&showPartner?s(5):0, borderRight:i===0&&showPartner?`1px solid ${p.divider}`:"none" }}>
              <div style={{ width:s(24), height:s(24), borderRadius:"50%", flexShrink:0, overflow:"hidden", background:`linear-gradient(135deg,${p.cta}55,${p.cta}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:s(11), border:`1.5px solid ${p.divider}` }}>
                {ag.headshot ? <img src={ag.headshot} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span>{ag.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
              </div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:s(8), fontWeight:700, color:p.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ag.name}</div>
                <div style={{ fontSize:s(7), color:p.muted }}>{ag.company}</div>
                <div style={{ fontSize:s(7), color:p.muted, opacity:.8 }}>{ag.phone}</div>
              </div>
            </div>
          ))}
        </div>

        {complianceFooter}
      </div>
    );
  };

  if (designIdx === 1) return renderSplit();
  if (designIdx === 2) return renderGrid();
  return renderMagazine();
});

export default FlyerCard;
