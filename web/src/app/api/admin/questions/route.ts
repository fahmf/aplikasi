import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

async function requireAdmin(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) return null
  return supabase
}

// GET /api/admin/questions?unit_id=...
export async function GET(req: NextRequest) {
  const supabase = await requireAdmin(req)
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const unit_id = searchParams.get('unit_id')

  let query = supabase
    .from('questions')
    .select('*, choices(*)')
    .order('sort_order')

  if (unit_id) query = query.eq('unit_id', unit_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ questions: data })
}

// POST /api/admin/questions — create question with choices
export async function POST(req: NextRequest) {
  const supabase = await requireAdmin(req)
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { unit_id, type, prompt_ar, context_ar, explanation_ar, media_url, xp_reward, difficulty, choices, is_published } = body

  if (!unit_id || !type || !prompt_ar) {
    return NextResponse.json({ error: 'unit_id, type, prompt_ar required' }, { status: 400 })
  }

  const { data: question, error } = await supabase
    .from('questions')
    .insert({ unit_id, type, prompt_ar, context_ar, explanation_ar, media_url, xp_reward: xp_reward ?? 10, difficulty: difficulty ?? 'medium', is_published: is_published ?? false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (choices && choices.length > 0) {
    const choiceRows = choices.map((c: { text_ar: string; is_correct?: boolean; sort_order?: number; pair_key?: string }, i: number) => ({
      question_id: question.id,
      text_ar: c.text_ar,
      is_correct: c.is_correct ?? false,
      sort_order: c.sort_order ?? i,
      pair_key: c.pair_key ?? null
    }))

    const { error: choiceErr } = await supabase.from('choices').insert(choiceRows)
    if (choiceErr) return NextResponse.json({ error: choiceErr.message }, { status: 500 })
  }

  return NextResponse.json({ question }, { status: 201 })
}
