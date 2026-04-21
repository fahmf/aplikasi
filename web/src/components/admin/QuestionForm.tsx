'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import type { Question, Choice } from '@/types/database'

type QuestionWithChoices = Question & { choices: Choice[] }

interface Props {
  unitId: string
  question: QuestionWithChoices | null
  onClose: () => void
  onSaved: () => void
}

const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ — Pilihan Ganda' },
  { value: 'mcq_harakat', label: 'MCQ Harakat — Dengan harakat/syakal' },
  { value: 'arrange', label: 'Arrange — Susun Kata' },
  { value: 'match', label: 'Match — Cocokkan Pasangan' }
]

interface ChoiceInput {
  id?: string
  text_ar: string
  is_correct: boolean
  sort_order: number
  pair_key: string
}

export default function QuestionForm({ unitId, question, onClose, onSaved }: Props) {
  const [type, setType] = useState(question?.type ?? 'mcq')
  const [promptAr, setPromptAr] = useState(question?.prompt_ar ?? '')
  const [contextAr, setContextAr] = useState(question?.context_ar ?? '')
  const [explanationAr, setExplanationAr] = useState(question?.explanation_ar ?? '')
  const [xpReward, setXpReward] = useState(question?.xp_reward ?? 10)
  const [isPublished, setIsPublished] = useState(question?.is_published ?? false)
  const [choices, setChoices] = useState<ChoiceInput[]>(
    question?.choices?.map((c, i) => ({ ...c, pair_key: c.pair_key ?? '', sort_order: c.sort_order ?? i })) ??
    [
      { text_ar: '', is_correct: false, sort_order: 0, pair_key: '' },
      { text_ar: '', is_correct: false, sort_order: 1, pair_key: '' },
      { text_ar: '', is_correct: false, sort_order: 2, pair_key: '' },
      { text_ar: '', is_correct: false, sort_order: 3, pair_key: '' }
    ]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateChoice(i: number, field: keyof ChoiceInput, value: string | boolean | number) {
    setChoices(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  function setCorrect(i: number) {
    if (type === 'mcq' || type === 'mcq_harakat') {
      // Only one correct for MCQ
      setChoices(prev => prev.map((c, idx) => ({ ...c, is_correct: idx === i })))
    } else {
      updateChoice(i, 'is_correct', !choices[i].is_correct)
    }
  }

  async function handleSave(publish: boolean) {
    if (!promptAr.trim()) { setError('Prompt wajib diisi'); return }
    if (choices.some(c => !c.text_ar.trim())) { setError('Semua opsi jawaban wajib diisi'); return }
    if ((type === 'mcq' || type === 'mcq_harakat') && !choices.some(c => c.is_correct)) {
      setError('Tandai satu jawaban yang benar'); return
    }

    setSaving(true)
    setError('')

    const body = {
      unit_id: unitId,
      type,
      prompt_ar: promptAr,
      context_ar: contextAr || null,
      explanation_ar: explanationAr || null,
      xp_reward: xpReward,
      is_published: publish,
      choices: choices.map((c, i) => ({
        text_ar: c.text_ar,
        is_correct: c.is_correct,
        sort_order: i,
        pair_key: c.pair_key || null
      }))
    }

    const url = question ? `/api/admin/questions/${question.id}` : '/api/admin/questions'
    const method = question ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Terjadi kesalahan')
      setSaving(false)
      return
    }

    onSaved()
  }

  const letterLabels = ['أ', 'ب', 'ج', 'د', 'هـ', 'و']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {question ? 'Edit Soal' : 'Tambah Soal Baru'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipe Soal</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as Question['type'])}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {QUESTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Pertanyaan (عربي) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={promptAr}
              onChange={e => setPromptAr(e.target.value)}
              dir="rtl"
              rows={2}
              placeholder="اكتب السؤال هنا..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-cairo text-right focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg"
            />
          </div>

          {/* Context */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Konteks / Kalimat (opsional)
            </label>
            <textarea
              value={contextAr}
              onChange={e => setContextAr(e.target.value)}
              dir="rtl"
              rows={2}
              placeholder="الجملة السياقية..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-cairo text-right focus:outline-none focus:ring-2 focus:ring-emerald-400 text-base"
            />
          </div>

          {/* Choices */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Opsi Jawaban {(type === 'mcq' || type === 'mcq_harakat') && '(pilih satu yang benar)'}
              </label>
              <button
                onClick={() => setChoices(prev => [...prev, { text_ar: '', is_correct: false, sort_order: prev.length, pair_key: '' }])}
                className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Tambah opsi
              </button>
            </div>
            <div className="space-y-2">
              {choices.map((c, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${c.is_correct ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                  <button
                    onClick={() => setCorrect(i)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${c.is_correct ? 'bg-amber-400 text-white' : 'bg-emerald-600 text-white'}`}
                  >
                    {c.is_correct ? <Check size={14} /> : letterLabels[i] ?? String.fromCharCode(65 + i)}
                  </button>
                  <input
                    value={c.text_ar}
                    onChange={e => updateChoice(i, 'text_ar', e.target.value)}
                    dir="rtl"
                    placeholder="أدخل الخيار..."
                    className="flex-1 border-0 bg-transparent text-right font-cairo text-base focus:outline-none placeholder-gray-300"
                  />
                  {type === 'match' && (
                    <input
                      value={c.pair_key}
                      onChange={e => updateChoice(i, 'pair_key', e.target.value)}
                      placeholder="pair"
                      className="w-16 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  )}
                  {choices.length > 2 && (
                    <button
                      onClick={() => setChoices(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-1 hover:text-red-500 text-gray-300 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Penjelasan Jawaban (opsional)
            </label>
            <textarea
              value={explanationAr}
              onChange={e => setExplanationAr(e.target.value)}
              dir="rtl"
              rows={2}
              placeholder="اشرح الإجابة الصحيحة..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-cairo text-right focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* XP */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">XP</label>
              <input
                type="number"
                value={xpReward}
                onChange={e => setXpReward(parseInt(e.target.value))}
                min={1}
                max={100}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Simpan Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Publish ke Wahdah'}
          </button>
        </div>
      </div>
    </div>
  )
}
