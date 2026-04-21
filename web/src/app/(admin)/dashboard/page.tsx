export const dynamic = 'force-dynamic'
import { createServiceClient } from '@/lib/supabase'
import { Users, GraduationCap, TrendingUp } from 'lucide-react'

type ActivityItem = {
  id: string
  score: number | null
  passed: boolean
  finished_at: string | null
  username: string | null
  unit_title_ar: string | null
}

async function getStats() {
  const supabase = createServiceClient()
  const [
    { count: totalStudents },
    { count: totalQuestions },
    { count: totalUnits },
    { count: totalAttempts }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('units').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('attempts').select('*', { count: 'exact', head: true }).not('finished_at', 'is', null)
  ])
  return {
    totalStudents: totalStudents ?? 0,
    totalQuestions: totalQuestions ?? 0,
    totalUnits: totalUnits ?? 0,
    totalAttempts: totalAttempts ?? 0
  }
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = createServiceClient()

  // Separate queries to avoid TS issues with nested selects
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, score, passed, finished_at, user_id, unit_id')
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(10)

  if (!attempts || attempts.length === 0) return []

  const userIds = [...new Set(attempts.map(a => a.user_id))]
  const unitIds = [...new Set(attempts.map(a => a.unit_id))]

  const [{ data: profiles }, { data: units }] = await Promise.all([
    supabase.from('profiles').select('id, username').in('id', userIds),
    supabase.from('units').select('id, title_ar').in('id', unitIds)
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.username]))
  const unitMap = Object.fromEntries((units ?? []).map(u => [u.id, u.title_ar]))

  return attempts.map(a => ({
    id: a.id,
    score: a.score,
    passed: a.passed,
    finished_at: a.finished_at,
    username: profileMap[a.user_id] ?? null,
    unit_title_ar: unitMap[a.unit_id] ?? null
  }))
}

export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()])

  const statCards = [
    { label: 'Total Murid', value: stats.totalStudents, icon: Users, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Soal Live', value: stats.totalQuestions, icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Wahdah Aktif', value: stats.totalUnits, icon: GraduationCap, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Total Percobaan', value: stats.totalAttempts, icon: TrendingUp, color: 'bg-amber-50 text-amber-700 border-amber-200' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
            <card.icon size={20} className="mb-3 opacity-70" />
            <div className="text-3xl font-extrabold">{card.value.toLocaleString()}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Aktivitas Terbaru</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <th className="px-5 py-3 text-left">Murid</th>
              <th className="px-5 py-3 text-right">Wahdah</th>
              <th className="px-5 py-3 text-left">Skor</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((a) => (
              <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{a.username ?? '-'}</td>
                <td className="px-5 py-3 text-gray-600 text-right font-cairo" dir="rtl">{a.unit_title_ar ?? '-'}</td>
                <td className="px-5 py-3 font-mono font-semibold">{a.score}%</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${a.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {a.passed ? 'Lulus' : 'Gagal'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {a.finished_at ? new Date(a.finished_at).toLocaleString('id-ID') : '-'}
                </td>
              </tr>
            ))}
            {activity.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Belum ada aktivitas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
