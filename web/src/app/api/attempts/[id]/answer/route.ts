import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// POST /api/attempts/:id/answer — submit one answer; server checks correctness
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

  // Verify attempt belongs to user
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

  const body = await req.json()
  const { question_id, response, time_ms } = body

  // Fetch the question with correct answers (server-side only)
  const { data: question } = await supabase
    .from('questions')
    .select('id, type, choices(*)')
    .eq('id', question_id)
    .single()

  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  // Verify correctness server-side
  let is_correct = false
  const choices = question.choices ?? []

  if (question.type === 'mcq' || question.type === 'mcq_harakat') {
    const selectedId = response?.choice_id
    const correct = choices.find(c => c.is_correct)
    is_correct = correct?.id === selectedId
  } else if (question.type === 'arrange') {
    const userOrder: string[] = response?.order ?? []
    const correctOrder = [...choices]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => c.id)
    is_correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder)
  } else if (question.type === 'match') {
    const userPairs: [string, string][] = response?.pairs ?? []
    const correctPairs = choices.reduce<Record<string, string>>((acc, c) => {
      if (c.pair_key) acc[c.id] = c.pair_key
      return acc
    }, {})
    is_correct = userPairs.every(([a, b]) => correctPairs[a] === correctPairs[b] || correctPairs[b] === correctPairs[a])
      && userPairs.length === Object.keys(correctPairs).length / 2
  }

  // Save answer
  await supabase.from('answers').insert({
    attempt_id: attemptId,
    question_id,
    response,
    is_correct,
    time_ms
  })

  // Reduce heart if wrong
  if (!is_correct) {
    const { data: unit } = await supabase.from('units').select('lesson_id').eq('id', attempt.unit_id).single()
    if (unit) {
      // Read current hearts then decrement
      const { data: prog } = await supabase
        .from('user_progress')
        .select('hearts')
        .eq('user_id', user.id)
        .eq('lesson_id', unit.lesson_id)
        .single()
      if (prog && prog.hearts > 0) {
        await supabase
          .from('user_progress')
          .update({ hearts: prog.hearts - 1 })
          .eq('user_id', user.id)
          .eq('lesson_id', unit.lesson_id)
      }
    }
  }

  // Return feedback with correct answer revealed
  const correctChoice = choices.find(c => c.is_correct)
  return NextResponse.json({
    is_correct,
    correct_choice_id: correctChoice?.id,
    explanation_ar: null  // will be returned on finish
  })
}
