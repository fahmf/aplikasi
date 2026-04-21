import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// GET /api/leaderboard?lesson_id=...&class_id=...&limit=50
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lesson_id = searchParams.get('lesson_id') ?? undefined
  const class_id = searchParams.get('class_id') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_lesson_id: lesson_id,
    p_class_id: class_id,
    p_limit: limit
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ leaderboard: data })
}
