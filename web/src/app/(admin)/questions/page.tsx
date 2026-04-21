'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, Clock } from 'lucide-react'
import QuestionForm from '@/components/admin/QuestionForm'
import type { Question, Choice, Unit, Lesson } from '@/types/database'

type QuestionWithChoices = Question & { choices: Choice[] }

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([])
  const [units, setUnits] = useState<(Unit & { lesson?: Lesson })[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithChoices | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUnits()
  }, [])

  useEffect(() => {
    if (selectedUnitId) fetchQuestions()
  }, [selectedUnitId])

  async function fetchUnits() {
    const res = await fetch('/api/admin/units')
    const data = await res.json()
    setUnits(data.units ?? [])
  }

  async function fetchQuestions() {
    setLoading(true)
    const res = await fetch(`/api/admin/questions?unit_id=${selectedUnitId}`)
    const data = await res.json()
    setQuestions(data.questions ?? [])
    setLoading(false)
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Hapus soal ini?')) return
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    fetchQuestions()
  }

  const typeLabels: Record<string, string> = {
    mcq: 'MCQ',
    mcq_harakat: 'MCQ Harakat',
    arrange: 'Susun Kata',
    match: 'Cocokkan'
  }

  const typeColors: Record<string, string> = {
    mcq: 'bg-blue-100 text-blue-700',
    mcq_harakat: 'bg-purple-100 text-purple-700',
    arrange: 'bg-amber-100 text-amber-700',
    match: 'bg-rose-100 text-rose-700'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Soal</h1>
          <p className="text-gray-500 text-sm mt-1">Input dan kelola soal per wahdah</p>
        </div>
        <button
          onClick={() => { setEditingQuestion(null); setShowForm(true) }}
          disabled={!selectedUnitId}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Tambah Soal
        </button>
      </div>

      {/* Unit selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pilih Wahdah</label>
        <select
          value={selectedUnitId}
          onChange={e => setSelectedUnitId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">— Pilih Wahdah —</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>
              {u.lesson?.name_id} › Wahdah {u.number} · {u.title_ar}
              {u.is_checkpoint ? ' [Checkpoint]' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Question table */}
      {selectedUnitId && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">
              Daftar Soal
              <span className="ml-2 text-gray-400 font-normal text-sm">({questions.length} soal)</span>
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Memuat...</div>
          ) : questions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="font-medium">Belum ada soal</p>
              <p className="text-sm">Klik &quot;Tambah Soal&quot; untuk mulai</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-5 py-3 text-left w-8">#</th>
                  <th className="px-5 py-3 text-right">Prompt</th>
                  <th className="px-5 py-3 text-left">Tipe</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Jawaban</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <tr key={q.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-3 text-right font-cairo text-base text-gray-800 max-w-xs truncate" dir="rtl">
                      {q.prompt_ar}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[q.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {typeLabels[q.type] ?? q.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {q.is_published ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle size={13} /> Live</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold"><Clock size={13} /> Draft</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{q.choices.length} opsi</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setEditingQuestion(q); setShowForm(true) }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <QuestionForm
          unitId={selectedUnitId}
          question={editingQuestion}
          onClose={() => { setShowForm(false); setEditingQuestion(null) }}
          onSaved={() => { setShowForm(false); setEditingQuestion(null); fetchQuestions() }}
        />
      )}
    </div>
  )
}
