import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// POST /api/admin/import — bulk import questions from CSV/JSON
// Expected JSON body: { unit_id, questions: [{type, prompt_ar, choices: [{text_ar, is_correct}], explanation_ar}] }
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
  const { unit_id, questions } = body

  if (!unit_id || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'unit_id and questions array required' }, { status: 400 })
  }

  const results = { created: 0, errors: [] as string[] }

  for (const [i, q] of questions.entries()) {
    if (!q.prompt_ar || !q.type) {
      results.errors.push(`Row ${i + 1}: prompt_ar and type required`)
      continue
    }

    const { data: question, error: qErr } = await supabase
      .from('questions')
      .insert({
        unit_id,
        type: q.type,
        prompt_ar: q.prompt_ar,
        context_ar: q.context_ar ?? null,
        explanation_ar: q.explanation_ar ?? null,
        xp_reward: q.xp_reward ?? 10,
        difficulty: q.difficulty ?? 'medium',
        sort_order: i
      })
      .select('id')
      .single()

    if (qErr) { results.errors.push(`Row ${i + 1}: ${qErr.message}`); continue }

    if (q.choices && q.choices.length > 0) {
      const choiceRows = q.choices.map((c: { text_ar: string; is_correct?: boolean; sort_order?: number }, j: number) => ({
        question_id: question.id,
        text_ar: c.text_ar,
        is_correct: c.is_correct ?? false,
        sort_order: c.sort_order ?? j
      }))
      const { error: cErr } = await supabase.from('choices').insert(choiceRows)
      if (cErr) results.errors.push(`Row ${i + 1} choices: ${cErr.message}`)
    }

    results.created++
  }

  return NextResponse.json(results, { status: results.errors.length > 0 ? 207 : 201 })
}
