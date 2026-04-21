// wire-quiz.jsx — Intro Wahdah, Question types, Results

// ============ INTRO WAHDAH ============
function ScreenIntroUnit({ font }) {
  return (
    <PhoneShell font={font} bg={WIRE.paperAlt}>
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, border: `1.5px solid ${WIRE.ink}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WireIcon.Cross size={14}/>
        </div>
        <div style={{ fontSize: 12, color: WIRE.ink3 }}>القراءة · الوحدة ٥</div>
        <div style={{ width: 28 }}/>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 24px' }}>
        <div style={{ width: 180, height: 180, marginBottom: 20, position: 'relative' }}>
          <div className="wire-placeholder-img" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
            ilustrasi sketsa:<br/>كتاب مفتوح
          </div>
          <div style={{ position: 'absolute', top: -8, right: -8 }}>
            <WireIcon.Sparkle size={26} color={WIRE.accent}/>
          </div>
        </div>

        <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 4 }}>الوحدة الخامسة</div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 28, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
          الجمل البسيطة
        </div>
        <div style={{ fontSize: 13, color: WIRE.ink2, textAlign: 'center', lineHeight: 1.6, marginBottom: 22, maxWidth: 280 }}>
          تعلّم تركيب الجمل الفعلية والاسمية، وقراءة النصوص القصيرة بطلاقة
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <InfoChip label="١٠ أسئلة" icon="Scroll"/>
          <InfoChip label="٨ دقائق" icon="Star"/>
          <InfoChip label="+١٢٠ نقطة" icon="Coin"/>
        </div>

        <div style={{ flex: 1 }}/>

        <button className="wire-btn wire-btn-accent" style={{ width: '100%', fontSize: 17, fontWeight: 600, padding: '14px' }}>
          ابدأ الوحدة
        </button>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginTop: 10 }}>راجع الدرس أولاً</div>
      </div>
    </PhoneShell>
  );
}

function InfoChip({ label, icon }) {
  const Icon = WireIcon[icon];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1.5px solid ${WIRE.ink}`, padding: '5px 10px', borderRadius: 100, fontSize: 11, background: WIRE.paper }}>
      <Icon size={13}/>{label}
    </div>
  );
}

// ============ QUIZ HEADER (shared) ============
function QuizHeader({ q = 3, total = 10, lives = 3 }) {
  return (
    <div style={{ padding: '14px 16px 12px', borderBottom: `1.5px solid ${WIRE.ink}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <WireIcon.Cross size={20}/>
        <div style={{ flex: 1, height: 8, border: `1.5px solid ${WIRE.ink}`, background: WIRE.paperAlt, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${(q/total)*100}%`, background: WIRE.accent }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <WireIcon.Heart size={16} fill={WIRE.bad} color={WIRE.ink}/>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{['٣','٢','١'][3-lives]}</span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: WIRE.ink3, textAlign: 'center' }}>
        السؤال {['١','٢','٣','٤','٥','٦','٧','٨','٩','١٠'][q-1]} من {['١٠'][0]}
      </div>
    </div>
  );
}

// ============ Q TYPE 1: PILIHAN GANDA (harakat) ============
function QuizMCQ({ font }) {
  return (
    <PhoneShell font={font}>
      <QuizHeader q={3} total={10} lives={3}/>
      <div style={{ flex: 1, padding: '20px 20px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 8 }}>اختر الإعراب الصحيح للكلمة الملونة</div>
        <div className="wire-box-rough" style={{ padding: '22px 18px', marginBottom: 22, textAlign: 'center', background: WIRE.paperAlt }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: 26, lineHeight: 1.8 }}>
            ذهبَ <span style={{ color: WIRE.accent, borderBottom: `2px solid ${WIRE.accent}` }}>الطالبُ</span> إلى المدرسةِ
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {[
            { t: 'فاعل مرفوع بالضمة', state: 'idle' },
            { t: 'مفعول به منصوب بالفتحة', state: 'idle' },
            { t: 'مبتدأ مرفوع بالضمة', state: 'selected' },
            { t: 'فاعل منصوب بالفتحة', state: 'idle' },
          ].map((o, i) => (
            <div key={i} className="wire-box-rough" style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              background: o.state === 'selected' ? WIRE.ink : WIRE.paper,
              color: o.state === 'selected' ? WIRE.paper : WIRE.ink,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', border: `1.5px solid currentColor`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>{['أ','ب','ج','د'][i]}</div>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: 16, fontWeight: 600 }}>{o.t}</div>
            </div>
          ))}
        </div>

        <button className="wire-btn wire-btn-accent" style={{ marginTop: 14, fontSize: 15, padding: '12px', fontWeight: 600 }}>
          تحقّق
        </button>
      </div>
    </PhoneShell>
  );
}

// ============ Q TYPE 2: SUSUN KATA ============
function QuizArrange({ font }) {
  return (
    <PhoneShell font={font}>
      <QuizHeader q={5} total={10}/>
      <div style={{ flex: 1, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 10 }}>رتّب الكلمات لتكوين جملة صحيحة</div>
        <div className="wire-box-rough" style={{
          padding: '10px 12px', background: WIRE.paperAlt, minHeight: 100, marginBottom: 6,
          display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
        }}>
          {['يقرأُ', 'الطالبُ', 'الكتابَ'].map((w, i) => (
            <div key={i} className="wire-box" style={{ padding: '8px 14px', fontFamily: 'Amiri, serif', fontSize: 18, fontWeight: 600, background: WIRE.paper, borderRadius: 4 }}>
              {w}
            </div>
          ))}
          <div style={{ flex: 1, borderBottom: `1.5px dashed ${WIRE.ink3}`, minHeight: 36 }}/>
        </div>

        <div style={{ borderTop: `1.5px dashed ${WIRE.ink3}`, margin: '14px 0', position: 'relative', height: 1 }}>
          <span style={{ position: 'absolute', right: '50%', top: -8, background: WIRE.paper, padding: '0 8px', fontSize: 10, color: WIRE.ink3 }}>البنك</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {['المدرسةِ', 'في', 'بجِدٍّ'].map((w, i) => (
            <div key={i} className="wire-box-rough" style={{ padding: '8px 14px', fontFamily: 'Amiri, serif', fontSize: 18, fontWeight: 600 }}>
              {w}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="wire-btn" style={{ flex: 1, fontSize: 13 }}>تخطّي</button>
          <button className="wire-btn wire-btn-accent" style={{ flex: 2, fontSize: 15, fontWeight: 600 }}>تحقّق</button>
        </div>
      </div>
    </PhoneShell>
  );
}

// ============ Q TYPE 3: COCOKKAN PASANGAN ============
function QuizMatch({ font }) {
  const left = ['قلم', 'كتاب', 'مدرسة', 'معلّم'];
  const right = ['Teacher', 'School', 'Pen', 'Book'];
  return (
    <PhoneShell font={font}>
      <QuizHeader q={7} total={10} lives={2}/>
      <div style={{ flex: 1, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 14 }}>صِل كل كلمة بمعناها الصحيح</div>

        <div style={{ display: 'flex', gap: 40, flex: 1, position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {left.map((w, i) => (
              <div key={i} className="wire-box-rough" style={{ padding: '12px 10px', textAlign: 'center', fontFamily: 'Amiri, serif', fontSize: 18, fontWeight: 600, background: i === 1 ? WIRE.ink : WIRE.paper, color: i === 1 ? WIRE.paper : WIRE.ink }}>
                {w}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {right.map((w, i) => (
              <div key={i} className="wire-box-rough" style={{ padding: '12px 10px', textAlign: 'center', fontSize: 14, fontWeight: 500, direction: 'ltr', background: i === 3 ? WIRE.ink : WIRE.paper, color: i === 3 ? WIRE.paper : WIRE.ink }}>
                {w}
              </div>
            ))}
          </div>
          {/* matching lines */}
          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="100%" height="100%">
            <path d="M32%,12% C50%,12%, 50%,88%, 68%,88%" stroke={WIRE.accent} strokeWidth="2" fill="none" strokeDasharray="4 3"/>
          </svg>
        </div>

        <button className="wire-btn wire-btn-accent" style={{ marginTop: 12, fontSize: 15, padding: '12px', fontWeight: 600 }}>
          تحقّق
        </button>
      </div>
    </PhoneShell>
  );
}

// ============ Q TYPE 4: PILIHAN GANDA TEKS (dengan gambar) ============
function QuizImageMCQ({ font }) {
  return (
    <PhoneShell font={font}>
      <QuizHeader q={2} total={10}/>
      <div style={{ flex: 1, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: WIRE.ink3, marginBottom: 8 }}>أيّ صورة تدلّ على الكلمة؟</div>
        <div style={{ textAlign: 'center', fontFamily: 'Amiri, serif', fontSize: 32, fontWeight: 700, margin: '10px 0 16px' }}>
          المِصباح
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
          {['قلم', 'مصباح', 'كرسي', 'كتاب'].map((l, i) => (
            <div key={i} className="wire-box-rough" style={{ padding: 8, display: 'flex', flexDirection: 'column', background: i === 1 ? WIRE.accent : WIRE.paper }}>
              <Placeholder h={80} label={l} style={{ background: i === 1 ? WIRE.paper : undefined }}/>
              <div style={{ fontSize: 10, textAlign: 'center', marginTop: 6, color: i === 1 ? WIRE.paper : WIRE.ink3, fontFamily: 'monospace' }}>
                {['A','B','C','D'][i]}
              </div>
            </div>
          ))}
        </div>
        <button className="wire-btn wire-btn-accent" style={{ marginTop: 14, fontSize: 15, padding: '12px', fontWeight: 600 }}>
          تحقّق
        </button>
      </div>
    </PhoneShell>
  );
}

// ============ RESULT (benar/salah feedback) ============
function QuizResult({ font }) {
  return (
    <PhoneShell font={font} bg={WIRE.paperAlt}>
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}>
        <WireIcon.Cross size={20}/>
        <div style={{ fontSize: 12, color: WIRE.ink3 }}>نتيجة الوحدة ٥</div>
        <div style={{ width: 20 }}/>
      </div>
      <div style={{ flex: 1, padding: '16px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 130, height: 130, border: `2px solid ${WIRE.ink}`, borderRadius: '50%', background: WIRE.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative' }}>
          <WireIcon.Trophy size={60} color={WIRE.accent}/>
          <div style={{ position: 'absolute', top: -10, right: -10, transform: 'rotate(15deg)' }}>
            <WireIcon.Sparkle size={20}/>
          </div>
        </div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>أحسنت!</div>
        <div style={{ fontSize: 13, color: WIRE.ink3, marginBottom: 18 }}>أنهيتَ الوحدة الخامسة</div>

        <div style={{ marginBottom: 22 }}><StarsRow n={3} size={28}/></div>

        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          <ResultStat label="النتيجة" val="٩/١٠" icon="Check"/>
          <ResultStat label="النقاط" val="+١٢٠" icon="Coin" color={WIRE.accent3}/>
          <ResultStat label="الوقت" val="٦:٣٢" icon="Fire" color={WIRE.accent}/>
        </div>

        <div className="wire-box-rough" style={{ width: '100%', padding: '12px 14px', marginBottom: 14, fontSize: 12, textAlign: 'center' }}>
          <span style={{ color: WIRE.ink3 }}>الإنجاز الجديد: </span>
          <span style={{ fontWeight: 600 }}>« قارئ مبتدئ »</span>
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ width: '100%', display: 'flex', gap: 8 }}>
          <button className="wire-btn" style={{ flex: 1, fontSize: 13 }}>مراجعة</button>
          <button className="wire-btn wire-btn-accent" style={{ flex: 2, fontSize: 15, fontWeight: 600 }}>الوحدة التالية ←</button>
        </div>
      </div>
    </PhoneShell>
  );
}

function ResultStat({ label, val, icon, color = WIRE.ink }) {
  const Icon = WireIcon[icon];
  return (
    <div className="wire-box-rough" style={{ padding: '10px 6px', textAlign: 'center', background: WIRE.paper }}>
      <Icon size={18} color={color}/>
      <div style={{ fontFamily: 'Amiri, serif', fontSize: 16, fontWeight: 700, marginTop: 3 }}>{val}</div>
      <div style={{ fontSize: 10, color: WIRE.ink3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { ScreenIntroUnit, QuizMCQ, QuizArrange, QuizMatch, QuizImageMCQ, QuizResult });
