// wire-social.jsx — Checkpoint, Leaderboard variations, Profile

// ============ CHECKPOINT INTRO ============
function ScreenCheckpointIntro({ font }) {
  return (
    <PhoneShell font={font} bg={WIRE.ink}>
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', color: WIRE.paper }}>
        <WireIcon.Cross size={20} color={WIRE.paper}/>
        <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.7 }}>نقطة تفتيش · ٤</div>
        <div style={{ width: 20 }}/>
      </div>
      <div style={{ flex: 1, padding: '24px 24px', color: WIRE.paper, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 180, height: 180, border: `2px dashed ${WIRE.paper}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, position: 'relative' }}>
          <WireIcon.Flag size={80} color={WIRE.paper}/>
          <div style={{ position: 'absolute', top: 8, right: 20 }}><WireIcon.Sparkle size={18} color={WIRE.accent}/></div>
          <div style={{ position: 'absolute', bottom: 20, left: 8 }}><WireIcon.Sparkle size={14} color={WIRE.accent3}/></div>
        </div>

        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>الاختبار الشامل</div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 28, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
          نقطة التفتيش
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, textAlign: 'center', lineHeight: 1.7, marginBottom: 20 }}>
          حان وقت اختبار ما تعلمته!<br/>
          ٢٠ سؤالاً شاملاً للوحدات ١-٤
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
          <DarkChip label="٢٠ سؤال"/>
          <DarkChip label="١٥ دقيقة"/>
          <DarkChip label="٧٠٪ للنجاح"/>
        </div>

        <div style={{ flex: 1 }}/>
        <button className="wire-btn" style={{ width: '100%', background: WIRE.accent, color: WIRE.paper, borderColor: WIRE.paper, fontSize: 17, fontWeight: 600, padding: '14px' }}>
          تحدّى نفسك
        </button>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 10 }}>راجع الوحدات السابقة</div>
      </div>
    </PhoneShell>
  );
}

function DarkChip({ label }) {
  return <div style={{ border: `1.5px solid ${WIRE.paper}`, padding: '5px 12px', borderRadius: 100, fontSize: 11, opacity: 0.85 }}>{label}</div>;
}

// ============ LEADERBOARD — PODIUM ============
const LEADERS = [
  { n: 1, name: 'فاطمة ز.', xp: '٢٨٤٠', you: false },
  { n: 2, name: 'محمد الفاتح', xp: '٢٥٦٠', you: true },
  { n: 3, name: 'عائشة ر.', xp: '٢٣١٠', you: false },
  { n: 4, name: 'يوسف ح.', xp: '١٩٨٠', you: false },
  { n: 5, name: 'مريم س.', xp: '١٨٤٠', you: false },
  { n: 6, name: 'عمر خ.', xp: '١٧٢٠', you: false },
  { n: 7, name: 'زينب أ.', xp: '١٥٩٠', you: false },
];

function LeaderboardPodium({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '14px 18px 10px' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700 }}>المتصدرون</div>
        <div style={{ fontSize: 12, color: WIRE.ink3 }}>هذا الأسبوع · الفصل ١٢ أ</div>
      </div>

      <div style={{ padding: '0 18px 6px', display: 'flex', gap: 6 }}>
        {['الأسبوع', 'الشهر', 'الكل'].map((t, i) => (
          <div key={i} className="wire-chip" style={i === 0 ? { background: WIRE.ink, color: WIRE.paper } : {}}>{t}</div>
        ))}
      </div>

      <div style={{ padding: '18px 16px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
        {[
          { n: 2, h: 70, label: 'عائشة ر.', xp: '٢٣١٠' },
          { n: 1, h: 100, label: 'فاطمة ز.', xp: '٢٨٤٠' },
          { n: 3, h: 55, label: 'يوسف ح.', xp: '١٩٨٠' },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: 48, height: 48, border: `1.5px solid ${WIRE.ink}`, borderRadius: '50%', background: WIRE.paperAlt, marginBottom: 6 }}/>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{p.label}</div>
            <div style={{ fontSize: 10, color: WIRE.ink3, marginBottom: 6 }}>{p.xp}</div>
            <div className="wire-box-rough" style={{
              width: '100%', height: p.h,
              background: p.n === 1 ? WIRE.accent3 : p.n === 2 ? WIRE.accent : WIRE.paperAlt,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Amiri, serif', fontSize: 26, fontWeight: 700, color: p.n === 3 ? WIRE.ink : WIRE.paper,
            }}>{['١','٢','٣'][p.n-1]}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LEADERS.slice(3).map(l => (
          <LeaderRow key={l.n} l={l}/>
        ))}
        <div style={{ height: 1, borderTop: `1.5px dashed ${WIRE.ink3}`, margin: '6px 0', position: 'relative' }}>
          <span style={{ position: 'absolute', right: '50%', top: -8, transform: 'translateX(50%)', background: WIRE.paper, padding: '0 8px', fontSize: 10, color: WIRE.ink3 }}>ترتيبك</span>
        </div>
        <LeaderRow l={{ n: 2, name: 'محمد الفاتح (أنت)', xp: '٢٥٦٠', you: true }}/>
      </div>
      <WireBottomNav active="leader"/>
    </PhoneShell>
  );
}

function LeaderRow({ l }) {
  return (
    <div className="wire-box-rough" style={{
      padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 10,
      background: l.you ? WIRE.paperAlt : WIRE.paper,
      borderWidth: l.you ? 2 : 1.5,
    }}>
      <div style={{ width: 22, textAlign: 'center', fontFamily: 'Amiri, serif', fontWeight: 700 }}>{['١','٢','٣','٤','٥','٦','٧'][l.n-1]}</div>
      <div style={{ width: 30, height: 30, border: `1.5px solid ${WIRE.ink}`, borderRadius: '50%', background: WIRE.paperAlt, flexShrink: 0 }}/>
      <div style={{ flex: 1, fontSize: 13, fontWeight: l.you ? 700 : 500 }}>{l.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <WireIcon.Coin size={12} color={WIRE.accent3}/>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{l.xp}</span>
      </div>
    </div>
  );
}

// ============ LEADERBOARD — LIST ============
function LeaderboardList({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '14px 18px 10px' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700 }}>المتصدرون</div>
        <div style={{ fontSize: 12, color: WIRE.ink3 }}>ترتيب أصدقائك</div>
      </div>
      <div style={{ padding: '0 18px 10px', display: 'flex', gap: 6 }}>
        {['الأصحاب', 'الفصل', 'الكل'].map((t, i) => (
          <div key={i} className="wire-chip" style={i === 0 ? { background: WIRE.ink, color: WIRE.paper } : {}}>{t}</div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '6px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LEADERS.map(l => (
          <div key={l.n} className="wire-box-rough" style={{
            padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12,
            background: l.you ? WIRE.paperAlt : WIRE.paper,
            borderWidth: l.you ? 2 : 1.5,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: l.n === 1 ? WIRE.accent3 : l.n === 2 ? '#c0c0c0' : l.n === 3 ? '#cd7f32' : WIRE.paperAlt,
              border: `1.5px solid ${WIRE.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Amiri, serif', fontSize: 14, fontWeight: 700,
              color: l.n <= 3 ? WIRE.paper : WIRE.ink,
            }}>{['١','٢','٣','٤','٥','٦','٧'][l.n-1]}</div>
            <div style={{ width: 36, height: 36, border: `1.5px solid ${WIRE.ink}`, borderRadius: '50%', background: WIRE.paperAlt, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: l.you ? 700 : 600 }}>{l.name}{l.you && ' (أنت)'}</div>
              <div style={{ fontSize: 10, color: WIRE.ink3 }}>المستوى {['١٢','١٠','٩','٨','٧','٧','٦'][l.n-1]}</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: 14, fontWeight: 700 }}>{l.xp}</div>
              <div style={{ fontSize: 9, color: WIRE.ink3 }}>نقطة</div>
            </div>
          </div>
        ))}
      </div>
      <WireBottomNav active="leader"/>
    </PhoneShell>
  );
}

// ============ LEADERBOARD — CARD ============
function LeaderboardCard({ font }) {
  return (
    <PhoneShell font={font} bg={WIRE.paperAlt}>
      <div style={{ padding: '14px 18px 10px' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700 }}>المتصدرون</div>
      </div>

      {/* your card — highlight */}
      <div style={{ padding: '0 16px 14px' }}>
        <div className="wire-box-rough" style={{ padding: '14px 14px', background: WIRE.ink, color: WIRE.paper }}>
          <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>ترتيبك الحالي</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: 40, fontWeight: 700, lineHeight: 1 }}>#٢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>محمد الفاتح</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>٢٥٦٠ نقطة · تقدمت ٣ مراكز ↑</div>
            </div>
            <WireIcon.Trophy size={32} color={WIRE.accent3}/>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 14px' }}>
        <div style={{ fontSize: 11, color: WIRE.ink3, marginBottom: 8 }}>أصدقاء في فصلك</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {LEADERS.slice(0, 6).map(l => (
            <div key={l.n} className="wire-box-rough" style={{ padding: '10px 8px', textAlign: 'center', background: l.you ? WIRE.paper : WIRE.paper }}>
              <div style={{ fontSize: 10, color: WIRE.ink3 }}>#{['١','٢','٣','٤','٥','٦'][l.n-1]}</div>
              <div style={{ width: 36, height: 36, border: `1.5px solid ${WIRE.ink}`, borderRadius: '50%', background: WIRE.paperAlt, margin: '4px auto 6px' }}/>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{l.name}</div>
              <div style={{ fontSize: 10, color: WIRE.ink3, marginTop: 2 }}>{l.xp}</div>
            </div>
          ))}
        </div>
      </div>
      <WireBottomNav active="leader"/>
    </PhoneShell>
  );
}

// ============ PROFIL ============
function ScreenProfile({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '16px 18px 12px', textAlign: 'center', borderBottom: `1.5px solid ${WIRE.ink}` }}>
        <div style={{ width: 72, height: 72, border: `1.8px solid ${WIRE.ink}`, borderRadius: '50%', background: WIRE.paperAlt, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Amiri, serif', fontSize: 28, fontWeight: 700 }}>م</div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 20, fontWeight: 700 }}>محمد الفاتح</div>
        <div style={{ fontSize: 11, color: WIRE.ink3, marginBottom: 10 }}>@muhammad_f · انضم في رمضان ١٤٤٦</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          <div className="wire-chip" style={{ background: WIRE.accent3, color: WIRE.paper, fontWeight: 600 }}>المستوى ١٠</div>
          <div className="wire-chip">متوسط</div>
        </div>
      </div>

      {/* level progress */}
      <div style={{ padding: '12px 18px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: WIRE.ink3, marginBottom: 4 }}>
          <span>المستوى ١٠</span>
          <span>٢٥٦٠ / ٣٠٠٠ نقطة</span>
        </div>
        <div style={{ height: 8, border: `1.5px solid ${WIRE.ink}`, background: WIRE.paperAlt, position: 'relative' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '85%', background: WIRE.accent3 }}/>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 18px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <ProfileStat icon="Fire" label="سلسلة" val="١٢ يوم"/>
          <ProfileStat icon="Trophy" label="الإنجازات" val="٨"/>
          <ProfileStat icon="Coin" label="النقاط" val="٢٥٦٠"/>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'inline-block', position: 'relative' }}>
          تقدمي في الدروس
          <div style={{ position: 'absolute', bottom: -4, right: 0 }}><Squiggle width={60}/></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {[
            { n: 'القراءة', p: 0.45, c: WIRE.accent },
            { n: 'الإملاء', p: 0.12, c: WIRE.accent2 },
            { n: 'البلاغة', p: 0, c: WIRE.accent3 },
          ].map((l, i) => (
            <div key={i} className="wire-box-rough" style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Amiri, serif', fontWeight: 700 }}>{l.n}</span>
                <span style={{ fontSize: 11, color: WIRE.ink3 }}>{Math.round(l.p * 8)}/٨ وحدة</span>
              </div>
              <div style={{ height: 5, background: WIRE.paperAlt, border: `1px solid ${WIRE.ink}`, position: 'relative' }}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${l.p * 100}%`, background: l.c }}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>الشارات المكتسبة</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { i: 'Star', l: 'أول درس' },
            { i: 'Fire', l: 'سلسلة ٧' },
            { i: 'Trophy', l: 'بطل الوحدة' },
            { i: 'Flag', l: 'نقطة تفتيش' },
            { i: 'Medal', l: '+مقفل' },
          ].map((b, i) => {
            const Icon = WireIcon[b.i];
            const locked = b.l.startsWith('+');
            return (
              <div key={i} style={{ width: 54, textAlign: 'center', opacity: locked ? 0.35 : 1 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', border: `1.5px solid ${WIRE.ink}`, borderStyle: locked ? 'dashed' : 'solid', background: WIRE.paperAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                  <Icon size={22}/>
                </div>
                <div style={{ fontSize: 9, lineHeight: 1.2 }}>{b.l.replace('+', '')}</div>
              </div>
            );
          })}
        </div>
      </div>
      <WireBottomNav active="profile"/>
    </PhoneShell>
  );
}

function ProfileStat({ icon, label, val }) {
  const Icon = WireIcon[icon];
  return (
    <div className="wire-box-rough" style={{ padding: '10px 4px', textAlign: 'center' }}>
      <Icon size={18}/>
      <div style={{ fontFamily: 'Amiri, serif', fontSize: 14, fontWeight: 700, marginTop: 3 }}>{val}</div>
      <div style={{ fontSize: 9, color: WIRE.ink3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { ScreenCheckpointIntro, LeaderboardPodium, LeaderboardList, LeaderboardCard, ScreenProfile });
