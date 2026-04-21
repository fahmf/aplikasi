export const dynamic = 'force-dynamic'
import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'
import type { Lesson } from '@/types/database'

type LessonWithStats = Lesson & { unitCount: number; questionCount: number }

async function getLessonsWithStats(): Promise<LessonWithStats[]> {
  const supabase = createServiceClient()
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .order('sort_order')

  if (!lessons || lessons.length === 0) return []

  const lessonsWithStats = await Promise.all(
    lessons.map(async (lesson) => {
      const [{ count: unitCount }, { count: questionCount }] = await Promise.all([
        supabase.from('units').select('*', { count: 'exact', head: true }).eq('lesson_id', lesson.id),
        supabase.from('questions')
          .select('*, units!inner(lesson_id)', { count: 'exact', head: true })
          .eq('is_published', true)
          .eq('units.lesson_id', lesson.id)
      ])
      return { ...lesson, unitCount: unitCount ?? 0, questionCount: questionCount ?? 0 }
    })
  )

  return lessonsWithStats
}

export default async function LessonsPage() {
  const lessons = await getLessonsWithStats()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Pelajaran</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola mata pelajaran: Qiraah, Imla&apos;, Balaghah</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Tambah Pelajaran
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {lessons.map(lesson => (
          <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{lesson.icon}</div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${lesson.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {lesson.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <h3 className="font-extrabold text-gray-900 mb-0.5">{lesson.name_id}</h3>
            <p className="text-right font-cairo text-lg text-gray-700 mb-3" dir="rtl">{lesson.name_ar}</p>
            <div className="flex gap-3 text-xs text-gray-500 mb-4">
              <span>{lesson.unitCount} Wahdah</span>
              <span>·</span>
              <span>{lesson.questionCount} Soal Live</span>
            </div>
            <Link
              href={`/lessons/${lesson.id}`}
              className="flex items-center justify-between w-full text-sm text-emerald-700 font-semibold hover:underline"
            >
              Kelola Wahdah & Soal <ChevronRight size={16} />
            </Link>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <p className="font-medium">Belum ada pelajaran</p>
          </div>
        )}
      </div>
    </div>
  )
}
