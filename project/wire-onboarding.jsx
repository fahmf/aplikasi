// wire-onboarding.jsx — Login, Register, Pilih Pelajaran

// ============ LOGIN ============
function ScreenLogin({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '24px 20px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* logo mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 64, height: 64, border: `1.8px solid ${WIRE.ink}`, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: WIRE.paper, position: 'relative',
          }}>
            <span style={{ fontFamily: 'Amiri, serif', fontSize: 32, fontWeight: 700 }}>ق</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'Amiri, serif', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
          مرحبًا بك
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: WIRE.ink3, marginBottom: 32 }}>
          سجّل دخولك لمتابعة رحلتك
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>البريد الإلكتروني</div>
          <input className="wire-input" placeholder="mohammad@example.com" defaultValue="" />
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>كلمة المرور</div>
          <input type="password" className="wire-input" placeholder="••••••••" />
        </div>

        <button className="wire-btn wire-btn-primary" style={{ marginBottom: 12, fontSize: 16, padding: '12px' }}>
          تسجيل الدخول
        </button>
        <div style={{ textAlign: 'center', fontSize: 13, color: WIRE.ink3, margin: '6px 0 20px' }}>
          نسيت كلمة المرور؟
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: WIRE.ink3 }}/>
          <span style={{ fontSize: 11, color: WIRE.ink3 }}>أو</span>
          <div style={{ flex: 1, height: 1, background: WIRE.ink3 }}/>
        </div>
        <button className="wire-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, fontSize: 14 }}>
          <div style={{ width: 18, height: 18, border: `1.2px solid ${WIRE.ink}`, borderRadius: '50%' }}/>
          تسجيل الدخول بـ Google
        </button>

        <div style={{ flex: 1 }}/>
        <div style={{ textAlign: 'center', fontSize: 13, marginBottom: 18 }}>
          ليس لديك حساب؟ <span style={{ borderBottom: `1.5px solid ${WIRE.accent}`, paddingBottom: 1 }}>سجّل الآن</span>
        </div>
      </div>
    </PhoneShell>
  );
}

// ============ REGISTER ============
function ScreenRegister({ font }) {
  return (
    <PhoneShell font={font}>
      <PageHeader title="إنشاء حساب" />
      <div style={{ padding: '20px 20px 16px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          ابدأ رحلتك في العربية
        </div>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 24 }}>
          املأ البيانات أدناه لإنشاء حسابك
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>الاسم الكامل</div>
          <input className="wire-input" placeholder="محمد الفاتح" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>اسم المستخدم</div>
          <input className="wire-input" placeholder="@muhammad_f" dir="ltr" style={{ textAlign: 'left' }}/>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>البريد الإلكتروني</div>
          <input className="wire-input" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>كلمة المرور</div>
          <input type="password" className="wire-input" placeholder="٨ أحرف على الأقل" />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 8 }}>المستوى الدراسي</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['مبتدئ', 'متوسط', 'متقدم'].map((t, i) => (
              <div key={i} className="wire-chip" style={i === 0 ? { background: WIRE.ink, color: WIRE.paper } : {}}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20, fontSize: 11, color: WIRE.ink3 }}>
          <div style={{ width: 16, height: 16, border: `1.5px solid ${WIRE.ink}`, flexShrink: 0, marginTop: 1, background: WIRE.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={WIRE.paper} strokeWidth="1.5" strokeLinecap="round"><path d="M2 5 L4 7 L8 3"/></svg>
          </div>
          <span>أوافق على شروط الاستخدام وسياسة الخصوصية</span>
        </div>

        <button className="wire-btn wire-btn-primary" style={{ width: '100%', fontSize: 16, padding: '12px' }}>
          إنشاء الحساب
        </button>
      </div>
    </PhoneShell>
  );
}

// ============ PILIH PELAJARAN ============
const LESSON_CARDS = [
  { id: 'qiraah', ar: 'القراءة', en: 'Qiraah', desc: 'فهم النصوص والمفردات', icon: 'Book', level: 'مبتدئ', units: 8, progress: 0.45 },
  { id: 'imla', ar: 'الإملاء', en: "Imla'", desc: 'قواعد الكتابة الصحيحة', icon: 'Quill', level: 'متوسط', units: 8, progress: 0.12 },
  { id: 'balaghah', ar: 'البلاغة', en: 'Balaghah', desc: 'فنون البيان والبديع', icon: 'Scroll', level: 'متقدم', units: 8, progress: 0, locked: false },
];

function ScreenPickLesson({ font }) {
  return (
    <PhoneShell font={font}>
      <div style={{ padding: '18px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: WIRE.ink3 }}>السلام عليكم،</div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700 }}>محمد الفاتح</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1.5px solid ${WIRE.ink}`, padding: '5px 10px', borderRadius: 100 }}>
          <WireIcon.Coin size={16} color={WIRE.accent3}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>١٢٤٠</span>
        </div>
      </div>

      <div style={{ padding: '6px 20px 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, display: 'inline-block', position: 'relative' }}>
          اختر الدرس
          <div style={{ position: 'absolute', bottom: -5, right: 0 }}><Squiggle width={70}/></div>
        </div>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginTop: 8 }}>أي علم تريد أن تتقنه اليوم؟</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {LESSON_CARDS.map((l, i) => {
          const Icon = WireIcon[l.icon];
          const accent = [WIRE.accent, WIRE.accent2, WIRE.accent3][i];
          return (
            <div key={l.id} className="wire-box-rough" style={{ padding: '16px 16px 14px', background: i === 0 ? WIRE.paperAlt : WIRE.paper }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 52, height: 52, border: `1.5px solid ${WIRE.ink}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WIRE.paper, flexShrink: 0 }}>
                  <Icon size={28}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{l.ar}</div>
                    <div className="wire-chip" style={{ fontSize: 10, padding: '2px 8px' }}>{l.level}</div>
                  </div>
                  <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 10 }}>{l.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: WIRE.paperAlt, border: `1px solid ${WIRE.ink}`, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${l.progress * 100}%`, background: accent }}/>
                    </div>
                    <span style={{ fontSize: 11, color: WIRE.ink3, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(l.progress * l.units)}/{l.units} وحدة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* bottom nav */}
      <WireBottomNav active="home"/>
    </PhoneShell>
  );
}

// Bottom tab nav
function WireBottomNav({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: 'Home' },
    { id: 'leader', label: 'المتصدرون', icon: 'Trophy' },
    { id: 'achieve', label: 'الإنجازات', icon: 'Medal' },
    { id: 'profile', label: 'حسابي', icon: 'User' },
  ];
  return (
    <div style={{
      borderTop: `1.5px solid ${WIRE.ink}`, display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 10px', background: WIRE.paper,
    }}>
      {tabs.map(t => {
        const Icon = WireIcon[t.icon];
        const on = t.id === active;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: on ? 1 : 0.45 }}>
            <Icon size={22} color={on ? WIRE.accent : WIRE.ink}/>
            <span style={{ fontSize: 10 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ScreenLogin, ScreenRegister, ScreenPickLesson, WireBottomNav });
