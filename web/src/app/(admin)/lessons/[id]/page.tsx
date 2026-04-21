export const dynamic = 'force-dynamic'
import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Lesson, Unit } from '@/types/database'

type UnitWithQCount = Unit & { publishedQ: number; totalQ: number }

async function getLessonWithUnits(lessonId: string): Promise<{ lesson: Lesson; units: UnitWithQCount[] } | null> {
  const supabase = createServiceClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) return null

  const { data: units } = await supabase
    .from('units')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('number')

  if (!units) return { lesson, units: [] }

  const unitsWithQ = await Promise.all(
    units.map(async (unit) => {
      const [{ count: totalQ }, { count: publishedQ }] = await Promise.all([
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('unit_id', unit.id),
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('unit_id', unit.id).eq('is_published', true)
      ])
      return { ...unit, totalQ: totalQ ?? 0, publishedQ: publishedQ ?? 0 }
    })
  )

  return { lesson, units: unitsWithQ }
}

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getLessonWithUnits(id)
  if (!data) notFound()

  const { lesson, units } = data

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-xs text-gray-400 mb-4">
        <Link href="/lessons" className="hover:text-emerald-600">Pelajaran</Link>
        {' › '}
        <span className="text-gray-600 font-medium">{lesson.name_id}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <span>{lesson.icon}</span>
          {lesson.name_id}
          <span className="text-gray-400 font-cairo font-semibold text-xl" dir="rtl">({lesson.name_ar})</span>
        </h1>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Tambah Wahdah
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {units.map(unit => {
          const isReady = unit.publishedQ >= unit.question_count
          return (
            <div key={unit.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`px-4 py-3 flex items-center justify-between ${unit.is_checkpoint ? 'bg-amber-50 border-b border-amber-100' : 'border-b border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{unit.number}</span>
                  <div>
                    <span className="text-sm font-bold text-gray-900" dir="rtl">{unit.title_ar}</span>
                    {unit.is_checkpoint && <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Checkpoint</span>}
                  </div>
                </div>
                {unit.is_published ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle size={13} /> Live</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold"><Lock size={13} /> Draft</span>
                )}
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Soal live:</span>
                  <span className={`font-semibold flex items-center gap-1 ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {unit.publishedQ}/{unit.question_count}
                    {!isReady && <AlertCircle size={12} />}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div
                    className={`h-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (unit.publishedQ / unit.question_count) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Lulus: {unit.passing_score}% · {unit.xp_reward} XP · {unit.totalQ} total soal
                </div>
                <Link
                  href={`/questions?unit_id=${unit.id}`}
                  className="block w-full text-center py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                >
                  Kelola Soal
                </Link>
              </div>
            </div>
          )
        })}

        {units.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <p className="font-medium">Belum ada wahdah</p>
            <p className="text-sm">Klik &quot;Tambah Wahdah&quot; untuk mulai</p>
          </div>
        )}
      </div>
    </div>
  )
}
