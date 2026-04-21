// wire-primitives.jsx — shared sketchy wireframe primitives (RTL Arabic)
// Theme, fonts, basic shapes, icons. Hand-drawn vibe.

const WIRE = {
  ink: '#1a1a1a',
  ink2: '#3a3a3a',
  ink3: '#6b6b6b',
  paper: '#faf7f2',
  paperAlt: '#f3efe7',
  rule: '#1a1a1a',
  accent: '#d97757',    // warm clay — for CTA/primary
  accent2: '#4a7fb8',   // muted ink blue
  accent3: '#c4a35a',   // dull gold (badges)
  ok: '#5a8a5a',
  bad: '#b55040',
  hatch: 'rgba(26,26,26,0.08)',
};

// Google Fonts injection (once)
if (typeof document !== 'undefined' && !document.getElementById('wire-fonts')) {
  const link = document.createElement('link');
  link.id = 'wire-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Reem+Kufi:wght@400;500;600;700&family=Lateef:wght@400;700&family=Caveat:wght@400;500;600;700&family=Gloria+Hallelujah&family=Kalam:wght@300;400;700&display=swap';
  document.head.appendChild(link);
}

// Inject sketchy CSS
if (typeof document !== 'undefined' && !document.getElementById('wire-styles')) {
  const s = document.createElement('style');
  s.id = 'wire-styles';
  s.textContent = `
    .wire-root, .wire-root * { box-sizing: border-box; }
    .wire-root { direction: rtl; font-family: 'Reem Kufi', 'Kalam', sans-serif; color: ${WIRE.ink}; }
    .wire-root.font-amiri { font-family: 'Amiri', serif; }
    .wire-root.font-reem { font-family: 'Reem Kufi', sans-serif; }
    .wire-root.font-lateef { font-family: 'Lateef', serif; }
    .wire-hand { font-family: 'Caveat', 'Kalam', cursive; }
    .wire-hand-en { font-family: 'Gloria Hallelujah', 'Caveat', cursive; }
    .wire-box { border: 1.5px solid ${WIRE.ink}; background: ${WIRE.paper}; position: relative; }
    .wire-box-rough { border: 1.5px solid ${WIRE.ink}; background: ${WIRE.paper}; position: relative; border-radius: 3px 8px 4px 10px / 8px 3px 10px 4px; }
    .wire-btn { border: 1.5px solid ${WIRE.ink}; background: ${WIRE.paper}; padding: 10px 16px; font-family: inherit; font-size: 15px; cursor: pointer; border-radius: 4px 9px 5px 10px / 9px 4px 10px 5px; }
    .wire-btn-primary { background: ${WIRE.ink}; color: ${WIRE.paper}; }
    .wire-btn-accent { background: ${WIRE.accent}; color: white; border-color: ${WIRE.ink}; }
    .wire-hatch { background-image: repeating-linear-gradient(45deg, ${WIRE.hatch} 0 2px, transparent 2px 8px); }
    .wire-dotted { border: 1.5px dashed ${WIRE.ink}; }
    .wire-placeholder-img {
      background-image: repeating-linear-gradient(135deg, ${WIRE.ink} 0 1px, transparent 1px 10px);
      border: 1.5px solid ${WIRE.ink}; display: flex; align-items: center; justify-content: center;
      color: ${WIRE.ink2}; font-family: 'Courier New', monospace; font-size: 10px;
    }
    .wire-input { border: none; border-bottom: 1.5px solid ${WIRE.ink}; background: transparent; padding: 8px 0; font-family: inherit; font-size: 15px; width: 100%; outline: none; direction: rtl; text-align: right; }
    .wire-chip { border: 1.5px solid ${WIRE.ink}; padding: 4px 10px; border-radius: 100px; font-size: 12px; display: inline-block; background: ${WIRE.paper}; }
    .wire-scribble::after {
      content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 3px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 4' preserveAspectRatio='none'%3E%3Cpath d='M0,2 Q10,0 20,2 T40,2 T60,2 T80,2 T100,2' stroke='${encodeURIComponent(WIRE.accent)}' stroke-width='2' fill='none'/%3E%3C/svg%3E") repeat-x;
      background-size: 60px 4px;
    }
  `;
  document.head.appendChild(s);
}

// Sketchy underline squiggle as SVG
function Squiggle({ color = WIRE.accent, width = 80, height = 6 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 6" style={{ display: 'block' }}>
      <path d="M1,3 Q8,0 15,3 T30,3 T45,3 T60,3 T79,3" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// Rough rectangle — hand-drawn feel using SVG path
function RoughRect({ w, h, fill = 'transparent', stroke = WIRE.ink, sw = 1.6, rx = 6, style }) {
  const jitter = (n) => n + (Math.random() - 0.5) * 0.8;
  // deterministic-ish wobble
  const d = `M${rx},2 L${w-rx},1.5 Q${w-1},2 ${w-1.5},${rx} L${w-1},${h-rx} Q${w-1.5},${h-1} ${w-rx},${h-1.5} L${rx},${h-1} Q1,${h-1.5} 1.5,${h-rx} L2,${rx} Q1.5,1.5 ${rx},2 Z`;
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
    </svg>
  );
}

// Icon set — simple sketchy line icons relevant to Arabic study
const WireIcon = {
  Book: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6 Q4 5 5 5 L13 5.5 Q14 6 14 7 L14 22 Q14 21 13 20.5 L5 20 Q4 20 4 21 Z"/>
      <path d="M24 6 Q24 5 23 5 L15 5.5 Q14 6 14 7 L14 22 Q14 21 15 20.5 L23 20 Q24 20 24 21 Z"/>
      <path d="M7 9 L11 9.2 M7 12 L11 12.2 M17 9 L21 9.2 M17 12 L21 12.2"/>
    </svg>
  ),
  Quill: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4 Q20 10 14 16 L10 20 L8 22 L12 18 Q18 12 24 6 Z"/>
      <path d="M10 20 L6 24"/>
      <path d="M14 16 L17 19"/>
    </svg>
  ),
  Mic: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10.5" y="4" width="7" height="14" rx="3.5"/>
      <path d="M6 14 Q6 22 14 22 Q22 22 22 14"/>
      <path d="M14 22 L14 26 M10 26 L18 26"/>
    </svg>
  ),
  Star: ({ size = 28, color = WIRE.ink, fill = 'none' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill={fill} stroke={color} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M14 3 L17 10 L25 11 L19 16 L21 24 L14 20 L7 24 L9 16 L3 11 L11 10 Z"/>
    </svg>
  ),
  Trophy: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4 L20 4 L20 10 Q20 16 14 16 Q8 16 8 10 Z"/>
      <path d="M8 6 Q4 6 4 9 Q4 12 8 13"/>
      <path d="M20 6 Q24 6 24 9 Q24 12 20 13"/>
      <path d="M11 16 L11 20 L17 20 L17 16"/>
      <path d="M9 20 L19 20 L19 23 L9 23 Z"/>
    </svg>
  ),
  Lock: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="12" width="18" height="12" rx="2"/>
      <path d="M9 12 L9 8 Q9 4 14 4 Q19 4 19 8 L19 12"/>
      <circle cx="14" cy="18" r="1.5"/>
    </svg>
  ),
  Check: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14 L11 20 L23 7"/>
    </svg>
  ),
  Cross: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6 L22 22 M22 6 L6 22"/>
    </svg>
  ),
  Heart: ({ size = 28, color = WIRE.ink, fill = 'none' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill={fill} stroke={color} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M14 23 Q4 17 4 10 Q4 5 9 5 Q12 5 14 8 Q16 5 19 5 Q24 5 24 10 Q24 17 14 23 Z"/>
    </svg>
  ),
  Fire: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 24 Q5 22 6 14 Q7 10 10 8 Q9 12 12 13 Q11 7 16 3 Q15 9 19 12 Q23 15 22 19 Q21 23 14 24 Z"/>
    </svg>
  ),
  Coin: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6">
      <ellipse cx="14" cy="14" rx="10" ry="9.5"/>
      <ellipse cx="14" cy="14" rx="7" ry="7"/>
      <path d="M11 14 L17 14" strokeLinecap="round"/>
    </svg>
  ),
  User: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="14" cy="10" r="5"/>
      <path d="M4 24 Q4 16 14 16 Q24 16 24 24"/>
    </svg>
  ),
  Home: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 13 L14 4 L24 13 L24 23 L4 23 Z"/>
      <path d="M11 23 L11 16 L17 16 L17 23"/>
    </svg>
  ),
  Medal: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M9 3 L12 12 M19 3 L16 12 M9 3 L19 3"/>
      <circle cx="14" cy="18" r="6"/>
      <path d="M11 17 L13 19 L17 15"/>
    </svg>
  ),
  Flag: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 24 L6 4 L20 4 L16 9 L20 14 L6 14"/>
    </svg>
  ),
  Sparkle: ({ size = 20, color = WIRE.accent }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <path d="M10 2 L10 8 M10 12 L10 18 M2 10 L8 10 M12 10 L18 10"/>
    </svg>
  ),
  Scroll: ({ size = 28, color = WIRE.ink }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5 Q5 3 7 3 L21 3 Q23 3 23 5 L23 22 Q23 24 21 24 L7 24 Q5 24 5 22 Z"/>
      <path d="M8 8 L20 8 M8 12 L20 12 M8 16 L17 16"/>
    </svg>
  ),
};

// Placeholder image box
function Placeholder({ w = '100%', h = 100, label = 'ilustrasi', style }) {
  return (
    <div className="wire-placeholder-img" style={{ width: w, height: h, ...style }}>
      {label}
    </div>
  );
}

// Sketchy status bar for phone
function WirePhoneStatusBar() {
  return (
    <div style={{
      height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px', fontSize: 12, fontFamily: 'Reem Kufi, sans-serif', color: WIRE.ink,
      direction: 'ltr',
    }}>
      <span style={{ fontWeight: 600 }}>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M1 8 L1 6 M4 8 L4 4 M7 8 L7 2 M10 8 L10 1" stroke={WIRE.ink} strokeWidth="1.2" strokeLinecap="round"/></svg>
        <svg width="18" height="10" viewBox="0 0 18 10"><rect x="1" y="2" width="14" height="6" rx="1.5" stroke={WIRE.ink} strokeWidth="1" fill="none"/><rect x="2.5" y="3.5" width="10" height="3" fill={WIRE.ink}/><rect x="15.5" y="4" width="1.5" height="2" fill={WIRE.ink}/></svg>
      </span>
    </div>
  );
}

// Basic phone frame (used inside artboards, no device chrome overhead)
function PhoneShell({ children, bg = WIRE.paper, showStatus = true, font }) {
  return (
    <div className={`wire-root ${font || ''}`} style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {showStatus && <WirePhoneStatusBar />}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// RTL page header
function PageHeader({ title, back = true, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: `1.5px solid ${WIRE.ink}`,
    }}>
      {back ? (
        <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* RTL back = right arrow */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={WIRE.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4 L13 9 L7 14"/>
          </svg>
        </div>
      ) : <div style={{ width: 28 }}/>}
      <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      <div style={{ width: 28, height: 28 }}>{right}</div>
    </div>
  );
}

Object.assign(window, { WIRE, Squiggle, RoughRect, WireIcon, Placeholder, WirePhoneStatusBar, PhoneShell, PageHeader });
