// wire-dashboard.jsx — Dashboard variations (list, grid, path map)

const UNITS = [
  { n: 1, title: 'أساسيات الحروف', status: 'done', stars: 3, xp: 120 },
  { n: 2, title: 'الحركات والتنوين', status: 'done', stars: 3, xp: 120 },
  { n: 3, title: 'المفردات الأساسية', status: 'done', stars: 2, xp: 90 },
  { n: 4, title: 'نقطة التفتيش الأولى', status: 'checkpoint-done', stars: 3, xp: 200 },
  { n: 5, title: 'الجمل البسيطة', status: 'current', stars: 0, xp: 0 },
  { n: 6, title: 'الأزمنة والأفعال', status: 'locked' },
  { n: 7, title: 'النصوص القصيرة', status: 'locked' },
  { n: 8, title: 'الاختبار الشامل', status: 'checkpoint-locked' },
];

function StarsRow({ n, total = 3, size = 12 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <WireIcon.Star key={i} size={size} fill={i < n ? WIRE.accent3 : 'none'}/>
      ))}
    </div>
  );
}

// ---- DASHBOARD VARIANT A: LIST ----
function DashboardList({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: WIRE.ink3 }}>درس القراءة</div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: 20, fontWeight: 700 }}>الوحدات</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatPill icon="Fire" val="١٢" color={WIRE.accent}/>
          <StatPill icon="Coin" val="١٢٤٠" color={WIRE.accent3}/>
        </div>
      </div>
      {/* progress bar overall */}
      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: WIRE.ink3 }}>
          <span>التقدم الكلي</span>
          <span>٣ من ٨ وحدات</span>
        </div>
        <div style={{ height: 8, border: `1.5px solid ${WIRE.ink}`, background: WIRE.paperAlt, position: 'relative' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '37%', background: WIRE.accent }}/>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {UNITS.map(u => <UnitListRow key={u.n} u={u}/>)}
      </div>
      <WireBottomNav/>
    </PhoneShell>
  );
}

function UnitListRow({ u }) {
  const isCheckpoint = u.status.startsWith('checkpoint');
  const locked = u.status.includes('locked');
  const current = u.status === 'current';
  const done = u.status === 'done' || u.status === 'checkpoint-done';

  return (
    <div className="wire-box-rough" style={{
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      background: current ? WIRE.paperAlt : WIRE.paper,
      opacity: locked ? 0.55 : 1,
      borderStyle: isCheckpoint ? 'dashed' : 'solid',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: `1.5px solid ${WIRE.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? WIRE.accent : (isCheckpoint ? WIRE.accent3 : WIRE.paper),
        color: done || isCheckpoint ? 'white' : WIRE.ink,
        flexShrink: 0, fontFamily: 'Amiri, serif', fontWeight: 700,
      }}>
        {locked ? <WireIcon.Lock size={18}/> : done ? <WireIcon.Check size={20} color="white"/> : isCheckpoint ? <WireIcon.Flag size={18} color="white"/> : <span style={{ fontSize: 16 }}>{['٥','٦','٧','٨'][u.n-5]}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: WIRE.ink3 }}>الوحدة {['١','٢','٣','٤','٥','٦','٧','٨'][u.n-1]}</span>
          {isCheckpoint && <span className="wire-chip" style={{ fontSize: 9, padding: '1px 6px', background: WIRE.accent3, color: 'white' }}>نقطة تفتيش</span>}
          {current && <span className="wire-chip" style={{ fontSize: 9, padding: '1px 6px', background: WIRE.accent, color: 'white' }}>ابدأ الآن</span>}
        </div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 15, fontWeight: 700 }}>{u.title}</div>
        {done && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <StarsRow n={u.stars}/>
          <span style={{ fontSize: 10, color: WIRE.ink3 }}>+{u.xp} نقطة</span>
        </div>}
      </div>
    </div>
  );
}

// ---- DASHBOARD VARIANT B: GRID ----
function DashboardGrid({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '14px 18px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700 }}>القراءة</div>
          <div style={{ fontSize: 11, color: WIRE.ink3 }}>٣/٨ وحدة</div>
        </div>
        <div style={{ fontSize: 12, color: WIRE.ink3 }}>أكمل كل وحدة لفتح التالية</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {UNITS.map(u => <UnitGridTile key={u.n} u={u}/>)}
        </div>
      </div>
      <WireBottomNav/>
    </PhoneShell>
  );
}

function UnitGridTile({ u }) {
  const isCheckpoint = u.status.startsWith('checkpoint');
  const locked = u.status.includes('locked');
  const current = u.status === 'current';
  const done = u.status === 'done' || u.status === 'checkpoint-done';
  return (
    <div className="wire-box-rough" style={{
      padding: '14px 12px', minHeight: 130,
      background: current ? WIRE.accent : isCheckpoint && !locked ? WIRE.paperAlt : WIRE.paper,
      color: current ? 'white' : WIRE.ink,
      borderStyle: isCheckpoint ? 'dashed' : 'solid',
      opacity: locked ? 0.55 : 1,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 10, opacity: 0.75 }}>وحدة {u.n}</span>
        {locked ? <WireIcon.Lock size={16} color={current ? 'white' : WIRE.ink}/> :
          done ? <WireIcon.Check size={16} color={current ? 'white' : WIRE.ok}/> :
          isCheckpoint ? <WireIcon.Flag size={16}/> :
          <WireIcon.Sparkle size={14} color="white"/>}
      </div>
      <div style={{ fontFamily: 'Amiri, serif', fontSize: 15, fontWeight: 700, lineHeight: 1.2, flex: 1 }}>{u.title}</div>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {done ? <StarsRow n={u.stars}/> : <span style={{ fontSize: 10, opacity: 0.7 }}>{locked ? 'مقفل' : current ? 'ابدأ ←' : 'نقطة تفتيش'}</span>}
        {done && <span style={{ fontSize: 10, opacity: 0.7 }}>+{u.xp}</span>}
      </div>
    </div>
  );
}

// ---- DASHBOARD VARIANT C: PATH MAP (perjalanan) ----
function DashboardPath({ font }) {
  // zigzag positions (right-to-left because RTL, but path is decorative)
  const positions = [
    { x: 28, y: 20 },  { x: 68, y: 70 },  { x: 30, y: 120 }, { x: 70, y: 170 },
    { x: 30, y: 240 }, { x: 68, y: 290 }, { x: 30, y: 340 }, { x: 70, y: 400 },
  ];

  return (
    <PhoneShell font={font}>
      <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: 20, fontWeight: 700 }}>رحلة القراءة</div>
          <div style={{ fontSize: 11, color: WIRE.ink3 }}>الفصل الأول · ٨ وحدات</div>
        </div>
        <StatPill icon="Fire" val="١٢" color={WIRE.accent}/>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '10px 0 14px', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: 500, margin: '0 auto', maxWidth: 300 }}>
          {/* dashed path connecting the dots */}
          <svg width="100%" height="500" viewBox="0 0 300 500" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <path d="M56,40 Q150,20 210,90 Q240,140 60,140 Q-20,150 60,190 Q140,220 212,210 Q260,260 60,260 Q0,300 60,310 Q150,320 210,310 Q260,370 62,360 Q-10,410 62,420" stroke={WIRE.ink3} strokeWidth="1.8" strokeDasharray="3 5" fill="none"/>
          </svg>
          {UNITS.map((u, i) => {
            const p = positions[i];
            const isCheckpoint = u.status.startsWith('checkpoint');
            const locked = u.status.includes('locked');
            const current = u.status === 'current';
            const done = u.status === 'done' || u.status === 'checkpoint-done';
            return (
              <div key={u.n} style={{
                position: 'absolute',
                right: `${p.x}%`, top: p.y,
                width: 64, height: 64, marginRight: -32,
                borderRadius: '50%',
                border: `2px solid ${WIRE.ink}`,
                background: done ? WIRE.accent : current ? WIRE.paper : isCheckpoint ? WIRE.accent3 : WIRE.paper,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: locked ? 0.45 : 1,
                borderStyle: isCheckpoint ? 'dashed' : 'solid',
                boxShadow: current ? `0 0 0 4px ${WIRE.paper}, 0 0 0 5.5px ${WIRE.ink}` : 'none',
              }}>
                {locked ? <WireIcon.Lock size={22}/> :
                  done ? <WireIcon.Check size={26} color="white"/> :
                  isCheckpoint ? <WireIcon.Flag size={22} color="white"/> :
                  <span style={{ fontFamily: 'Amiri, serif', fontWeight: 700, fontSize: 20 }}>{['١','٢','٣','٤','٥','٦','٧','٨'][u.n-1]}</span>}

                {/* label */}
                <div style={{
                  position: 'absolute', top: '100%', marginTop: 4, width: 110,
                  textAlign: 'center', fontSize: 10,
                  fontFamily: 'Amiri, serif', fontWeight: 700,
                  left: '50%', transform: 'translateX(-50%)',
                }}>{u.title}</div>

                {current && <div style={{
                  position: 'absolute', top: -28,
                  background: WIRE.ink, color: WIRE.paper, fontSize: 9,
                  padding: '2px 7px', borderRadius: 2, whiteSpace: 'nowrap',
                }}>أنت هنا</div>}
              </div>
            );
          })}
        </div>
      </div>
      <WireBottomNav/>
    </PhoneShell>
  );
}

function StatPill({ icon, val, color }) {
  const Icon = WireIcon[icon];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: `1.5px solid ${WIRE.ink}`, padding: '3px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
      <Icon size={14} color={color}/>{val}
    </div>
  );
}

Object.assign(window, { DashboardList, DashboardGrid, DashboardPath, StatPill, StarsRow });
