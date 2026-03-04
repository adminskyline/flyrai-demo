import HOUSE_SVGS from "../data/houseSvgs";

export default function HouseScene({ variant=0, width, height }) {
  const idx = variant % HOUSE_SVGS.length;
  const svg = HOUSE_SVGS[idx];
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return (
    <div style={{ width, height, overflow:"hidden", position:"relative", flexShrink:0 }}>
      <img
        src={`data:image/svg+xml;base64,${b64}`}
        alt="property"
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
      />
    </div>
  );
}
