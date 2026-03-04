import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "./api";
import { ASSET_TYPES, FLYER_FORMATS, STATES, fmt$ } from "./data/constants";
import { validateCompliance } from "./data/compliance";
import { SH, Card, Toggle, AvatarBox, Btn, CARD, INP, BTN_P, BTN_S, CatLbl } from "./components/SharedUI";
import HouseScene from "./components/HouseScene";
import FlyerCard from "./components/FlyerCard";
import PlaybookPreview from "./components/PlaybookPreview";
import { exportElementToPdf, exportPlaybookToPdf } from "./components/PdfExport";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel="stylesheet";
_fl.href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap";
document.head.appendChild(_fl);

export default function FlyrAI({ onDone }) {
  const { user } = useAuth();

  // Build profile from user data
  const profile = user ? {
    type: user.account_type,
    name: user.name,
    title: user.title || (user.account_type === "lo" ? "Loan Officer" : "Real Estate Agent"),
    phone: user.phone || "",
    company: user.company || "",
    nmls: user.nmls || "",
    companyNmls: user.company_nmls || "",
    license: user.license || "",
    states: user.states || ["FL"],
    headshot: user.headshot_url || null,
    logo: user.logo_url || null,
  } : { type:"lo", name:"Demo User", title:"Loan Officer", phone:"", company:"", nmls:"", companyNmls:"", license:"", states:["FL"], headshot:null, logo:null };

  const [step, setStep]           = useState(0);
  const [asset, setAsset]         = useState(null);
  const [property, setProperty]   = useState({ url:"", address:"", price:"", beds:"", baths:"", sqft:"", description:"", images:[] });
  const [urlLoading, setUrlLoading] = useState(false);
  const [cobrand, setCobrand]     = useState(false);
  const [useExisting, setUseExisting] = useState(true);
  const [partner, setPartner]     = useState({ type:"", name:"", title:"", phone:"", company:"", nmls:"", license:"", headshot:null });
  const [format, setFormat]       = useState("ig_post");
  const [states, setStates]       = useState(user?.states || ["FL"]);
  const [compliance, setCompliance] = useState([]);
  const [compRunning, setCompRunning] = useState(false);
  const [compPassed, setCompPassed]   = useState(false);
  const [compFailed, setCompFailed]   = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [flyerData, setFlyerData]     = useState(null);
  const [playbookData, setPlaybookData] = useState(null);
  const [activeTpl, setActiveTpl]     = useState(0);
  const [pexelsImages, setPexelsImages] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [playbookDownloaded, setPlaybookDownloaded] = useState(false);
  const [playbookDownloading, setPlaybookDownloading] = useState(false);
  const photoInputRef = useRef();
  const partnerImgRef = useRef();
  const flyerRef = useRef();
  const playbookRef = useRef();

  const acctType = user?.account_type || "lo";
  const existingPartner = acctType==="lo"
    ? { type:"realtor", name:"", title:"", phone:"", company:"", license:"", headshot:null }
    : { type:"lo", name:"", title:"", phone:"", company:"", nmls:"", headshot:null };
  const assetObj = ASSET_TYPES.find(a=>a.id===asset);
  const isPlaybook = assetObj?.category==="Playbook";

  // ── Import URL ──
  const importUrl = async () => {
    if (!property.url) return;
    setUrlLoading(true);
    try {
      const res = await api.post("/import-url", { url: property.url });
      const j = res.data;
      setProperty(p=>({...p,...j,price:String(j.price||p.price),images:[...uploadedPhotos,...(j.images||[])].slice(0,8)}));
    } catch {
      setProperty(p=>({...p,address:"2847 Cypress Lake Dr, Tampa, FL 33618",price:"489000",beds:"4",baths:"3",sqft:"2,340",description:"Stunning 4-bedroom pool home in a private gated community. Chef's kitchen, open floor plan, and oversized screened lanai overlooking conservation lot.",images:[
        "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
      ]}));
    }
    setUrlLoading(false);
  };

  // ── Compliance ──
  const runCompliance = async () => {
    setCompRunning(true); setCompliance([]); setCompPassed(false); setCompFailed(false);
    const { results } = validateCompliance(acctType, profile, cobrand, partner);
    for (let i=0;i<results.length;i++) {
      await new Promise(r=>setTimeout(r,200+Math.random()*140));
      setCompliance(p=>[...p, results[i]]);
    }
    const allPassed = results.every(r => r.passed);
    setCompRunning(false);
    setCompPassed(allPassed);
    setCompFailed(!allPassed);
  };

  // ── Generate flyer ──
  const generateFlyer = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/generate/flyer", {
        assetLabel: assetObj?.label,
        address: property.address,
        price: property.price,
        beds: property.beds,
        baths: property.baths,
        description: property.description,
      });
      setFlyerData(res.data);
    } catch {
      setFlyerData({headline:"YOUR DREAM HOME AWAITS",subheadline:"Luxury pool home in Tampa's most sought-after gated community",badge:"NEW LISTING",bullets:["4 Bed / 3 Bath / 2,340 sq ft","Private screened pool & spa","Chef's kitchen, quartz counters","Conservation lot \u2014 no rear neighbors"],cta:"Schedule a Private Tour",footnote:"Limited showings \u2014 contact us today."});
    }
    setGenerating(false); setStep(7);
  };

  // ── Generate playbook ──
  const generatePlaybook = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/generate/playbook", {
        assetLabel: assetObj?.label,
        states,
      });
      setPlaybookData(res.data);
    } catch {
      setPlaybookData({title:`${assetObj?.label} \u2014 ${states.join(", ")}`,subtitle:"Your complete step-by-step guide to success",keyStats:[{value:"87%",label:"Success rate"},{value:"$24K",label:"Avg savings"},{value:"42",label:"Days saved"}],pages:[{title:"Getting Started",body:"Understanding the process is the first step.",tips:["Review your credit score","Gather tax returns","Get pre-approved"]},{title:"The Process",body:"Each stage has key milestones.",tips:["Work with a professional","Understand your options","Ask questions"]},{title:"Financing",body:"We break it down simply.",tips:["Compare loan types","Understand rate vs APR","Lock your rate"],stat:{value:"$12K",label:"Average savings with proper rate shopping"}},{title:"Closing & Beyond",body:"Here's how to nail the closing.",tips:["Review Closing Disclosure","Final walkthrough","Keep records"]},{title:"State Programs",body:`${states.join(", ")} offers unique programs.`,tips:["Ask about state grants","Down payment assistance","Income-based programs"],stat:{value:"97%",label:"Approval rate for qualified applicants"}}]});
    }
    setGenerating(false); setStep(7);
    // Fetch Pexels images in background
    fetchPexelsForPlaybook(asset);
  };

  const generate = isPlaybook ? generatePlaybook : generateFlyer;

  // ── Auto-save after generation ──
  const autoSave = async (data) => {
    try {
      await api.post("/flyers", {
        item_type: isPlaybook ? "playbook" : "flyer",
        asset_id: asset,
        label: data.headline || data.title || assetObj?.label || "",
        generated_data: data,
        property_data: isPlaybook ? null : property,
        profile_data: profile,
        partner_data: activePartner || null,
        settings_data: { format, states, cobrand, acctType },
      });
    } catch { /* silent */ }
  };

  // Watch for generation completion
  const prevFlyerData = useRef(flyerData);
  const prevPlaybookData = useRef(playbookData);
  if (flyerData && flyerData !== prevFlyerData.current) {
    prevFlyerData.current = flyerData;
    autoSave(flyerData);
  }
  if (playbookData && playbookData !== prevPlaybookData.current) {
    prevPlaybookData.current = playbookData;
    autoSave(playbookData);
  }

  // ── Pexels for playbooks ──
  const PEXELS_QUERIES = {
    ftb: "first time home buyer couple",
    buybeforesell: "family moving new home",
    investment: "investment property exterior",
    va: "military family home",
    rentvsbuy: "apartment vs house comparison",
  };

  const fetchPexelsForPlaybook = async (assetIdVal) => {
    try {
      const baseQuery = PEXELS_QUERIES[assetIdVal] || "real estate home buying";
      const pageQueries = [
        "home interior modern kitchen",
        "mortgage documents signing couple",
        "happy family new home keys",
        "real estate house exterior",
        "neighborhood suburban community",
        "home inspection house",
        "financial planning calculator",
        "moving boxes new home",
      ];

      // Fetch all images in parallel for speed
      const allQueries = [
        api.get(`/generate/pexels?query=${encodeURIComponent(baseQuery)}&per_page=2`),
        ...pageQueries.map(q => api.get(`/generate/pexels?query=${encodeURIComponent(q)}&per_page=1`)),
      ];
      const results = await Promise.allSettled(allQueries);
      const imgs = {};
      if (results[0].status === "fulfilled" && results[0].value.photos?.[0]?.src)
        imgs.cover = results[0].value.photos[0].src;
      for (let i = 0; i < pageQueries.length; i++) {
        const r = results[i + 1];
        if (r.status === "fulfilled" && r.value.photos?.[0]?.src)
          imgs[`page_${i}`] = r.value.photos[0].src;
      }
      setPexelsImages(imgs);
    } catch {
      setPexelsImages({});
    }
  };

  const reset = () => {
    setStep(0);setFlyerData(null);setPlaybookData(null);setCompliance([]);setCompPassed(false);setCompFailed(false);
    setAsset(null);setProperty({url:"",address:"",price:"",beds:"",baths:"",sqft:"",description:"",images:[]});
    setPartner({type:"",name:"",title:"",phone:"",company:"",nmls:"",license:"",headshot:null});
    setCobrand(false);setUseExisting(true);setCompRunning(false);setPexelsImages({});setUploadedPhotos([]);setPlaybookDownloaded(false);setPlaybookDownloading(false);
  };

  const goHome = () => { reset(); if (onDone) onDone(); };

  const toggleState = s => setStates(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const activePartner = cobrand ? (useExisting ? existingPartner : (partner.name?partner:null)) : null;

  const goNext = (from) => {
    if (from===2) { setStep(isPlaybook ? 4 : 3); return; }
    if (from===4) { setStep(5); return; }
    setStep(s=>s+1);
  };
  const goBack = () => {
    if (step===4 && isPlaybook) { setStep(2); return; }
    if (step===5) { setStep(4); return; }
    setStep(s=>s-1);
  };

  const totalSteps = isPlaybook ? 6 : 7;
  const displayStep = isPlaybook
    ? [0,1,2,0,3,4,5,6][step]
    : step;

  // ── Download handlers ──
  const downloadFlyer = () => {
    if (flyerRef.current) {
      const fmtObj = FLYER_FORMATS.find(f=>f.id===format);
      exportElementToPdf(flyerRef.current, `FlyrAI-${fmtObj?.label || "flyer"}.pdf`);
    }
  };
  const downloadPlaybook = useCallback(async () => {
    if (playbookRef.current) {
      setPlaybookDownloading(true);
      try {
        await exportPlaybookToPdf(playbookRef.current, `FlyrAI-${assetObj?.label || "playbook"}.pdf`);
        setPlaybookDownloaded(true);
      } catch { /* silent */ }
      setPlaybookDownloading(false);
    }
  }, [assetObj]);

  // Auto-download playbook PDF when reaching step 7
  const autoDownloadDone = useRef(false);
  useEffect(() => {
    if (step === 7 && isPlaybook && playbookData && !autoDownloadDone.current && !playbookDownloaded) {
      autoDownloadDone.current = true;
      const timer = setTimeout(() => downloadPlaybook(), 800);
      return () => clearTimeout(timer);
    }
    if (step !== 7) autoDownloadDone.current = false;
  }, [step, playbookData, isPlaybook, playbookDownloaded, downloadPlaybook]);

  // ── Step renders ──────────────────────────────────────────────────────────

  const S0 = (
    <div style={{textAlign:"center",padding:"52px 16px"}}>
      <div style={{fontSize:"48px",marginBottom:"14px"}}>{"\u2726"}</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"46px",fontWeight:900,margin:"0 0 10px",letterSpacing:"-1.5px",color:"#0f172a"}}>FlyrAI</h1>
      <p style={{fontSize:"16px",color:"#64748b",maxWidth:"360px",margin:"0 auto 44px",lineHeight:1.65}}>
        On-demand co-branded marketing flyers & playbooks for mortgage & real estate pros {"\u2014"} compliance built in.
      </p>
      <Btn onClick={()=>setStep(2)}>Get Started {"\u2192"}</Btn>
    </div>
  );

  const S2 = (
    <div>
      <SH n={1} of={totalSteps} title="What are you creating?" sub="Flyers are social-ready posts. Playbooks are multi-page PDF guides." />
      {["Flyer","Playbook"].map(cat=>(
        <div key={cat} style={{marginBottom:18}}>
          <div style={{...CatLbl, display:"flex",alignItems:"center",gap:8}}>
            {cat==="Flyer" ? "\u{1F4F8} FLYERS \u2014 Social media & print" : "\u{1F4D6} PLAYBOOKS \u2014 Multi-page PDF downloads"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {ASSET_TYPES.filter(a=>a.category===cat).map(a=>(
              <Card key={a.id} sel={asset===a.id} onClick={()=>setAsset(a.id)} sm>
                <div style={{fontSize:20,marginBottom:4}}>{a.icon}</div>
                <div style={{fontWeight:600,fontSize:13}}>{a.label}</div>
                <div style={{color:"#94a3b8",fontSize:11}}>{a.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>asset&&goNext(2)} disabled={!asset}>Continue {"\u2192"}</Btn>
      </div>
    </div>
  );

  const S3 = (
    <div>
      <SH n={2} of={totalSteps} title="Property Details" sub="Import from a listing URL or enter manually" />
      <div style={CARD}>
        <div style={{fontWeight:600,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>{"\u{1F517}"} Import from Zillow / Realtor.com</div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="https://www.zillow.com/homedetails/..." value={property.url} onChange={e=>setProperty(p=>({...p,url:e.target.value}))} style={INP} />
          <button onClick={importUrl} disabled={urlLoading} style={{...BTN_P,whiteSpace:"nowrap",opacity:urlLoading?.5:1}}>{urlLoading?"\u23F3":"Import"}</button>
        </div>
        <div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>AI extracts address, price, beds, baths & description</div>
      </div>
      <div style={{textAlign:"center",color:"#94a3b8",fontSize:12,margin:"10px 0"}}>{"\u2014"} or enter manually {"\u2014"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <input placeholder="Property address" value={property.address} onChange={e=>setProperty(p=>({...p,address:e.target.value}))} style={INP}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[["price","Price $"],["beds","Beds"],["baths","Baths"],["sqft","Sqft"]].map(([k,ph])=>(
            <input key={k} placeholder={ph} value={property[k]} onChange={e=>setProperty(p=>({...p,[k]:e.target.value}))} style={INP}/>
          ))}
        </div>
        <textarea placeholder="Property description\u2026" value={property.description} onChange={e=>setProperty(p=>({...p,description:e.target.value}))} rows={3} style={{...INP,resize:"vertical"}}/>
      </div>

      {/* Photo upload */}
      <div style={{...CARD,marginTop:12}}>
        <div style={{fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>{"\u{1F4F7}"} Property Photos <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(up to 8)</span></div>
        {property.images.length > 0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {property.images.slice(0,8).map((img,i)=>(
              <div key={i} style={{width:64,height:48,borderRadius:6,overflow:"hidden",border:"1.5px solid #e2e8f0",position:"relative"}}>
                <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.parentElement.style.display="none"}}/>
                <button onClick={()=>setProperty(p=>({...p,images:p.images.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:1,right:1,background:"rgba(0,0,0,.5)",color:"white",border:"none",borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{"\u00D7"}</button>
              </div>
            ))}
          </div>
        )}
        <label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"1.5px dashed #93c5fd",background:"#f8faff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#1e3a5f"}}>
          {"\u2B06\uFE0F"} Upload Photos
          <input ref={photoInputRef} type="file" accept="image/*" multiple style={{display:"none"}}
            onChange={e=>{
              const files = [...(e.target.files||[])].slice(0,8-property.images.length);
              const urls = files.map(f=>URL.createObjectURL(f));
              setUploadedPhotos(p=>[...p,...urls]);
              setProperty(p=>({...p,images:[...p.images,...urls].slice(0,8)}));
              e.target.value="";
            }}/>
        </label>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
        <Btn onClick={()=>setStep(4)}>Continue {"\u2192"}</Btn>
      </div>
    </div>
  );

  const S4 = (
    <div>
      <SH n={isPlaybook?2:3} of={totalSteps} title="Co-Branding" sub="Solo or add a partner to the piece" />

      <div style={{...CARD,borderLeft:"3px solid #1e3a5f",marginBottom:14}}>
        <div style={CatLbl}>Your Profile</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <AvatarBox agent={profile} />
          <div style={{flex:1}}>
            <div style={{fontWeight:700}}>{profile?.name}</div>
            <div style={{fontSize:13,color:"#64748b"}}>{profile?.title} {"\u00B7"} {profile?.company}</div>
            {acctType==="lo"&&<div style={{fontSize:11,color:"#94a3b8"}}>NMLS #{profile?.nmls} | Co. #{profile?.companyNmls}</div>}
          </div>
        </div>
      </div>

      <Toggle on={cobrand} onToggle={()=>setCobrand(c=>!c)} label="Add Co-Brand Partner" sub="Feature a partner's headshot, name, and info" />

      {cobrand&&(
        <div style={{...CARD,background:"#f8faff",border:"1px dashed #93c5fd",marginTop:12}}>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[{v:true,l:"Use Existing Profile"},{v:false,l:"Enter New Partner"}].map(o=>(
              <button key={String(o.v)} onClick={()=>setUseExisting(o.v)}
                style={{flex:1,padding:"7px 8px",borderRadius:7,border:"1.5px solid",borderColor:useExisting===o.v?"#1e3a5f":"#cbd5e1",background:useExisting===o.v?"#1e3a5f":"white",color:useExisting===o.v?"white":"#334155",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                {o.l}
              </button>
            ))}
          </div>

          {useExisting ? (
            <div style={{padding:"14px",background:"white",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,color:"#64748b"}}>
              Partner profiles from your contacts will appear here. For now, enter a new partner.
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>Partner Type</div>
              <div style={{display:"flex",gap:8}}>
                {[{t:"lo",l:"Loan Officer"},{t:"realtor",l:"Realtor\u00AE"}].map(o=>(
                  <button key={o.t} onClick={()=>setPartner(p=>({...p,type:o.t}))}
                    style={{flex:1,padding:7,borderRadius:7,border:"1.5px solid",borderColor:partner.type===o.t?"#1e3a5f":"#cbd5e1",background:partner.type===o.t?"#1e3a5f":"white",color:partner.type===o.t?"white":"#334155",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    {o.l}
                  </button>
                ))}
              </div>
              {[["name","Full Name *"],["title","Title / Role"],["phone","Phone Number *"],["company","Company Name *"]].map(([k,ph])=>(
                <input key={k} placeholder={ph} value={partner[k]||""} onChange={e=>setPartner(p=>({...p,[k]:e.target.value}))} style={INP}/>
              ))}
              {partner.type==="lo"&&<input placeholder="Individual NMLS ID *" value={partner.nmls||""} onChange={e=>setPartner(p=>({...p,nmls:e.target.value}))} style={INP}/>}
              {partner.type==="realtor"&&<input placeholder="State License # *" value={partner.license||""} onChange={e=>setPartner(p=>({...p,license:e.target.value}))} style={INP}/>}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"white",borderRadius:8,border:"1px dashed #cbd5e1"}}>
                <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",background:partner.headshot?"transparent":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:"1.5px solid #e2e8f0",flexShrink:0}}>
                  {partner.headshot?<img src={partner.headshot} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"\u{1F464}"}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#334155"}}>Partner Headshot</div>
                  <label style={{fontSize:12,color:"#1e3a5f",cursor:"pointer",fontWeight:600}}>
                    {partner.headshot?"Change Photo \u2191":"Upload Photo \u2191"}
                    <input ref={partnerImgRef} type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>{const f=e.target.files?.[0];if(f)setPartner(p=>({...p,headshot:URL.createObjectURL(f)}));}}/>
                  </label>
                </div>
                {partner.headshot&&<div style={{marginLeft:"auto",fontSize:18}}>{"\u2705"}</div>}
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
        <Btn onClick={()=>goNext(4)}>Continue {"\u2192"}</Btn>
      </div>
    </div>
  );

  const S5 = (
    <div>
      <SH n={isPlaybook?3:4} of={totalSteps}
        title={isPlaybook?"Select States":"Format & States"}
        sub={isPlaybook?"Choose the states this playbook will cover":"Choose output format and compliance jurisdiction"} />

      {!isPlaybook && (
        <>
          <div style={{fontWeight:600,marginBottom:10}}>Output Format</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:22}}>
            {FLYER_FORMATS.map(f=>(
              <Card key={f.id} sel={format===f.id} onClick={()=>setFormat(f.id)} sm>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{f.icon}</span>
                  <div><div style={{fontWeight:600,fontSize:13}}>{f.label}</div><div style={{fontSize:11,color:"#94a3b8"}}>{f.dims}</div></div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {isPlaybook && (
        <div style={{...CARD,background:"#eff6ff",border:"1px solid #bfdbfe",marginBottom:16,display:"flex",alignItems:"flex-start",gap:10}}>
          <span style={{fontSize:22,flexShrink:0}}>{"\u{1F4D6}"}</span>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#1e40af",marginBottom:3}}>Multi-Page PDF Output</div>
            <div style={{fontSize:12,color:"#3b82f6",lineHeight:1.6}}>
              Playbooks generate as downloadable PDFs {"\u2014"} cover page, 5+ content chapters, and state-specific details.
            </div>
          </div>
        </div>
      )}

      <div style={{fontWeight:600,marginBottom:6}}>
        {isPlaybook ? "States to Cover" : "States for Compliance"}
      </div>
      <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>
        {isPlaybook ? "Content and programs will be tailored to each selected state" : "Select every state where this flyer will be distributed"}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:148,overflowY:"auto",padding:2}}>
        {STATES.map(s=>(
          <div key={s} onClick={()=>toggleState(s)}
            style={{padding:"4px 9px",borderRadius:4,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",background:states.includes(s)?"#1e3a5f":"#f1f5f9",color:states.includes(s)?"white":"#334155"}}>
            {s}
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:22}}>
        <Btn onClick={()=>setStep(6)}>Run Compliance Check {"\u2192"}</Btn>
      </div>
    </div>
  );

  const S6 = (
    <div>
      <SH n={isPlaybook?4:5} of={totalSteps} title="Compliance Check" sub={`Verifying for ${states.join(", ")}`}/>
      {!compRunning&&compliance.length===0&&(
        <div style={{textAlign:"center",padding:"32px 20px"}}>
          <div style={{fontSize:44,marginBottom:12}}>{"\u{1F50D}"}</div>
          <div style={{color:"#64748b",marginBottom:20,fontSize:14}}>
            Scan against CFPB, state, and industry disclosure requirements
          </div>
          <Btn onClick={runCompliance}>Start Compliance Scan</Btn>
        </div>
      )}
      {(compRunning||compliance.length>0)&&(
        <div>
          <div style={{...CARD,marginBottom:14}}>
            {compliance.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<compliance.length-1?"1px solid #f1f5f9":"none"}}>
                <span style={{fontSize:14}}>{r.passed ? "\u2705" : "\u274C"}</span>
                <span style={{flex:1,fontSize:13,color:r.passed?"inherit":"#dc2626"}}>{r.label}</span>
                <span style={{fontSize:11,color:r.passed?"#22c55e":"#dc2626",fontWeight:700}}>{r.passed?"PASS":"FAIL"}</span>
              </div>
            ))}
            {compRunning&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}><span>{"\u23F3"}</span><span style={{fontSize:13,color:"#94a3b8"}}>Scanning{"\u2026"}</span></div>}
          </div>
          {compFailed&&(
            <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:12,marginBottom:18}}>
              <span style={{fontSize:22,flexShrink:0}}>{"\u26A0\uFE0F"}</span>
              <div>
                <div style={{fontWeight:700,color:"#dc2626",marginBottom:4}}>Compliance check failed</div>
                <div style={{fontSize:12,color:"#b91c1c",lineHeight:1.5}}>
                  Some required fields are missing. Go to <strong>Settings {"\u2192"} Profile</strong> to update your information, then re-run the compliance scan.
                </div>
              </div>
            </div>
          )}
          {compPassed&&(
            <>
              <div style={{background:"#dcfce7",border:"1px solid #86efac",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                <span style={{fontSize:26}}>{"\u{1F389}"}</span>
                <div>
                  <div style={{fontWeight:700,color:"#15803d"}}>All checks passed!</div>
                  <div style={{fontSize:13,color:"#16a34a"}}>Meets all requirements for {states.join(", ")}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <Btn onClick={generate} disabled={generating}>{generating?`\u23F3 Generating ${isPlaybook?"Playbook":"Flyers"}\u2026`:`Generate ${isPlaybook?"Playbook PDF":"Flyers"} \u2192`}</Btn>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const T_LABELS = ["Clean Modern","Luxury Gold","Bold Social"];

  const S7 = (
    <div>
      <SH n={isPlaybook?5:6} of={totalSteps}
        title={isPlaybook?"Your Playbook Is Ready!":"Your Flyers Are Ready!"}
        sub={isPlaybook?"Multi-page PDF \u2014 download or share":"3 unique designs \u2014 pick your favorite"} />

      {isPlaybook && playbookData ? (
        <>
          {/* Hidden offscreen render for PDF capture */}
          <div style={{position:"absolute",left:"-9999px",top:0,opacity:0,pointerEvents:"none"}}>
            <PlaybookPreview ref={playbookRef} playbookData={playbookData} profile={profile} partner={activePartner} cobrand={cobrand} accountType={acctType} selectedStates={states} assetId={asset} pexelsImages={pexelsImages}/>
          </div>

          {/* User-facing UI */}
          <div style={{textAlign:"center",padding:"28px 16px"}}>
            <div style={{fontSize:52,marginBottom:14}}>{playbookDownloaded?"\u2705":playbookDownloading?"\u23F3":"\u{1F4D6}"}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#0f172a",marginBottom:8}}>
              {playbookDownloaded?"PDF Downloaded!":playbookDownloading?"Generating PDF...":"Your Playbook Is Ready!"}
            </div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:24,lineHeight:1.6}}>
              {playbookDownloaded
                ?"Check your downloads folder. Click below to download again."
                :playbookDownloading
                  ?"Rendering pages... this may take a moment."
                  :`"${playbookData.title}" \u2014 ${pages.length + 1} pages`}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={downloadPlaybook} disabled={playbookDownloading} style={{...BTN_P,fontSize:14,padding:"12px 28px",opacity:playbookDownloading?.5:1}}>
                {playbookDownloading?"\u23F3 Generating...":playbookDownloaded?"\u2B07\uFE0F Download Again":"\u2B07\uFE0F Download PDF"}
              </button>
              <button onClick={goHome} style={{...BTN_S,fontSize:16,padding:"10px 14px"}}>{"\u{1F504}"}</button>
            </div>
          </div>
        </>
      ) : flyerData ? (
        <>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {T_LABELS.map((name,i)=>(
              <button key={i} onClick={()=>setActiveTpl(i)}
                style={{flex:1,padding:"8px 6px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,background:activeTpl===i?"#1e3a5f":"#f1f5f9",color:activeTpl===i?"white":"#334155",transition:"all .2s",fontFamily:"inherit"}}>
                {name}
              </button>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <FlyerCard ref={flyerRef} tIdx={activeTpl} flyerData={flyerData} property={property} profile={profile} partner={activePartner} cobrand={cobrand} accountType={acctType} selectedStates={states} formatId={format}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={downloadFlyer} style={{...BTN_P,flex:1,fontSize:13}}>{"\u2B07\uFE0F"} Download {FLYER_FORMATS.find(f=>f.id===format)?.label}</button>
            <button onClick={goHome} style={{...BTN_S,fontSize:16,padding:"10px 14px"}}>{"\u{1F504}"}</button>
          </div>
        </>
      ) : null}

      <div style={{textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:12}}>
        Compliance verified {"\u00B7"} {states.join(", ")} {"\u00B7"} {new Date().toLocaleDateString()}
      </div>
    </div>
  );

  // Steps: 0=splash 2=asset 3=property(flyer only) 4=cobrand 5=format+states 6=compliance 7=output
  const STEPS = { 0:S0, 2:S2, 3:S3, 4:S4, 5:S5, 6:S6, 7:S7 };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#f8fafc,#eff6ff 55%,#f8fafc)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`*{box-sizing:border-box}textarea,input{outline:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}`}</style>
      <div style={{width:"100%",maxWidth:500}}>
        {step>0&&(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:17}}>{"\u2726"}</span>
              <span style={{fontWeight:900,fontSize:17,letterSpacing:"-0.5px",fontFamily:"'Playfair Display',serif"}}>FlyrAI</span>
            </div>
            <div style={{display:"flex",gap:4}}>
              {Array.from({length:totalSteps}).map((_,i)=>(
                <div key={i} style={{height:4,borderRadius:2,width:displayStep===i+1?16:4,background:displayStep>=i+1?"#1e3a5f":"#cbd5e1",transition:"all .3s"}}/>
              ))}
            </div>
            {step>0&&step<7&&<button onClick={step===2?goHome:goBack} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:13,fontFamily:"inherit"}}>{step===2?"\u2190 Dashboard":"\u2190 Back"}</button>}
          </div>
        )}
        <div style={{background:"white",borderRadius:16,padding:step===0?"42px 28px":"24px 24px",boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
          {STEPS[step]||null}
        </div>
      </div>
    </div>
  );
}
