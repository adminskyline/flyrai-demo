const HOUSE_SVGS = [
  // Modern ranch with pool
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="sky0" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bfd9f0"/><stop offset="100%" stop-color="#e8f4fd"/>
      </linearGradient>
      <linearGradient id="lawn0" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#7ab648"/><stop offset="100%" stop-color="#5a8f32"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#sky0)"/>
    <ellipse cx="650" cy="80" rx="60" ry="40" fill="white" opacity=".9"/>
    <ellipse cx="700" cy="70" rx="80" ry="50" fill="white" opacity=".9"/>
    <ellipse cx="740" cy="85" rx="55" ry="35" fill="white" opacity=".8"/>
    <rect x="0" y="320" width="800" height="180" fill="url(#lawn0)"/>
    <rect x="50" y="200" width="500" height="160" fill="#f0ece4" rx="3"/>
    <rect x="50" y="185" width="500" height="25" fill="#2d3e50" rx="2"/>
    <rect x="50" y="185" width="500" height="8" fill="#3d5268"/>
    <rect x="80" y="220" width="120" height="100" fill="#d4c5b0"/>
    <rect x="90" y="230" width="45" height="50" fill="#7db8d8" opacity=".85"/>
    <rect x="145" y="230" width="45" height="50" fill="#7db8d8" opacity=".85"/>
    <rect x="90" y="290" width="100" height="30" fill="#b8a898"/>
    <rect x="245" y="220" width="160" height="140" fill="#e8e0d4"/>
    <rect x="255" y="235" width="60" height="70" fill="#7db8d8" opacity=".8"/>
    <rect offset="0" x="325" y="235" width="60" height="70" fill="#7db8d8" opacity=".8"/>
    <rect x="255" y="315" width="60" height="45" fill="#c8b8a8"/>
    <rect x="420" y="220" width="110" height="140" fill="#e0d8cc"/>
    <rect x="430" y="235" width="90" height="60" fill="#7db8d8" opacity=".75"/>
    <rect x="550" y="200" width="180" height="160" fill="#ddd5c8" rx="3"/>
    <rect x="550" y="188" width="180" height="20" fill="#3d5268"/>
    <rect x="570" y="220" width="70" height="80" fill="#7db8d8" opacity=".8"/>
    <rect x="650" y="220" width="60" height="80" fill="#7db8d8" opacity=".75"/>
    <rect x="600" y="308" width="50" height="52" fill="#b8a898"/>
    <rect x="100" y="360" width="200" height="20" fill="#5a9fd4" opacity=".4" rx="4"/>
    <rect x="100" y="360" width="200" height="20" fill="none" stroke="#4a8fc4" stroke-width="1" rx="4"/>
    <rect x="0" y="320" width="800" height="12" fill="#6a9f3a"/>
    <rect x="320" y="295" width="8" height="40" fill="#5a3a1a"/>
    <ellipse cx="324" cy="280" rx="22" ry="28" fill="#4a8a2a"/>
    <rect x="450" y="280" width="8" height="50" fill="#5a3a1a"/>
    <ellipse cx="454" cy="262" rx="28" ry="32" fill="#3a7a1a"/>
    <rect x="680" y="270" width="8" height="60" fill="#5a3a1a"/>
    <ellipse cx="684" cy="252" rx="24" ry="30" fill="#4a8a2a"/>
  </svg>`,

  // Colonial two-story
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="sky1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f4a460" stop-opacity=".4"/><stop offset="60%" stop-color="#ffe4b5" stop-opacity=".3"/><stop offset="100%" stop-color="#ffefd5" stop-opacity=".1"/>
      </linearGradient>
      <linearGradient id="dusk1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1a1a3e"/><stop offset="100%" stop-color="#2d4a7a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#dusk1)"/>
    <rect width="800" height="500" fill="url(#sky1)"/>
    <circle cx="680" cy="80" r="4" fill="white" opacity=".8"/>
    <circle cx="720" cy="50" r="3" fill="white" opacity=".7"/>
    <circle cx="60" cy="60" r="3" fill="white" opacity=".9"/>
    <circle cx="140" cy="40" r="2" fill="white" opacity=".6"/>
    <circle cx="400" cy="30" r="2" fill="white" opacity=".7"/>
    <rect x="0" y="370" width="800" height="130" fill="#1a2e1a"/>
    <rect x="150" y="140" width="480" height="240" fill="#e8ddd0"/>
    <polygon points="120,140 680,140 660,90 140,90" fill="#8b2020"/>
    <polygon points="140,90 660,90 640,50 160,50" fill="#6b1818"/>
    <rect x="160" y="155" width="80" height="90" fill="#3a5a8a" opacity=".9"/>
    <rect x="250" y="155" width="80" height="90" fill="#3a5a8a" opacity=".85"/>
    <rect x="456" y="155" width="80" height="90" fill="#3a5a8a" opacity=".85"/>
    <rect x="546" y="155" width="80" height="90" fill="#3a5a8a" opacity=".9"/>
    <rect x="335" y="155" width="110" height="225" fill="#d4c8b8"/>
    <rect x="355" y="175" width="30" height="60" fill="#2a4a7a" opacity=".9"/>
    <rect x="395" y="175" width="30" height="60" fill="#2a4a7a" opacity=".9"/>
    <rect x="355" y="295" width="70" height="85" fill="#c4b8a8"/>
    <rect x="370" y="330" width="40" height="50" fill="#1a1a3a" opacity=".8"/>
    <rect x="160" y="260" width="80" height="90" fill="#3a5a8a" opacity=".7"/>
    <rect x="250" y="260" width="80" height="90" fill="#3a5a8a" opacity=".65"/>
    <rect x="456" y="260" width="80" height="90" fill="#3a5a8a" opacity=".65"/>
    <rect x="546" y="260" width="80" height="90" fill="#3a5a8a" opacity=".7"/>
    <rect x="150" y="378" width="480" height="8" fill="#c8b89a"/>
    <rect x="130" y="370" width="8" height="120" fill="#c8b89a"/>
    <rect x="178" y="370" width="8" height="120" fill="#c8b89a"/>
    <rect x="600" y="370" width="8" height="120" fill="#c8b89a"/>
    <rect x="648" y="370" width="8" height="120" fill="#c8b89a"/>
    <rect x="0" y="370" width="800" height="10" fill="#2a3e2a"/>
    <rect x="350" y="375" width="100" height="10" fill="#8a7a6a"/>
    <rect x="60" y="340" width="6" height="40" fill="#4a3010"/>
    <ellipse cx="63" cy="328" rx="20" ry="24" fill="#2a5a1a" opacity=".9"/>
    <rect x="730" y="320" width="6" height="50" fill="#4a3010"/>
    <ellipse cx="733" cy="306" rx="22" ry="26" fill="#2a5a1a" opacity=".8"/>
  </svg>`,

  // Contemporary with large windows - night
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="sky2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a0a1e"/><stop offset="100%" stop-color="#1a1a40"/>
      </linearGradient>
      <linearGradient id="glow2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f5d06a" stop-opacity=".6"/><stop offset="100%" stop-color="#f5d06a" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#sky2)"/>
    <circle cx="100" cy="60" r="3" fill="white" opacity=".9"/>
    <circle cx="200" cy="30" r="2" fill="white" opacity=".7"/>
    <circle cx="350" cy="45" r="2" fill="white" opacity=".8"/>
    <circle cx="500" cy="25" r="3" fill="white" opacity=".6"/>
    <circle cx="650" cy="55" r="2" fill="white" opacity=".9"/>
    <circle cx="750" cy="35" r="2" fill="white" opacity=".7"/>
    <circle cx="580" cy="85" r="1.5" fill="white" opacity=".8"/>
    <circle cx="420" cy="70" r="1.5" fill="white" opacity=".6"/>
    <rect x="0" y="380" width="800" height="120" fill="#0d1a0d"/>
    <rect x="80" y="200" width="640" height="200" fill="#1e2a3a"/>
    <rect x="80" y="185" width="640" height="20" fill="#141e2e"/>
    <rect x="80" y="160" width="280" height="45" fill="#141e2e"/>
    <rect x="80" y="148" width="280" height="16" fill="#0e161e"/>
    <rect x="100" y="210" width="120" height="90" fill="#f5d06a" opacity=".9"/>
    <rect x="100" y="210" width="120" height="90" fill="url(#glow2)"/>
    <rect x="108" y="218" width="52" height="82" fill="#fde890" opacity=".8"/>
    <rect x="162" y="218" width="50" height="82" fill="#fdd870" opacity=".75"/>
    <rect x="240" y="210" width="100" height="90" fill="#f5d06a" opacity=".85"/>
    <rect x="248" y="218" width="84" height="82" fill="#fde88a" opacity=".75"/>
    <rect x="380" y="210" width="160" height="180" fill="#1a2434"/>
    <rect x="395" y="220" width="130" height="80" fill="#f5d06a" opacity=".9"/>
    <rect x="403" y="228" width="57" height="72" fill="#fde890" opacity=".8"/>
    <rect x="462" y="228" width="55" height="72" fill="#fdd870" opacity=".75"/>
    <rect x="395" y="315" width="60" height="75" fill="#c8b89a"/>
    <rect x="415" y="345" width="35" height="45" fill="#0a1020" opacity=".9"/>
    <rect x="560" y="210" width="140" height="170" fill="#18222e"/>
    <rect x="572" y="222" width="116" height="80" fill="#f0c860" opacity=".8"/>
    <rect x="580" y="230" width="50" height="72" fill="#fce880" opacity=".7"/>
    <rect x="632" y="230" width="48" height="72" fill="#f8d870" opacity=".65"/>
    <rect x="80" y="380" width="640" height="8" fill="#141e2e"/>
    <rect x="300" y="385" width="200" height="8" fill="#2a3040"/>
    <ellipse cx="250" cy="500" rx="200" ry="80" fill="#f5d06a" opacity=".04"/>
    <ellipse cx="540" cy="500" rx="180" ry="70" fill="#f5d06a" opacity=".04"/>
    <rect x="0" y="380" width="800" height="10" fill="#162016"/>
  </svg>`,

  // Mediterranean / stucco
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="sky3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#87ceeb"/><stop offset="100%" stop-color="#e0f4ff"/>
      </linearGradient>
      <linearGradient id="lawn3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#5a9e2f"/><stop offset="100%" stop-color="#3d7820"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#sky3)"/>
    <ellipse cx="160" cy="90" rx="90" ry="55" fill="white" opacity=".85"/>
    <ellipse cx="220" cy="75" rx="100" ry="65" fill="white" opacity=".9"/>
    <ellipse cx="580" cy="100" rx="70" ry="45" fill="white" opacity=".8"/>
    <ellipse cx="640" cy="85" rx="90" ry="55" fill="white" opacity=".85"/>
    <rect x="0" y="340" width="800" height="160" fill="url(#lawn3)"/>
    <rect x="100" y="180" width="600" height="180" fill="#f2e8d8"/>
    <polygon points="70,180 730,180 710,120 90,120" fill="#c84820"/>
    <polygon points="90,120 710,120 695,80 105,80" fill="#a83818"/>
    <rect x="70" y="165" width="660" height="20" fill="#e8d8c0"/>
    <rect x="130" y="195" width="100" height="120" fill="#e0d0b8"/>
    <rect x="148" y="208" width="35" height="55" fill="#6aaccc" opacity=".8"/>
    <rect x="190" y="208" width="30" height="55" fill="#6aaccc" opacity=".75"/>
    <rect x="130" y="272" width="100" height="48" fill="#c8b8a0"/>
    <rect x="252" y="195" width="140" height="165" fill="#ead8c0"/>
    <rect x="272" y="215" width="50" height="65" fill="#6aaccc" opacity=".8"/>
    <rect x="334" y="215" width="48" height="65" fill="#6aaccc" opacity=".75"/>
    <rect x="272" y="305" width="55" height="55" fill="#b8a890"/>
    <rect x="298" y="330" width="30" height="30" fill="#c84820" opacity=".6"/>
    <rect x="404" y="195" width="140" height="165" fill="#ecd8be"/>
    <rect x="414" y="215" width="50" height="65" fill="#6aaccc" opacity=".78"/>
    <rect x="476" y="215" width="48" height="65" fill="#6aaccc" opacity=".72"/>
    <rect x="414" y="305" width="55" height="55" fill="#b4a488"/>
    <rect x="440" y="330" width="30" height="30" fill="#c84820" opacity=".6"/>
    <rect x="556" y="195" width="110" height="165" fill="#e8d4b8"/>
    <rect x="568" y="215" width="40" height="55" fill="#6aaccc" opacity=".76"/>
    <rect x="614" y="215" width="38" height="55" fill="#6aaccc" opacity=".70"/>
    <rect x="556" y="300" width="110" height="60" fill="#c0b098"/>
    <rect x="0" y="340" width="800" height="10" fill="#4a8a22"/>
    <rect x="50" y="300" width="6" height="55" fill="#7a5830"/>
    <ellipse cx="53" cy="285" rx="18" ry="26" fill="#2a7a18"/>
    <rect x="748" y="295" width="6" height="55" fill="#7a5830"/>
    <ellipse cx="751" cy="280" rx="16" ry="22" fill="#2a7a18"/>
    <ellipse cx="180" cy="260" rx="12" ry="18" fill="#4a9a28" opacity=".8"/>
    <ellipse cx="620" cy="255" rx="12" ry="18" fill="#4a9a28" opacity=".8"/>
    <rect x="340" y="350" width="120" height="10" fill="#d4c4a0"/>
  </svg>`,
];

export default HOUSE_SVGS;
