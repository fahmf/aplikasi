// hifi-core.jsx — hi-fi theme + shared components

const HF = {
  // Emerald green (Islamic tradition) + warm cream
  primary: '#0d6e5e',       // deep emerald
  primaryDark: '#074a40',
  primaryLight: '#1a9d85',
  accent: '#f5a623',        // warm gold
  accentLight: '#ffd166',
  cream: '#fefaf0',
  paper: '#ffffff',
  paperAlt: '#f7f3ea',
  ink: '#1a2e28',
  ink2: '#4a5c56',
  ink3: '#8a9a94',
  rose: '#e06a6a',
  sky: '#4a90c2',
  purple: '#8b5cf6',
  border: '#e5dfd2',
  shadow: '0 8px 24px rgba(13, 110, 94, 0.08), 0 2px 6px rgba(0,0,0,0.04)',
  shadowStrong: '0 16px 40px rgba(13, 110, 94, 0.18)',
};

// Fonts
if (typeof document !== 'undefined' && !document.getElementById('hf-fonts')) {
  const l = document.createElement('link');
  l.id = 'hf-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Amiri:wght@400;700&family=Reem+Kufi:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(l);
}
if (typeof document !== 'undefined' && !document.getElementById('hf-styles')) {
  const s = document.createElement('style'); s.id = 'hf-styles';
  s.textContent = `
    .hf, .hf * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    .hf { direction: rtl; font-family: 'Cairo', system-ui, sans-serif; color: ${HF.ink}; }
    .hf-display { font-family: 'Amiri', serif; }
    .hf-kufi { font-family: 'Reem Kufi', sans-serif; }
    .hf-btn { border: none; border-radius: 16px; padding: 14px 20px; font-family: inherit; font-weight: 700; font-size: 15px; cursor: pointer; transition: transform .15s, box-shadow .15s; }
    .hf-btn-primary { background: ${HF.primary}; color: white; box-shadow: 0 4px 14px rgba(13,110,94,0.35); }
    .hf-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(13,110,94,0.45); }
    .hf-btn-ghost { background: white; color: ${HF.primary}; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .hf-card { background: white; border-radius: 20px; box-shadow: ${HF.shadow}; }
    .hf-pattern-bg {
      background-color: ${HF.primary};
      background-image:
        radial-gradient(circle at 0 0, rgba(255,255,255,0.08) 8px, transparent 9px),
        radial-gradient(circle at 40px 40px, rgba(255,255,255,0.08) 8px, transparent 9px);
      background-size: 80px 80px;
    }
  `;
  document.head.appendChild(s);
}

// Islamic geometric pattern (8-pointed star tile) as decorative SVG overlay
function IslamicPattern({ color = 'rgba(255,255,255,0.08)', size = 60 }) {
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="ipat" width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={`M${size/2} 4 L${size/2+10} ${size/2-10} L${size-4} ${size/2} L${size/2+10} ${size/2+10} L${size/2} ${size-4} L${size/2-10} ${size/2+10} L4 ${size/2} L${size/2-10} ${size/2-10} Z`} fill="none" stroke={color} strokeWidth="1"/>
          <circle cx={size/2} cy={size/2} r={size/4} fill="none" stroke={color} strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ipat)"/>
    </svg>
  );
}

// Phone shell for hi-fi
function HFPhone({ children, bg = HF.cream }) {
  return (
    <div className="hf" style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
    }}>
      {/* status bar */}
      <div style={{
        height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px 0 18px', fontSize: 13, fontWeight: 600, direction: 'ltr', color: HF.ink,
        flexShrink: 0,
      }}>
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="16" height="11" viewBox="0 0 16 11"><path d="M1 9v-1 M5 9v-3 M9 9v-5 M13 9v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="1" y="1.5" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1"/><rect x="2.5" y="3" width="14" height="5" rx="0.5" fill="currentColor"/><rect x="20" y="4" width="1.5" height="3" rx="0.5" fill="currentColor"/></svg>
        </span>
      </div>
      {children}
    </div>
  );
}

// Hi-fi icon set (filled + stroke)
const HFIcon = {
  Book: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 4h6a2 2 0 012 2v14a2 2 0 00-2-2H4V4z" fill={color} opacity=".85"/><path d="M20 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6V4z" fill={color}/></svg>
  ),
  Quill: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 3c-3 6-9 11-14 14l-3 4 4-3c3-5 8-11 14-14z" fill={color} fillOpacity=".2"/><path d="M7 17l-4 4"/></svg>
  ),
  Scroll: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" fill={color} fillOpacity=".15"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
  ),
  Trophy: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M7 3h10v5a5 5 0 01-10 0V3z"/><path d="M4 5h3v3a2 2 0 01-3 0V5zM17 5h3v3a2 2 0 01-3 0V5z" fillOpacity=".6"/><rect x="9" y="13" width="6" height="4" rx="1"/><rect x="7" y="17" width="10" height="3" rx="1.5"/></svg>
  ),
  Flame: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2c0 5-5 6-5 11a5 5 0 0010 0c0-3-2-4-2-7 0-2 1-3 1-4-1 0-4 0-4 0z"/></svg>
  ),
  Coin: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="7" fill="none" stroke="white" strokeWidth="1.5" opacity=".5"/><path d="M10 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  Heart: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/></svg>
  ),
  Star: ({ size = 24, color = 'currentColor', fill = true }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth="2" strokeLinejoin="round"><path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/></svg>
  ),
  Lock: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth="2.5" fill="none"/></svg>
  ),
  Check: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6 10-12"/></svg>
  ),
  Flag: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M5 2v20" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M5 3h12l-3 4 3 4H5V3z"/></svg>
  ),
  Home: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M3 11L12 3l9 8v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V11z"/></svg>
  ),
  User: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="8" r="5"/><path d="M3 22c0-6 4-9 9-9s9 3 9 9"/></svg>
  ),
  Medal: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 2l4 8 4-8h-2l-2 4-2-4H8z" opacity=".7"/><circle cx="12" cy="16" r="6"/><path d="M10 16l1.5 1.5L14 14" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  X: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg>
  ),
  Back: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
  ),
  Sparkle: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>
  ),
  Play: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M7 4l14 8-14 8V4z"/></svg>
  ),
  Target: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>
  ),
};

// Tab bar
function HFTabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: 'Home' },
    { id: 'leader', label: 'المتصدرون', icon: 'Trophy' },
    { id: 'achieve', label: 'الإنجازات', icon: 'Medal' },
    { id: 'profile', label: 'حسابي', icon: 'User' },
  ];
  return (
    <div style={{
      background: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: '10px 8px 14px', display: 'flex', justifyContent: 'space-around',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.06)', flexShrink: 0,
    }}>
      {tabs.map(t => {
        const Icon = HFIcon[t.icon];
        const on = t.id === active;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 10px',
            background: on ? `${HF.primary}15` : 'transparent', borderRadius: 12 }}>
            <Icon size={22} color={on ? HF.primary : HF.ink3}/>
            <span style={{ fontSize: 10, fontWeight: 700, color: on ? HF.primary : HF.ink3 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { HF, IslamicPattern, HFPhone, HFIcon, HFTabBar });
