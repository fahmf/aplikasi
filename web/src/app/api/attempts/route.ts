import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// POST /api/attempts — start a new attempt
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { unit_id } = body

  if (!unit_id) return NextResponse.json({ error: 'unit_id required' }, { status: 400 })

  // Check hearts
  const { data: progress } = await supabase
    .from('user_progress')
    .select('hearts, lesson_id')
    .eq('user_id', user.id)
    .eq('lesson_id', (
      await supabase.from('units').select('lesson_id').eq('id', unit_id).single()
    ).data?.lesson_id ?? '')
    .single()

  if (progress && progress.hearts <= 0) {
    return NextResponse.json({ error: 'No hearts left. Wait or watch an ad to continue.' }, { status: 403 })
  }

  const { data: attempt, error } = await supabase
    .from('attempts')
    .insert({ user_id: user.id, unit_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ attempt }, { status: 201 })
}
