import { supabase } from './supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
  }
}

export async function getLessons() {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/lessons`, { headers })
  return res.json()
}

export async function getLessonUnits(lessonId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/lessons/${lessonId}/units`, { headers })
  return res.json()
}

export async function getUnitQuestions(unitId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/units/${unitId}/questions`, { headers })
  return res.json()
}

export async function startAttempt(unitId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/attempts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ unit_id: unitId })
  })
  return res.json()
}

export async function submitAnswer(attemptId: string, questionId: string, response: unknown, timeMs: number) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/attempts/${attemptId}/answer`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question_id: questionId, response, time_ms: timeMs })
  })
  return res.json()
}

export async function finishAttempt(attemptId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/attempts/${attemptId}/finish`, {
    method: 'POST',
    headers
  })
  return res.json()
}

export async function getLeaderboard(params: { lesson_id?: string; class_id?: string }) {
  const headers = await getAuthHeaders()
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${API_URL}/api/leaderboard${qs ? `?${qs}` : ''}`, { headers })
  return res.json()
}
