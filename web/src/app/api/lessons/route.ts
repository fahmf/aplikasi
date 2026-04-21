import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// GET /api/lessons — list lessons + user progress
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!user) return NextResponse.json({ lessons })

  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)

  const lessonsWithProgress = lessons.map(lesson => ({
    ...lesson,
    progress: progress?.find(p => p.lesson_id === lesson.id) ?? null
  }))

  return NextResponse.json({ lessons: lessonsWithProgress })
}
