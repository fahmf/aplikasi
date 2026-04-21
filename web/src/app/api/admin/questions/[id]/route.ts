import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

async function requireAdmin() {
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

// PUT /api/admin/questions/:id — update question and replace choices
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { choices, ...fields } = body

  const { data: question, error } = await supabase
    .from('questions')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (choices) {
    // Replace all choices
    await supabase.from('choices').delete().eq('question_id', id)
    const choiceRows = choices.map((c: { text_ar: string; is_correct?: boolean; sort_order?: number; pair_key?: string }, i: number) => ({
      question_id: id,
      text_ar: c.text_ar,
      is_correct: c.is_correct ?? false,
      sort_order: c.sort_order ?? i,
      pair_key: c.pair_key ?? null
    }))
    await supabase.from('choices').insert(choiceRows)
  }

  return NextResponse.json({ question })
}

// DELETE /api/admin/questions/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
