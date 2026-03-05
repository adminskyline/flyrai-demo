import { forwardRef } from "react";
import { ASSET_TYPES } from "../data/constants";

// US Letter at 72dpi = 612 x 792 points
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const brandColor = "#1e3a5f";
const accentGold = "#f0c040";

const PlaybookPreview = forwardRef(function PlaybookPreview({ playbookData, profile, partner, cobrand, accountType, selectedStates, assetId, pexelsImages = {} }, ref) {
  const asset = ASSET_TYPES.find(a=>a.id===assetId);
  const showPartner = cobrand && partner?.name;
  const pages = playbookData?.pages || [];

  const complianceText = accountType==="lo"
    ? `${profile?.company} NMLS #${profile?.companyNmls || profile?.company_nmls} | Not a commitment to lend | Equal Housing Opportunity | Licensed in ${selectedStates.join(", ")}`
    : `Equal Housing Opportunity | ${profile?.company} | Lic. #${profile?.license} | ${selectedStates.join(", ")}`;

  const pageBase = {
    width: PAGE_W,
    height: PAGE_H,
    overflow: "hidden",
    fontFamily: "'DM Sans',sans-serif",
    position: "relative",
    flexShrink: 0,
    boxSizing: "border-box",
  };

  return (
    <div ref={ref} style={{ width: PAGE_W, margin: "0 auto", fontFamily: "'DM Sans',sans-serif" }}>

      {/* ---- COVER PAGE ---- Full-bleed hero with overlay */}
      <div data-playbook-page="cover" style={{ ...pageBase, background: brandColor, marginBottom: 8 }}>
        {/* Full-bleed hero image - fills entire 612x792 page */}
        {pexelsImages.cover && (
          <div style={{ position: "absolute", inset: 0, width: PAGE_W, height: PAGE_H }}>
            <img src={pexelsImages.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e=>{e.target.parentElement.style.display="none"}} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(30,58,95,.25) 0%,rgba(30,58,95,.5) 30%,rgba(30,58,95,.85) 60%,rgba(30,58,95,.97) 100%)" }} />
          </div>
        )}

        {/* Logo - top-left */}
        {profile?.logo && (
          <div style={{ position: "absolute", top: MARGIN, left: MARGIN, zIndex: 2 }}>
            <img src={profile.logo} alt="" style={{ maxHeight: 48, maxWidth: 180, objectFit: "contain" }}/>
          </div>
        )}

        {/* Edition badge */}
        <div style={{ position: "absolute", top: profile?.logo ? 100 : 52, left: MARGIN, zIndex: 2, fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: accentGold }}>
          {selectedStates.join(" \u00B7 ")} {"\u2014"} {new Date().getFullYear()} EDITION
        </div>

        {/* Title block */}
        <div style={{ position: "absolute", top: profile?.logo ? 140 : 110, left: MARGIN, right: MARGIN, zIndex: 2 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, color: "white", margin: "0 0 18px", lineHeight: 1.15, letterSpacing: "-0.5px", maxWidth: PAGE_W - MARGIN * 2 }}>
            {playbookData?.title || asset?.label}
          </h1>
          <p style={{ fontSize: 16, color: "#c5daf0", margin: 0, lineHeight: 1.7, maxWidth: 420 }}>
            {playbookData?.subtitle || "Your complete step-by-step guide"}
          </p>
        </div>

        {/* Key stat cards */}
        <div style={{ position: "absolute", top: 400, left: MARGIN, right: MARGIN, zIndex: 2, display: "flex", gap: 16 }}>
          {(playbookData?.keyStats||[]).map((stat,i)=>(
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.1)", backdropFilter: "blur(12px)", borderRadius: 12, padding: "20px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,.12)" }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: accentGold, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#a8c8e0", marginTop: 8, lineHeight: 1.4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Agent bar at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", padding: "18px 40px", display: "flex", gap: 16, alignItems: "center" }}>
          {[profile, showPartner&&partner].filter(Boolean).map((ag,i)=>(
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, paddingRight: i===0&&showPartner?16:0, borderRight: i===0&&showPartner?"1px solid rgba(255,255,255,.2)":"none" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#2d6a8f,#3a9abf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,.3)", flexShrink: 0 }}>
                {ag.headshot ? <img src={ag.headshot} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{color:"white"}}>{ag.type==="lo"?"\u{1F4BC}":"\u{1F3D8}\uFE0F"}</span>}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{ag.name}</div>
                <div style={{ fontSize: 12, color: "#a8c8e0" }}>{ag.company}</div>
                {ag.phone&&<div style={{ fontSize: 11, color: "#8bb8d8" }}>{ag.phone}</div>}
                {ag.type==="lo"&&(ag.nmls||ag.companyNmls||ag.company_nmls)&&<div style={{ fontSize: 10, color: "#7ab8e0" }}>{ag.nmls?`NMLS #${ag.nmls}`:""}{ag.nmls&&(ag.companyNmls||ag.company_nmls)?" | ":""}{(ag.companyNmls||ag.company_nmls)?`Co. #${ag.companyNmls||ag.company_nmls}`:""}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- INTERIOR PAGES ---- */}
      {pages.map((page,pi)=>{
        const isEven = pi % 2 === 0;
        const isLastPage = pi === pages.length - 1;
        const pageImg = pexelsImages[`page_${pi}`];
        const pullQuote = page.body ? page.body.split(/[.!?]/)[0] + "." : "";
        const imgH = 220;

        return (
          <div key={pi} data-playbook-page={`page_${pi}`} style={{ ...pageBase, background: "white", marginBottom: 8, display: "flex", flexDirection: "column" }}>
            {/* Top accent bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${brandColor}, #3b82f6)`, flexShrink: 0 }} />

            {/* Section hero image - fitted to exact page width, constrained height */}
            {pageImg && (
              <div style={{ width: PAGE_W, height: imgH, overflow: "hidden", position: "relative", flexShrink: 0, background: "#f0f4f8" }}>
                <img src={pageImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e=>{e.target.parentElement.style.display="none"}} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(255,255,255,.9) 100%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: MARGIN, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: brandColor, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>
                    {pi+1}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#0f172a", textShadow: "0 1px 4px rgba(255,255,255,.8)" }}>{page.title}</div>
                </div>
              </div>
            )}

            {/* If no image, show header inline */}
            {!pageImg && (
              <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: `22px ${MARGIN}px`, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: brandColor, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  {pi+1}
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 24, color: "#0f172a" }}>{page.title}</div>
              </div>
            )}

            {/* Content area */}
            <div style={{ flex: 1, padding: `24px ${MARGIN}px 0`, display: "flex", flexDirection: "column" }}>
              {!isEven && (
                <div style={{ borderLeft: `3px solid ${brandColor}`, paddingLeft: 20, marginBottom: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                    {pullQuote}
                  </p>
                </div>
              )}

              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.8, margin: "0 0 20px" }}>{page.body}</p>

              {page.stat && (
                <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#f0f7ff", borderRadius: 12, padding: "18px 24px", marginBottom: 20, border: "1px solid #dbeafe" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, color: brandColor, lineHeight: 1 }}>{page.stat.value}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{page.stat.label}</div>
                </div>
              )}

              <div style={{ marginTop: "auto" }} />

              {page.tips && (
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: brandColor, marginBottom: 12 }}>Key Takeaways</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {page.tips.map((tip,ti)=>(
                      <div key={ti} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#eff6ff", border: "1.5px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 1, color: brandColor, fontWeight: 700 }}>{"\u2713"}</div>
                        <span style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Page footer */}
            <div style={{ padding: `12px ${MARGIN}px`, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: isLastPage ? "column" : "row", justifyContent: isLastPage ? "flex-start" : "space-between", alignItems: isLastPage ? "stretch" : "center", flexShrink: 0, gap: isLastPage ? 8 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{profile?.company || ""}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>Page {pi + 2}</div>
              </div>
              {isLastPage && (
                <div style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.7, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                  {complianceText}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default PlaybookPreview;
