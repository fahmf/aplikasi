'use client'

import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import type { HighlightColor } from '@/types/reader'
import type { SelectionInfo } from './TextViewer'

interface HighlightToolbarProps {
  selection: SelectionInfo
  onHighlight: (color: HighlightColor) => void
  onDismiss: () => void
}

const COLORS: { value: HighlightColor; bg: string; ring: string; label: string }[] = [
  { value: 'yellow', bg: '#FEF9C3', ring: '#EAB308', label: 'Kuning' },
  { value: 'blue',   bg: '#DBEAFE', ring: '#3B82F6', label: 'Biru' },
  { value: 'green',  bg: '#DCFCE7', ring: '#22C55E', label: 'Hijau' },
  { value: 'pink',   bg: '#FCE7F3', ring: '#EC4899', label: 'Merah Muda' },
]

export default function HighlightToolbar({ selection, onHighlight, onDismiss }: HighlightToolbarProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Dismiss on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onDismiss])

  const toolbarWidth = 200
  const vpWidth = window.innerWidth
  const rawLeft = selection.x - toolbarWidth / 2
  const left = Math.max(8, Math.min(rawLeft, vpWidth - toolbarWidth - 8))
  const top = selection.y - 52

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-1.5 bg-white border border-stone-200 shadow-xl rounded-full px-3 py-2"
      style={{ left, top, width: toolbarWidth }}
    >
      {/* Arrow pointer */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-stone-200 rotate-45"
        style={{ left: selection.x - left + 'px' }}
      />

      <span className="text-xs text-stone-400 font-medium mr-1">Tandai</span>

      {COLORS.map(c => (
        <button
          key={c.value}
          title={c.label}
          onClick={() => onHighlight(c.value)}
          className="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition-transform shadow-sm flex-shrink-0"
          style={{ background: c.bg, outline: `2px solid ${c.ring}` }}
        />
      ))}

      <div className="w-px h-4 bg-stone-200 mx-0.5" />

      <button
        onClick={onDismiss}
        title="Batal"
        className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
