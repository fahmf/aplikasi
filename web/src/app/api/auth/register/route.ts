import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, username, full_name } = body

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'email, password, username required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check username availability
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username sudah dipakai' }, { status: 409 })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, full_name }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ user_id: data.user.id }, { status: 201 })
}
