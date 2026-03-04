export const ASSET_TYPES = [
  { id:"listing",       label:"Listing Flyer",         icon:"\u{1F3E1}", category:"Flyer",    desc:"Active listing showcase" },
  { id:"openhouse",     label:"Open House",             icon:"\u{1F6AA}", category:"Flyer",    desc:"Drive foot traffic" },
  { id:"justsold",      label:"Just Sold",              icon:"\u{1F511}", category:"Flyer",    desc:"Celebrate a close" },
  { id:"ftb",           label:"First-Time Buyer Guide", icon:"\u{1F4D8}", category:"Playbook", desc:"State-specific multi-page guide" },
  { id:"buybeforesell", label:"Buy Before You Sell",    icon:"\u{1F504}", category:"Playbook", desc:"Bridge financing playbook" },
  { id:"investment",    label:"Investment Property",    icon:"\u{1F4C8}", category:"Playbook", desc:"Investor buyer's guide" },
  { id:"va",            label:"VA / FHA Buyer Guide",   icon:"\u{1F396}\uFE0F", category:"Playbook", desc:"Government loan programs" },
  { id:"rentvsbuy",     label:"Rent vs. Buy",           icon:"\u2696\uFE0F", category:"Playbook", desc:"Cost comparison guide" },
];

export const FLYER_FORMATS = [
  { id:"ig_post",  label:"Instagram Post",  dims:"1080\u00D71350", icon:"\u{1F4F8}", w:340, h:425 },
  { id:"ig_story", label:"Instagram Story", dims:"1080\u00D71920", icon:"\u{1F4F1}", w:252, h:448 },
  { id:"fb_post",  label:"Facebook Post",   dims:"1200\u00D71500", icon:"\u{1F465}", w:340, h:425 },
  { id:"linkedin", label:"LinkedIn",        dims:"1200\u00D7627",  icon:"\u{1F4BC}", w:340, h:178 },
  { id:"print",    label:"8.5\u00D711 Print", dims:"Letter PDF", icon:"\u{1F5A8}\uFE0F", w:280, h:362 },
];

export const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export const COMPLIANCE = {
  lo:["Full legal name","Individual NMLS ID","Company NMLS ID","Company name","Phone number","Equal Housing Opportunity","Not a commitment to lend disclaimer","State license disclosure"],
  realtor:["Full legal name","Brokerage name & logo","Phone number","Equal Housing Opportunity","State license number"],
};

export const fmt$ = (p) => { const n=parseInt(String(p||"0").replace(/\D/g,"")); return isNaN(n)?`$${p}`:`$${n.toLocaleString()}`; };
