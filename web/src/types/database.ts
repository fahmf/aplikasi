export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Row types for use in components/API
export type Profile = {
  id: string
  username: string
  full_name: string | null
  role: 'student' | 'admin' | 'superadmin'
  class_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Lesson = {
  id: string
  code: string
  name_ar: string
  name_id: string
  description_ar: string | null
  level: string
  icon: string
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export type Unit = {
  id: string
  lesson_id: string
  number: number
  title_ar: string
  title_id: string | null
  description_ar: string | null
  is_checkpoint: boolean
  passing_score: number
  xp_reward: number
  question_count: number
  is_published: boolean
  created_at: string
}

export type Question = {
  id: string
  unit_id: string
  type: 'mcq' | 'mcq_harakat' | 'arrange' | 'match'
  prompt_ar: string
  context_ar: string | null
  explanation_ar: string | null
  media_url: string | null
  xp_reward: number
  sort_order: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  is_published: boolean
  metadata: Json
  created_at: string
  updated_at: string
}

export type Choice = {
  id: string
  question_id: string
  text_ar: string
  is_correct: boolean
  sort_order: number
  pair_key: string | null
  created_at: string
}

export type Attempt = {
  id: string
  user_id: string
  unit_id: string
  score: number | null
  stars: number
  xp_earned: number
  passed: boolean
  hearts_used: number
  time_seconds: number | null
  started_at: string
  finished_at: string | null
}

export type Answer = {
  id: string
  attempt_id: string
  question_id: string
  response: Json
  is_correct: boolean
  time_ms: number | null
  created_at: string
}

export type UserProgress = {
  user_id: string
  lesson_id: string
  current_unit: number
  total_xp: number
  level: number
  streak_days: number
  hearts: number
  last_played_at: string | null
  enrolled_at: string
}

export type Badge = {
  id: string
  name_ar: string
  name_id: string
  description_ar: string | null
  icon: string
  condition: Json
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  is_active: boolean
  created_at: string
}

export type UserBadge = {
  user_id: string
  badge_id: string
  earned_at: string
}

export type QuestionWithChoices = Question & { choices: Choice[] }
export type UnitWithQuestions = Unit & { questions: QuestionWithChoices[] }
export type LessonWithProgress = Lesson & { progress?: UserProgress | null }

// Supabase Database type with required Relationships field
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
        Relationships: [
          { foreignKeyName: 'fk_class'; columns: ['class_id']; isOneToOne: false; referencedRelation: 'classes'; referencedColumns: ['id'] }
        ]
      }
      classes: {
        Row: { id: string; name: string; year: string | null; teacher_id: string | null; created_at: string }
        Insert: Omit<{ id: string; name: string; year: string | null; teacher_id: string | null; created_at: string }, 'id' | 'created_at'>
        Update: Partial<Omit<{ id: string; name: string; year: string | null; teacher_id: string | null; created_at: string }, 'id'>>
        Relationships: []
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at'>
        Update: Partial<Omit<Lesson, 'id'>>
        Relationships: []
      }
      units: {
        Row: Unit
        Insert: {
          lesson_id: string
          number: number
          title_ar: string
          title_id?: string | null
          description_ar?: string | null
          is_checkpoint?: boolean
          passing_score?: number
          xp_reward?: number
          question_count?: number
          is_published?: boolean
        }
        Update: Partial<Omit<Unit, 'id'>>
        Relationships: [
          { foreignKeyName: 'units_lesson_id_fkey'; columns: ['lesson_id']; isOneToOne: false; referencedRelation: 'lessons'; referencedColumns: ['id'] }
        ]
      }
      questions: {
        Row: Question
        Insert: {
          unit_id: string
          type: 'mcq' | 'mcq_harakat' | 'arrange' | 'match'
          prompt_ar: string
          context_ar?: string | null
          explanation_ar?: string | null
          media_url?: string | null
          xp_reward?: number
          sort_order?: number | null
          difficulty?: 'easy' | 'medium' | 'hard'
          is_published?: boolean
          metadata?: Json
        }
        Update: Partial<Omit<Question, 'id'>>
        Relationships: [
          { foreignKeyName: 'questions_unit_id_fkey'; columns: ['unit_id']; isOneToOne: false; referencedRelation: 'units'; referencedColumns: ['id'] }
        ]
      }
      choices: {
        Row: Choice
        Insert: Omit<Choice, 'id' | 'created_at'>
        Update: Partial<Omit<Choice, 'id'>>
        Relationships: [
          { foreignKeyName: 'choices_question_id_fkey'; columns: ['question_id']; isOneToOne: false; referencedRelation: 'questions'; referencedColumns: ['id'] }
        ]
      }
      attempts: {
        Row: Attempt
        Insert: {
          user_id: string
          unit_id: string
          score?: number | null
          stars?: number
          xp_earned?: number
          passed?: boolean
          hearts_used?: number
          time_seconds?: number | null
          finished_at?: string | null
        }
        Update: Partial<Omit<Attempt, 'id'>>
        Relationships: [
          { foreignKeyName: 'attempts_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'attempts_unit_id_fkey'; columns: ['unit_id']; isOneToOne: false; referencedRelation: 'units'; referencedColumns: ['id'] }
        ]
      }
      answers: {
        Row: Answer
        Insert: Omit<Answer, 'id' | 'created_at'>
        Update: Partial<Omit<Answer, 'id'>>
        Relationships: [
          { foreignKeyName: 'answers_attempt_id_fkey'; columns: ['attempt_id']; isOneToOne: false; referencedRelation: 'attempts'; referencedColumns: ['id'] }
        ]
      }
      user_progress: {
        Row: UserProgress
        Insert: Omit<UserProgress, 'enrolled_at'>
        Update: Partial<Omit<UserProgress, 'user_id' | 'lesson_id'>>
        Relationships: []
      }
      badges: {
        Row: Badge
        Insert: Omit<Badge, 'id' | 'created_at'>
        Update: Partial<Omit<Badge, 'id'>>
        Relationships: []
      }
      user_badges: {
        Row: UserBadge
        Insert: Omit<UserBadge, 'earned_at'>
        Update: Partial<UserBadge>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      finish_attempt: {
        Args: { p_attempt_id: string }
        Returns: Json
      }
      get_leaderboard: {
        Args: { p_lesson_id?: string; p_class_id?: string; p_limit?: number }
        Returns: Array<{
          rank: number
          user_id: string
          username: string
          full_name: string
          avatar_url: string
          total_xp: number
          level: number
          streak_days: number
        }>
      }
      check_badges: {
        Args: { p_user_id: string; p_lesson_id: string }
        Returns: Json
      }
    }
  }
}
