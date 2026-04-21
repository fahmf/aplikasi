import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your values.')
  return createClient<Database>(url, key)
}

let _client: ReturnType<typeof createClient<Database>> | null = null

export function getClient() {
  if (!_client) _client = getSupabaseClient()
  return _client
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role env vars.')
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
