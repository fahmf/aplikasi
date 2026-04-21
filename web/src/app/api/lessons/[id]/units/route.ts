import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// GET /api/lessons/:id/units — list units for dashboard path
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: units, error } = await supabase
    .from('units')
    .select('id, lesson_id, number, title_ar, title_id, description_ar, is_checkpoint, passing_score, xp_reward, question_count, is_published')
    .eq('lesson_id', id)
    .eq('is_published', true)
    .order('number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get user's best attempt per unit for star/lock display
  let attemptsMap: Record<string, { stars: number; passed: boolean }> = {}
  if (user) {
    const unitIds = units.map(u => u.id)
    const { data: attempts } = await supabase
      .from('attempts')
      .select('unit_id, stars, passed')
      .eq('user_id', user.id)
      .in('unit_id', unitIds)
      .eq('passed', true)
      .order('stars', { ascending: false })

    attempts?.forEach(a => {
      if (!attemptsMap[a.unit_id] || a.stars > attemptsMap[a.unit_id].stars) {
        attemptsMap[a.unit_id] = { stars: a.stars, passed: a.passed }
      }
    })
  }

  // Get user progress for current_unit
  let currentUnit = 1
  if (user) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('current_unit')
      .eq('user_id', user.id)
      .eq('lesson_id', id)
      .single()
    currentUnit = progress?.current_unit ?? 1
  }

  const unitsWithStatus = units.map(unit => ({
    ...unit,
    locked: user ? unit.number > currentUnit : unit.number > 1,
    best_stars: attemptsMap[unit.id]?.stars ?? 0,
    completed: !!attemptsMap[unit.id]?.passed
  }))

  return NextResponse.json({ units: unitsWithStatus, current_unit: currentUnit })
}
