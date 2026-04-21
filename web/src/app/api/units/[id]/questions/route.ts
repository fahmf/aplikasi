import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// GET /api/units/:id/questions — serve questions for a quiz session (no correct answers leaked)
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify unit is published
  const { data: unit } = await supabase
    .from('units')
    .select('id, question_count, is_published, is_checkpoint')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })

  // Get questions WITHOUT is_correct exposed
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id, unit_id, type, prompt_ar, context_ar, explanation_ar, media_url, xp_reward, sort_order, difficulty,
      choices(id, text_ar, sort_order, pair_key)
    `)
    .eq('unit_id', id)
    .eq('is_published', true)
    .order('sort_order')
    .limit(unit.question_count)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Shuffle choices for MCQ (prevent memorizing position)
  const shuffled = questions.map(q => ({
    ...q,
    choices: [...(q.choices ?? [])].sort(() => Math.random() - 0.5)
  }))

  return NextResponse.json({ questions: shuffled, unit })
}
