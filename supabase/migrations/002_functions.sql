-- =============================================
-- Quizz App — Database Functions & Triggers
-- =============================================

-- =============================================
-- Function: Calculate level from XP
-- level = floor(sqrt(total_xp / 100)) + 1
-- =============================================
CREATE OR REPLACE FUNCTION calculate_level(xp int) RETURNS int AS $$
BEGIN
  RETURN FLOOR(SQRT(xp::float / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- Function: Calculate stars from score
-- 3★=100% · 2★=80-99% · 1★=passing-79% · 0★=fail
-- =============================================
CREATE OR REPLACE FUNCTION calculate_stars(score int, passing_score int) RETURNS int AS $$
BEGIN
  IF score = 100 THEN RETURN 3;
  ELSIF score >= 80 THEN RETURN 2;
  ELSIF score >= passing_score THEN RETURN 1;
  ELSE RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- Function: Finish an attempt
-- Calculates score, XP, stars, updates progress
-- =============================================
CREATE OR REPLACE FUNCTION finish_attempt(p_attempt_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_attempt attempts;
  v_unit units;
  v_total_questions int;
  v_correct_answers int;
  v_score int;
  v_stars int;
  v_xp int;
  v_passed boolean;
  v_progress user_progress;
  v_new_level int;
  v_perfect boolean;
  v_time_taken int;
BEGIN
  -- Load attempt
  SELECT * INTO v_attempt FROM attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  IF v_attempt.finished_at IS NOT NULL THEN RAISE EXCEPTION 'Attempt already finished'; END IF;

  -- Load unit
  SELECT * INTO v_unit FROM units WHERE id = v_attempt.unit_id;

  -- Count answers
  SELECT COUNT(*) INTO v_total_questions
    FROM answers WHERE attempt_id = p_attempt_id;

  SELECT COUNT(*) INTO v_correct_answers
    FROM answers WHERE attempt_id = p_attempt_id AND is_correct = true;

  -- Calculate score
  v_score := CASE WHEN v_total_questions > 0
    THEN ROUND((v_correct_answers::float / v_total_questions) * 100)
    ELSE 0 END;

  v_passed := v_score >= v_unit.passing_score;
  v_stars := calculate_stars(v_score, v_unit.passing_score);
  v_perfect := v_score = 100;

  -- Calculate XP
  v_xp := v_correct_answers * 10;  -- 10 XP per correct
  IF v_passed THEN
    v_xp := v_xp + 50;  -- bonus lulus
    IF v_perfect THEN v_xp := v_xp + 30; END IF;  -- bonus sempurna
  END IF;
  IF v_unit.is_checkpoint AND v_passed THEN
    v_xp := v_xp + 200;  -- bonus checkpoint
    IF v_stars = 3 THEN v_xp := v_xp * 2; END IF;  -- 2x multiplier
  END IF;

  -- Time taken
  v_time_taken := EXTRACT(EPOCH FROM (now() - v_attempt.started_at))::int;

  -- Update attempt
  UPDATE attempts SET
    score = v_score,
    stars = v_stars,
    xp_earned = v_xp,
    passed = v_passed,
    time_seconds = v_time_taken,
    finished_at = now()
  WHERE id = p_attempt_id;

  -- Update user_progress
  INSERT INTO user_progress (user_id, lesson_id, current_unit, total_xp, level, last_played_at)
  SELECT v_attempt.user_id, u.lesson_id, 1, 0, 1, now()
  FROM units u WHERE u.id = v_attempt.unit_id
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    total_xp = user_progress.total_xp + v_xp,
    last_played_at = now(),
    current_unit = CASE
      WHEN v_passed AND user_progress.current_unit = v_unit.number
        THEN v_unit.number + 1
      ELSE user_progress.current_unit
    END;

  -- Update level
  SELECT * INTO v_progress FROM user_progress
  WHERE user_id = v_attempt.user_id
    AND lesson_id = (SELECT lesson_id FROM units WHERE id = v_attempt.unit_id);

  v_new_level := calculate_level(v_progress.total_xp);
  UPDATE user_progress SET level = v_new_level
  WHERE user_id = v_attempt.user_id
    AND lesson_id = (SELECT lesson_id FROM units WHERE id = v_attempt.unit_id);

  -- Return result
  RETURN jsonb_build_object(
    'score', v_score,
    'stars', v_stars,
    'xp_earned', v_xp,
    'passed', v_passed,
    'new_level', v_new_level,
    'prev_level', v_progress.level,
    'leveled_up', v_new_level > v_progress.level,
    'perfect', v_perfect,
    'time_seconds', v_time_taken
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Get leaderboard
-- =============================================
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_lesson_id uuid DEFAULT NULL,
  p_class_id uuid DEFAULT NULL,
  p_limit int DEFAULT 50
) RETURNS TABLE (
  rank bigint,
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  total_xp int,
  level int,
  streak_days int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(up.total_xp, 0) DESC) as rank,
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COALESCE(up.total_xp, 0) as total_xp,
    COALESCE(up.level, 1) as level,
    COALESCE(up.streak_days, 0) as streak_days
  FROM profiles p
  LEFT JOIN user_progress up ON up.user_id = p.id
    AND (p_lesson_id IS NULL OR up.lesson_id = p_lesson_id)
  LEFT JOIN classes c ON c.id = p.class_id
  WHERE p.role = 'student'
    AND (p_class_id IS NULL OR p.class_id = p_class_id)
  ORDER BY COALESCE(up.total_xp, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Trigger: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Trigger: Update streak on activity
-- =============================================
CREATE OR REPLACE FUNCTION update_streak()
RETURNS trigger AS $$
DECLARE
  v_last_played timestamptz;
  v_lesson_id uuid;
BEGIN
  SELECT lesson_id INTO v_lesson_id FROM units WHERE id = NEW.unit_id;

  SELECT last_played_at INTO v_last_played
  FROM user_progress
  WHERE user_id = NEW.user_id AND lesson_id = v_lesson_id;

  IF v_last_played IS NOT NULL THEN
    -- Same day: no change. Yesterday: +1. More than 1 day: reset
    IF DATE(now()) = DATE(v_last_played) THEN
      -- Same day, no change
      NULL;
    ELSIF DATE(now()) = DATE(v_last_played) + 1 THEN
      UPDATE user_progress SET streak_days = streak_days + 1
      WHERE user_id = NEW.user_id AND lesson_id = v_lesson_id;
    ELSE
      UPDATE user_progress SET streak_days = 1
      WHERE user_id = NEW.user_id AND lesson_id = v_lesson_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_attempt_created
  AFTER INSERT ON attempts
  FOR EACH ROW EXECUTE FUNCTION update_streak();

-- =============================================
-- Function: Check and award badges
-- =============================================
CREATE OR REPLACE FUNCTION check_badges(p_user_id uuid, p_lesson_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_badge badges;
  v_condition jsonb;
  v_progress user_progress;
  v_earned_badges jsonb := '[]';
  v_value int;
  v_met boolean;
BEGIN
  SELECT * INTO v_progress FROM user_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  FOR v_badge IN SELECT * FROM badges WHERE is_active = true LOOP
    -- Skip if already earned
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    );

    v_condition := v_badge.condition;
    v_met := false;
    v_value := (v_condition->>'value')::int;

    CASE v_condition->>'type'
      WHEN 'streak' THEN
        v_met := v_progress.streak_days >= v_value;
      WHEN 'xp' THEN
        v_met := v_progress.total_xp >= v_value;
      WHEN 'units_completed' THEN
        v_met := (v_progress.current_unit - 1) >= v_value;
      WHEN 'perfect_unit' THEN
        v_met := EXISTS (
          SELECT 1 FROM attempts a
          JOIN units u ON u.id = a.unit_id
          WHERE a.user_id = p_user_id
            AND u.lesson_id = p_lesson_id
            AND a.score = 100
            AND a.passed = true
        );
      ELSE
        v_met := false;
    END CASE;

    IF v_met THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      v_earned_badges := v_earned_badges || jsonb_build_object(
        'id', v_badge.id, 'name_ar', v_badge.name_ar, 'icon', v_badge.icon
      );
    END IF;
  END LOOP;

  RETURN v_earned_badges;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
