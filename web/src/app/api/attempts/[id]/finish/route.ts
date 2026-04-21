import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// POST /api/attempts/:id/finish — finalize attempt, award XP, unlock next unit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, user_id, unit_id, finished_at')
    .eq('id', attemptId)
    .single()

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }
  if (attempt.finished_at) {
    return NextResponse.json({ error: 'Attempt already finished' }, { status: 400 })
  }

  // Call DB function to calculate score, XP, stars, update progress
  const { data: result, error } = await supabase.rpc('finish_attempt', {
    p_attempt_id: attemptId
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Check and award new badges
  const { data: unit } = await supabase
    .from('units')
    .select('lesson_id')
    .eq('id', attempt.unit_id)
    .single()

  let newBadges: unknown[] = []
  if (unit) {
    const { data: badges } = await supabase.rpc('check_badges', {
      p_user_id: user.id,
      p_lesson_id: unit.lesson_id
    })
    newBadges = Array.isArray(badges) ? badges : []
  }

  return NextResponse.json({ result, new_badges: newBadges })
}
