// hifi-screens.jsx — hi-fi screens

// ============ PILIH PELAJARAN ============
function HFPickLesson() {
  const lessons = [
    { id: 'qiraah', ar: 'القراءة', desc: 'فهم النصوص والمفردات', icon: 'Book', progress: 0.45, units: 8, color: HF.primary, bg: 'linear-gradient(135deg, #0d6e5e 0%, #1a9d85 100%)' },
    { id: 'imla', ar: 'الإملاء', desc: 'قواعد الكتابة الصحيحة', icon: 'Quill', progress: 0.12, units: 8, color: HF.sky, bg: 'linear-gradient(135deg, #4a90c2 0%, #6fb3e0 100%)' },
    { id: 'balaghah', ar: 'البلاغة', desc: 'فنون البيان والبديع', icon: 'Scroll', progress: 0, units: 8, color: HF.purple, bg: 'linear-gradient(135deg, #8b5cf6 0%, #b08dff 100%)' },
  ];
  return (
    <HFPhone>
      <div style={{ padding: '14px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: HF.ink3, fontWeight: 500 }}>السلام عليكم 👋</div>
          <div className="hf-display" style={{ fontSize: 22, fontWeight: 700 }}>محمد الفاتح</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'white', borderRadius: 100, boxShadow: HF.shadow }}>
            <HFIcon.Flame size={16} color={HF.accent}/>
            <span style={{ fontSize: 13, fontWeight: 700 }}>١٢</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'white', borderRadius: 100, boxShadow: HF.shadow }}>
            <HFIcon.Coin size={16} color={HF.accent}/>
            <span style={{ fontSize: 13, fontWeight: 700 }}>١٢٤٠</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 20px 14px' }}>
        <div className="hf-display" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
          اختر الدرس <span style={{ color: HF.primary }}>اليوم</span>
        </div>
        <div style={{ fontSize: 12, color: HF.ink3, marginTop: 2 }}>تابع رحلتك في العربية</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {lessons.map((l) => {
          const Icon = HFIcon[l.icon];
          return (
            <div key={l.id} style={{
              borderRadius: 24, padding: '20px 20px', color: 'white',
              background: l.bg, boxShadow: `0 12px 28px ${l.color}40`,
              position: 'relative', overflow: 'hidden', minHeight: 130,
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: .5 }}><IslamicPattern size={70}/></div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: 'rgba(255,255,255,0.25)', borderRadius: 100, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>
                    {Math.round(l.progress * l.units)}/{l.units} وحدة
                  </div>
                  <div className="hf-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{l.ar}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>{l.desc}</div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 100, overflow: 'hidden', width: '70%' }}>
                    <div style={{ height: '100%', width: `${l.progress * 100}%`, background: 'white', borderRadius: 100 }}/>
                  </div>
                </div>
                <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                  <Icon size={36} color="white"/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <HFTabBar active="home"/>
    </HFPhone>
  );
}

// ============ DASHBOARD: PATH MAP (hi-fi) ============
function HFDashboardPath() {
  const units = [
    { n: 1, title: 'أساسيات الحروف', status: 'done', stars: 3 },
    { n: 2, title: 'الحركات', status: 'done', stars: 3 },
    { n: 3, title: 'المفردات', status: 'done', stars: 2 },
    { n: 4, title: 'نقطة التفتيش', status: 'checkpoint-done', stars: 3 },
    { n: 5, title: 'الجمل البسيطة', status: 'current' },
    { n: 6, title: 'الأزمنة', status: 'locked' },
    { n: 7, title: 'النصوص', status: 'locked' },
    { n: 8, title: 'الاختبار الشامل', status: 'checkpoint-locked' },
  ];

  const positions = [
    { x: 50, y: 30 }, { x: 25, y: 110 }, { x: 50, y: 190 }, { x: 25, y: 270 },
    { x: 50, y: 360 }, { x: 25, y: 440 }, { x: 50, y: 520 }, { x: 35, y: 610 },
  ];

  return (
    <HFPhone bg={HF.cream}>
      {/* Header */}
      <div style={{ padding: '12px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: HF.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HFIcon.Book size={20} color="white"/>
          </div>
          <div>
            <div className="hf-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>القراءة</div>
            <div style={{ fontSize: 10, color: HF.ink3 }}>الفصل الأول · الوحدة ٥</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', background: 'white', borderRadius: 100, boxShadow: HF.shadow }}>
            <HFIcon.Flame size={14} color={HF.accent}/>
            <span style={{ fontSize: 12, fontWeight: 700 }}>١٢</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', background: 'white', borderRadius: 100, boxShadow: HF.shadow }}>
            <HFIcon.Heart size={14} color={HF.rose}/>
            <span style={{ fontSize: 12, fontWeight: 700 }}>٣</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0 20px', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: 700, maxWidth: 340, margin: '0 auto' }}>
          {/* curvy path */}
          <svg width="100%" height="700" viewBox="0 0 300 700" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <path d="M150,40 Q250,80 75,160 Q-30,200 150,240 Q260,280 75,320 Q-30,380 150,420 Q250,460 75,500 Q-30,560 105,640"
              stroke={HF.border} strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="0 22" strokeLinejoin="round"/>
            <path d="M150,40 Q250,80 75,160 Q-30,200 150,240 Q260,280 75,320 Q-30,380 150,420 Q250,460 75,500 Q-30,560 105,640"
              stroke={HF.primary} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 14" strokeOpacity="0.25"/>
          </svg>

          {units.map((u, i) => {
            const p = positions[i];
            const done = u.status === 'done' || u.status === 'checkpoint-done';
            const isCheck = u.status.startsWith('checkpoint');
            const locked = u.status.includes('locked');
            const current = u.status === 'current';

            const bg = current ? HF.primary : done ? HF.primaryLight : isCheck ? HF.accent : '#e5dfd2';
            const fg = locked ? HF.ink3 : 'white';

            return (
              <div key={u.n} style={{
                position: 'absolute', left: `${p.x}%`, top: p.y,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                {current && (
                  <div style={{
                    background: HF.ink, color: 'white', fontSize: 10, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 100, marginBottom: 6, position: 'relative',
                    whiteSpace: 'nowrap',
                  }}>
                    ابدأ الآن
                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: HF.ink, transform: 'translateX(-50%) rotate(45deg)' }}/>
                  </div>
                )}
                <div style={{
                  width: isCheck ? 78 : 68, height: isCheck ? 78 : 68,
                  borderRadius: isCheck ? 22 : '50%',
                  background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: current ? `0 8px 20px ${HF.primary}60, 0 0 0 6px white, 0 0 0 8px ${HF.primary}` : `0 6px 14px rgba(0,0,0,0.12)`,
                  transform: isCheck ? 'rotate(8deg)' : 'none',
                }}>
                  {locked ? <HFIcon.Lock size={24} color={fg}/> :
                   done ? (isCheck ? <HFIcon.Flag size={30} color={fg}/> : <HFIcon.Check size={30} color={fg}/>) :
                   isCheck ? <HFIcon.Flag size={30} color={fg}/> :
                   <HFIcon.Play size={24} color={fg}/>}
                </div>
                {done && !isCheck && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {[0,1,2].map(s => <HFIcon.Star key={s} size={11} color={s < u.stars ? HF.accent : HF.border}/>)}
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, textAlign: 'center', maxWidth: 100, color: locked ? HF.ink3 : HF.ink }}>
                  {u.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <HFTabBar active="home"/>
    </HFPhone>
  );
}

// ============ INTRO WAHDAH (hi-fi) ============
function HFIntroUnit() {
  return (
    <div className="hf" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', color: 'white', position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${HF.primary} 0%, ${HF.primaryDark} 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><IslamicPattern size={80}/></div>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: HF.primaryLight, opacity: 0.35, filter: 'blur(30px)' }}/>
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 280, height: 280, borderRadius: '50%', background: HF.accent, opacity: 0.2, filter: 'blur(40px)' }}/>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ height: 30, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'ltr', fontSize: 13, fontWeight: 600 }}>
          <span>9:41</span>
          <span/>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HFIcon.X size={18} color="white"/>
          </div>
          <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1 }}>القراءة · وحدة ٥</div>
          <div style={{ width: 40 }}/>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 24px', textAlign: 'center' }}>
          {/* hero: decorative calligraphy inside frame */}
          <div style={{
            width: 180, height: 180, marginBottom: 24, position: 'relative',
            background: 'rgba(255,255,255,0.15)', borderRadius: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)',
            transform: 'rotate(-3deg)',
          }}>
            <div className="hf-display" style={{ fontSize: 96, fontWeight: 700, color: HF.accentLight, textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>٥</div>
            <div style={{ position: 'absolute', top: -12, right: -12, width: 48, height: 48, borderRadius: 14, background: HF.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(10deg)', boxShadow: '0 6px 14px rgba(0,0,0,0.2)' }}>
              <HFIcon.Star size={26} color="white"/>
            </div>
            <div style={{ position: 'absolute', bottom: -8, left: -8 }}>
              <HFIcon.Sparkle size={28} color={HF.accentLight}/>
            </div>
          </div>

          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6, fontWeight: 500 }}>الوحدة الخامسة</div>
          <div className="hf-display" style={{ fontSize: 34, fontWeight: 700, marginBottom: 12, lineHeight: 1.1 }}>الجمل البسيطة</div>
          <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7, maxWidth: 280, marginBottom: 26 }}>
            تعلّم تركيب الجمل الفعلية والاسمية، وقراءة النصوص القصيرة بطلاقة
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            <InfoPill icon="Scroll" label="١٠ أسئلة"/>
            <InfoPill icon="Target" label="٨ دقائق"/>
            <InfoPill icon="Coin" label="+١٢٠"/>
          </div>

          <div style={{ flex: 1 }}/>

          <button className="hf-btn" style={{ width: '100%', background: 'white', color: HF.primary, fontSize: 16, padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              ابدأ الوحدة
              <HFIcon.Back size={18}/>
            </span>
          </button>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 12, textDecoration: 'underline' }}>راجع الدرس أولاً</div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label }) {
  const Icon = HFIcon[icon];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 100, backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 600 }}>
      <Icon size={14} color="white"/>
      {label}
    </div>
  );
}

// ============ QUIZ MCQ (hi-fi) ============
function HFQuizMCQ() {
  return (
    <HFPhone bg={HF.cream}>
      {/* Header */}
      <div style={{ padding: '12px 18px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <HFIcon.X size={22} color={HF.ink2}/>
          <div style={{ flex: 1, height: 10, background: HF.border, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '30%', background: `linear-gradient(90deg, ${HF.primary}, ${HF.primaryLight})`, borderRadius: 100 }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'white', borderRadius: 100, boxShadow: HF.shadow }}>
            <HFIcon.Heart size={14} color={HF.rose}/>
            <span style={{ fontSize: 12, fontWeight: 700 }}>٣</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 20px 16px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ fontSize: 12, color: HF.ink3, fontWeight: 600, marginBottom: 10 }}>السؤال ٣ / ١٠ · إعراب</div>
        <div className="hf-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, lineHeight: 1.3 }}>
          ما إعراب الكلمة الملونة؟
        </div>

        {/* Arabic sentence card */}
        <div className="hf-card" style={{ padding: '28px 20px', marginBottom: 22, textAlign: 'center', position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, white 0%, ${HF.paperAlt} 100%)` }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${HF.primary}10` }}/>
          <div className="hf-display" style={{ fontSize: 28, lineHeight: 1.8, fontWeight: 500, position: 'relative' }}>
            ذهبَ <span style={{ color: HF.primary, fontWeight: 700, borderBottom: `3px solid ${HF.accent}`, paddingBottom: 2 }}>الطالبُ</span> إلى المدرسةِ
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'فاعل مرفوع بالضمة', state: 'idle' },
            { t: 'مفعول به منصوب بالفتحة', state: 'idle' },
            { t: 'مبتدأ مرفوع بالضمة', state: 'selected' },
            { t: 'فاعل منصوب بالفتحة', state: 'idle' },
          ].map((o, i) => {
            const sel = o.state === 'selected';
            return (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: 18,
                background: sel ? HF.primary : 'white',
                color: sel ? 'white' : HF.ink,
                boxShadow: sel ? `0 8px 20px ${HF.primary}40` : '0 2px 8px rgba(0,0,0,0.04)',
                border: sel ? 'none' : `2px solid ${HF.border}`,
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all .2s',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                  background: sel ? 'rgba(255,255,255,0.25)' : HF.paperAlt,
                  color: sel ? 'white' : HF.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}>{['أ','ب','ج','د'][i]}</div>
                <div className="hf-display" style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>{o.t}</div>
                {sel && <HFIcon.Check size={20} color="white"/>}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }}/>
        <button className="hf-btn hf-btn-primary" style={{ marginTop: 18, padding: '16px' }}>
          تحقّق من الإجابة
        </button>
      </div>
    </HFPhone>
  );
}

// ============ RESULT (hi-fi) ============
function HFResult() {
  return (
    <div className="hf" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: HF.cream, position: 'relative', overflow: 'hidden' }}>
      {/* confetti dots */}
      {[...Array(14)].map((_, i) => {
        const colors = [HF.primary, HF.accent, HF.rose, HF.sky, HF.purple];
        return <div key={i} style={{
          position: 'absolute',
          top: `${8 + (i * 7) % 60}%`, left: `${(i * 13) % 95}%`,
          width: 8, height: 8, borderRadius: i % 2 ? '50%' : 2,
          background: colors[i % colors.length],
          opacity: 0.7, transform: `rotate(${i * 23}deg)`,
        }}/>;
      })}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ height: 30, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'ltr', fontSize: 13, fontWeight: 600 }}>
          <span>9:41</span><span/>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <HFIcon.X size={22} color={HF.ink2}/>
        </div>

        <div style={{ flex: 1, padding: '10px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* trophy */}
          <div style={{
            width: 140, height: 140, borderRadius: 44, marginBottom: 18,
            background: `linear-gradient(135deg, ${HF.accent} 0%, ${HF.accentLight} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 16px 40px ${HF.accent}50`, transform: 'rotate(-4deg)',
            position: 'relative',
          }}>
            <HFIcon.Trophy size={72} color="white"/>
            <div style={{ position: 'absolute', top: -10, right: -8, transform: 'rotate(12deg)' }}>
              <HFIcon.Sparkle size={28} color={HF.accentLight}/>
            </div>
          </div>

          <div className="hf-display" style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>أحسنت! 🎉</div>
          <div style={{ fontSize: 14, color: HF.ink2, marginBottom: 18 }}>أنهيتَ الوحدة الخامسة بنجاح</div>

          {/* stars */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
            {[0,1,2].map(s => (
              <div key={s} style={{ width: 42, height: 42, borderRadius: 14, background: HF.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${HF.accent}40`, transform: `rotate(${(s-1)*6}deg)` }}>
                <HFIcon.Star size={24} color="white"/>
              </div>
            ))}
          </div>

          {/* stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%', marginBottom: 20 }}>
            <HFStat icon="Target" val="٩/١٠" label="الإجابات" color={HF.primary}/>
            <HFStat icon="Coin" val="+١٢٠" label="النقاط" color={HF.accent}/>
            <HFStat icon="Flame" val="٦:٣٢" label="الوقت" color={HF.rose}/>
          </div>

          {/* new achievement */}
          <div className="hf-card" style={{ padding: '14px 18px', width: '100%', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, background: `linear-gradient(135deg, ${HF.primaryLight}15, white)` }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: HF.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HFIcon.Medal size={24} color="white"/>
            </div>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <div style={{ fontSize: 10, color: HF.ink3, fontWeight: 600 }}>إنجاز جديد!</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>قارئ مبتدئ</div>
            </div>
          </div>

          <div style={{ flex: 1 }}/>

          <div style={{ width: '100%', display: 'flex', gap: 8 }}>
            <button className="hf-btn hf-btn-ghost" style={{ flex: 1 }}>مراجعة</button>
            <button className="hf-btn hf-btn-primary" style={{ flex: 2 }}>الوحدة التالية ←</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HFStat({ icon, val, label, color }) {
  const Icon = HFIcon[icon];
  return (
    <div className="hf-card" style={{ padding: '12px 6px', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}15`, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color}/>
      </div>
      <div className="hf-display" style={{ fontSize: 16, fontWeight: 700 }}>{val}</div>
      <div style={{ fontSize: 10, color: HF.ink3 }}>{label}</div>
    </div>
  );
}

// ============ LEADERBOARD (hi-fi) ============
function HFLeaderboard() {
  const leaders = [
    { n: 1, name: 'فاطمة زهراء', xp: '٢٨٤٠', level: 12 },
    { n: 2, name: 'محمد الفاتح', xp: '٢٥٦٠', level: 10, you: true },
    { n: 3, name: 'عائشة رحمة', xp: '٢٣١٠', level: 9 },
    { n: 4, name: 'يوسف حكيم', xp: '١٩٨٠', level: 8 },
    { n: 5, name: 'مريم سلمى', xp: '١٨٤٠', level: 7 },
    { n: 6, name: 'عمر الخطاب', xp: '١٧٢٠', level: 7 },
  ];

  return (
    <HFPhone bg={HF.cream}>
      <div style={{
        background: `linear-gradient(160deg, ${HF.primary} 0%, ${HF.primaryDark} 100%)`,
        padding: '14px 20px 30px', color: 'white', position: 'relative', overflow: 'hidden',
        flexShrink: 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25 }}><IslamicPattern size={70}/></div>
        <div style={{ position: 'relative' }}>
          <div className="hf-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 2 }}>المتصدرون</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 14 }}>الفصل ١٢ أ · هذا الأسبوع</div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['الأسبوع', 'الشهر', 'الكل'].map((t, i) => (
              <div key={i} style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                background: i === 0 ? 'white' : 'rgba(255,255,255,0.15)',
                color: i === 0 ? HF.primary : 'white',
                backdropFilter: 'blur(8px)',
              }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Podium */}
      <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, flexShrink: 0 }}>
        {[
          { n: 2, h: 70, name: 'عائشة', xp: '٢٣١٠', color: '#c0c0c0' },
          { n: 1, h: 95, name: 'فاطمة', xp: '٢٨٤٠', color: HF.accent, crown: true },
          { n: 3, h: 55, name: 'يوسف', xp: '١٩٨٠', color: '#cd7f32' },
        ].map((p, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              {p.crown && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 20 }}>👑</div>}
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'white', border: `3px solid ${p.color}`, boxShadow: HF.shadow }}/>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: HF.ink3, marginBottom: 8 }}>{p.xp}</div>
            <div style={{
              width: '100%', height: p.h, borderTopLeftRadius: 14, borderTopRightRadius: 14,
              background: p.color, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 8, color: 'white', fontWeight: 800, fontSize: 22,
              boxShadow: `0 -4px 12px ${p.color}40`,
            }}>
              {['١','٢','٣'][p.n-1]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '6px 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leaders.slice(3).map(l => <LBRow key={l.n} l={l}/>)}
        <div style={{ margin: '4px 0', borderTop: `2px dashed ${HF.border}`, position: 'relative', height: 1 }}>
          <span style={{ position: 'absolute', right: '50%', top: -9, transform: 'translateX(50%)', background: HF.cream, padding: '0 10px', fontSize: 10, color: HF.ink3, fontWeight: 600 }}>ترتيبك</span>
        </div>
        <LBRow l={leaders[1]}/>
      </div>

      <HFTabBar active="leader"/>
    </HFPhone>
  );
}

function LBRow({ l }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 16,
      background: l.you ? HF.primary : 'white',
      color: l.you ? 'white' : HF.ink,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: l.you ? `0 8px 20px ${HF.primary}40` : '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 24, textAlign: 'center', fontWeight: 800, fontSize: 14, opacity: l.you ? 1 : 0.6 }}>
        {['١','٢','٣','٤','٥','٦'][l.n-1]}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: l.you ? 'rgba(255,255,255,0.25)' : HF.paperAlt, flexShrink: 0 }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{l.name}{l.you && ' · أنت'}</div>
        <div style={{ fontSize: 10, opacity: 0.7 }}>المستوى {l.level}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <HFIcon.Coin size={14} color={l.you ? 'white' : HF.accent}/>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{l.xp}</span>
      </div>
    </div>
  );
}

Object.assign(window, { HFPickLesson, HFDashboardPath, HFIntroUnit, HFQuizMCQ, HFResult, HFLeaderboard });
