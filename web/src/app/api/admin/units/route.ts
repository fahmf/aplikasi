import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// GET /api/admin/units — list all units with lesson info (for admin dropdowns)
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: units, error } = await supabase
    .from('units')
    .select('*, lessons(id, name_id, name_ar, icon)')
    .order('lesson_id')
    .order('number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const formatted = units.map(u => {
    const lesson = Array.isArray(u.lessons) ? u.lessons[0] : u.lessons
    return { ...u, lesson }
  })

  return NextResponse.json({ units: formatted })
}

// POST /api/admin/units — create unit
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { lesson_id, number, title_ar, title_id, description_ar, is_checkpoint, passing_score, xp_reward, question_count } = body

  if (!lesson_id || !number || !title_ar) {
    return NextResponse.json({ error: 'lesson_id, number, title_ar required' }, { status: 400 })
  }

  const { data: unit, error } = await supabase
    .from('units')
    .insert({
      lesson_id, number, title_ar, title_id: title_id ?? null,
      description_ar: description_ar ?? null,
      is_checkpoint: is_checkpoint ?? (number % 4 === 0),
      passing_score: passing_score ?? 70,
      xp_reward: xp_reward ?? 120,
      question_count: question_count ?? 10
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ unit }, { status: 201 })
}
