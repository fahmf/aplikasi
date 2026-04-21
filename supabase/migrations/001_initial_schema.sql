-- =============================================
-- Quizz App — Initial Schema
-- Stack: Supabase (PostgreSQL)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CLASSES (Fashl / فصل)
-- =============================================
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year text,
  teacher_id uuid,  -- will FK to users after users table
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- USERS (extends Supabase auth.users)
-- =============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'superadmin')),
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add FK from classes to profiles (teacher)
ALTER TABLE classes ADD CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================
-- LESSONS (Mata Pelajaran / درس)
-- =============================================
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,           -- 'qiraah' | 'imla' | 'balaghah'
  name_ar text NOT NULL,               -- 'القراءة'
  name_id text NOT NULL,               -- 'Qiraah'
  description_ar text,
  level text DEFAULT 'mubtadi',        -- 'mubtadi' | 'mutawassit' | 'mutaqaddim'
  icon text DEFAULT '📖',
  color text DEFAULT '#0d6e5e',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- UNITS (Wahdah / وحدة)
-- =============================================
CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  number int NOT NULL,                 -- 1..8
  title_ar text NOT NULL,
  title_id text,
  description_ar text,
  is_checkpoint boolean DEFAULT false, -- true untuk wahdah 4 & 8
  passing_score int DEFAULT 70,        -- % minimum
  xp_reward int DEFAULT 120,
  question_count int DEFAULT 10,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, number)
);

-- =============================================
-- QUESTIONS (Soal / سؤال)
-- =============================================
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mcq', 'mcq_harakat', 'arrange', 'match')),
  prompt_ar text NOT NULL,
  context_ar text,                     -- kalimat/konteks untuk soal
  explanation_ar text,                 -- ditampilkan setelah jawab
  media_url text,                      -- audio untuk qiraah / image
  xp_reward int DEFAULT 10,
  sort_order int,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_published boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',         -- hints, tags, dll
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- CHOICES (Opsi Jawaban / خيار)
-- =============================================
CREATE TABLE choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text_ar text NOT NULL,
  is_correct boolean DEFAULT false,    -- untuk mcq
  sort_order int DEFAULT 0,            -- urutan jawaban benar untuk 'arrange'
  pair_key text,                       -- untuk 'match' (pasangan A↔B)
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ATTEMPTS (Percobaan pengerjaan / محاولة)
-- =============================================
CREATE TABLE attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  score int CHECK (score BETWEEN 0 AND 100),
  stars int DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  xp_earned int DEFAULT 0,
  passed boolean DEFAULT false,
  hearts_used int DEFAULT 0,
  time_seconds int,                    -- durasi pengerjaan
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz
);

-- =============================================
-- ANSWERS (Jawaban per soal / إجابة)
-- =============================================
CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  response jsonb NOT NULL,             -- {"choice_id":"..."} | {"order":["id1","id2"]} | {"pairs":[["A1","B3"]]}
  is_correct boolean DEFAULT false,
  time_ms int,                         -- waktu jawab dalam ms
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- USER PROGRESS (per pelajaran)
-- =============================================
CREATE TABLE user_progress (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  current_unit int DEFAULT 1,
  total_xp int DEFAULT 0,
  level int DEFAULT 1,
  streak_days int DEFAULT 0,
  hearts int DEFAULT 3,
  last_played_at timestamptz,
  enrolled_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- =============================================
-- BADGES (لقب / شارة)
-- =============================================
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_id text NOT NULL,
  description_ar text,
  icon text NOT NULL DEFAULT '🏅',
  condition jsonb NOT NULL,            -- {"type":"streak","value":7} | {"type":"xp","value":1000}
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_badges (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_units_lesson_id ON units(lesson_id);
CREATE INDEX idx_questions_unit_id ON questions(unit_id);
CREATE INDEX idx_choices_question_id ON choices(question_id);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_unit_id ON attempts(unit_id);
CREATE INDEX idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);

-- =============================================
-- SEED DATA — Pelajaran default
-- =============================================
INSERT INTO lessons (code, name_ar, name_id, description_ar, level, icon, color, sort_order) VALUES
  ('qiraah',   'القراءة',  'Qiraah',   'تعلم القراءة العربية الصحيحة', 'mubtadi',    '📖', '#0d6e5e', 1),
  ('imla',     'الإملاء',  'Imla''',   'قواعد الكتابة والإملاء العربي', 'mutawassit', '✏️', '#4a90c2', 2),
  ('balaghah', 'البلاغة',  'Balaghah', 'علم البلاغة والبيان العربي',   'mutaqaddim', '📜', '#8b5cf6', 3);

-- Default badges
INSERT INTO badges (name_ar, name_id, description_ar, icon, condition, tier) VALUES
  ('المبتدئ',        'Pemula',         'أكمل وحدتك الأولى',                    '⭐', '{"type":"units_completed","value":1}',   'bronze'),
  ('المجتهد',        'Rajin',          'صلِّ لسبعة أيام متتالية',               '🔥', '{"type":"streak","value":7}',            'silver'),
  ('حافظ الأسرار',   'Hafal Juara',    'احصل على ٥٠٠ نقطة خبرة',               '💫', '{"type":"xp","value":500}',              'silver'),
  ('خبير النحو',     'Ahli Nahwu',     'اجتز ١٠ وحدات بنجاح',                  '🏆', '{"type":"units_completed","value":10}',  'gold'),
  ('بدون أخطاء',     'Sempurna',       'أكمل وحدة بدون أي خطأ',                '💎', '{"type":"perfect_unit","value":1}',      'gold'),
  ('سريع الذكاء',    'Kilat',          'أجب على ٥ أسئلة في ١٠ ثوانٍ لكل منها', '⚡', '{"type":"speed","value":10000}',         'silver');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read all, only update own
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lessons: public read
CREATE POLICY "Lessons public read" ON lessons FOR SELECT USING (true);
CREATE POLICY "Admin manage lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Units: public read published only
CREATE POLICY "Units public read" ON units FOR SELECT USING (is_published = true OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);
CREATE POLICY "Admin manage units" ON units FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Questions: published only for students
CREATE POLICY "Questions read published" ON questions FOR SELECT USING (is_published = true OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);
CREATE POLICY "Admin manage questions" ON questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Choices: same as questions
CREATE POLICY "Choices read" ON choices FOR SELECT USING (
  EXISTS (SELECT 1 FROM questions q WHERE q.id = question_id AND (q.is_published = true OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))))
);
CREATE POLICY "Admin manage choices" ON choices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Attempts: own only
CREATE POLICY "Users manage own attempts" ON attempts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admin read all attempts" ON attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Answers: own only
CREATE POLICY "Users manage own answers" ON answers FOR ALL USING (
  EXISTS (SELECT 1 FROM attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
);

-- Progress: own + admin
CREATE POLICY "Users read own progress" ON user_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own progress" ON user_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admin read all progress" ON user_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- Badges: public read
CREATE POLICY "Badges public read" ON badges FOR SELECT USING (true);
CREATE POLICY "Admin manage badges" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);
CREATE POLICY "User badges read" ON user_badges FOR SELECT USING (true);
CREATE POLICY "User badges insert" ON user_badges FOR INSERT WITH CHECK (user_id = auth.uid());

-- Classes
CREATE POLICY "Classes public read" ON classes FOR SELECT USING (true);
CREATE POLICY "Admin manage classes" ON classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);
