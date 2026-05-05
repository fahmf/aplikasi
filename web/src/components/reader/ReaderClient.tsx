'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Headphones, HighlighterIcon, Settings2, X,
  BookMarked, Loader2, AlertCircle, PanelRightOpen, PanelRightClose,
  Minus, Plus, StickyNote, Trash2
} from 'lucide-react'
import type { ReaderDocument, Highlight, HighlightColor, ReadingSettings } from '@/types/reader'
import { DEFAULT_SETTINGS, formatFileSize } from '@/types/reader'
import {
  getDocument, getFile, getHighlightsForDoc,
  saveHighlight, deleteHighlight, updateReadProgress, getSettings, saveSettings
} from '@/lib/reader-storage'
import dynamic from 'next/dynamic'
import type { SelectionInfo } from './TextViewer'

const PDFViewer  = dynamic(() => import('./PDFViewer'),  { ssr: false, loading: () => <Spinner /> })
const EPUBViewer = dynamic(() => import('./EPUBViewer'), { ssr: false, loading: () => <Spinner /> })
const TextViewer = dynamic(() => import('./TextViewer'), { ssr: false, loading: () => <Spinner /> })
const AudioBar   = dynamic(() => import('./AudioBar'),   { ssr: false })
const HighlightToolbar = dynamic(() => import('./HighlightToolbar'), { ssr: false })

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-stone-400" />
    </div>
  )
}

function HighlightDot({ color }: { color: HighlightColor }) {
  const bg: Record<HighlightColor, string> = {
    yellow: '#EAB308', blue: '#3B82F6', green: '#22C55E', pink: '#EC4899'
  }
  return <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: bg[color] }} />
}

interface SettingsPanelProps {
  settings: ReadingSettings
  onChange: (s: ReadingSettings) => void
  onClose: () => void
}

function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-2xl p-6 w-full max-w-sm z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-playfair font-bold text-stone-900">Preferensi Baca</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1"><X size={18} /></button>
        </div>

        {/* Font size */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Ukuran Teks</label>
          <div className="flex items-center gap-3">
            <button onClick={() => onChange({ ...settings, fontSize: Math.max(14, settings.fontSize - 1) })}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"><Minus size={15} /></button>
            <span className="text-sm font-medium text-stone-700 tabular-nums w-12 text-center">{settings.fontSize}px</span>
            <button onClick={() => onChange({ ...settings, fontSize: Math.min(28, settings.fontSize + 1) })}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"><Plus size={15} /></button>
          </div>
        </div>

        {/* Theme */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Tema</label>
          <div className="flex gap-2">
            {(['light', 'sepia', 'dark'] as const).map(t => {
              const labels = { light: 'Terang', sepia: 'Sepia', dark: 'Gelap' }
              const bgs = { light: '#FAFAF8', sepia: '#F5F0E8', dark: '#1C1917' }
              const texts = { light: '#1C1917', sepia: '#4A3728', dark: '#F5F0E8' }
              return (
                <button
                  key={t}
                  onClick={() => onChange({ ...settings, theme: t })}
                  className={`flex-1 py-3 rounded text-xs font-medium border-2 transition-colors ${settings.theme === t ? 'border-stone-700' : 'border-stone-200'}`}
                  style={{ background: bgs[t], color: texts[t] }}
                >
                  {labels[t]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Column width */}
        <div>
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Lebar Kolom</label>
          <div className="flex gap-2">
            {(['narrow', 'medium', 'wide'] as const).map(w => {
              const labels = { narrow: 'Sempit', medium: 'Standar', wide: 'Lebar' }
              return (
                <button
                  key={w}
                  onClick={() => onChange({ ...settings, columnWidth: w })}
                  className={`flex-1 py-2 rounded text-xs font-medium border transition-colors ${settings.columnWidth === w ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  {labels[w]}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface HighlightsPanelProps {
  highlights: Highlight[]
  onDelete: (id: string) => void
  onClose: () => void
}

function HighlightsPanel({ highlights, onDelete, onClose }: HighlightsPanelProps) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-stone-200 bg-white flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <h3 className="text-sm font-semibold text-stone-800">Anotasi ({highlights.length})</h3>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1 rounded hover:bg-stone-100">
          <X size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {highlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <StickyNote size={28} className="text-stone-200 mb-3" strokeWidth={1} />
            <p className="text-sm text-stone-400">Belum ada anotasi.</p>
            <p className="text-xs text-stone-400 mt-1">Pilih teks dan tandai warna untuk membuat anotasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {highlights.map(hl => (
              <div key={hl.id} className="group px-4 py-3 hover:bg-stone-50 transition-colors">
                <div className="flex items-start gap-2">
                  <HighlightDot color={hl.color} />
                  <p className="text-sm text-stone-700 leading-snug flex-1 line-clamp-3 font-lora">
                    &ldquo;{hl.text}&rdquo;
                  </p>
                  <button
                    onClick={() => onDelete(hl.id)}
                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-all p-0.5 flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-1 ml-4">
                  {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(hl.createdAt))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const COLUMN_WIDTHS = { narrow: '55ch', medium: '70ch', wide: '90ch' }

const THEME_STYLES: Record<string, { bg: string; text: string; secondary: string }> = {
  light: { bg: '#FAFAF8', text: '#1C1917', secondary: '#78716C' },
  sepia: { bg: '#F5F0E8', text: '#3C2F1A', secondary: '#7A6550' },
  dark:  { bg: '#1C1917', text: '#E7E5E4', secondary: '#A8A29E' },
}

export default function ReaderClient({ documentId }: { documentId: string }) {
  const router = useRouter()
  const [doc, setDoc] = useState<ReaderDocument | null>(null)
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null)
  const [textContent, setTextContent] = useState('')
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS)
  const [progress, setProgress] = useState(0)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [showAudio, setShowAudio] = useState(false)
  const [showHighlightPanel, setShowHighlightPanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selection, setSelection] = useState<SelectionInfo | null>(null)

  // Load doc + file + highlights + settings on mount
  useEffect(() => {
    async function load() {
      try {
        const [docData, storedSettings] = await Promise.all([
          getDocument(documentId),
          getSettings(),
        ])
        if (!docData) { setError('Dokumen tidak ditemukan.'); setLoading(false); return }
        setDoc(docData)
        if (storedSettings) setSettings(storedSettings)
        setProgress(docData.readProgress ?? 0)

        const [fileBuffer, storedHighlights] = await Promise.all([
          getFile(documentId),
          getHighlightsForDoc(documentId),
        ])
        if (!fileBuffer) { setError('File tidak ditemukan di penyimpanan.'); setLoading(false); return }
        setBuffer(fileBuffer)
        setHighlights(storedHighlights)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setError('Gagal memuat dokumen.')
        setLoading(false)
      }
    }
    load()
  }, [documentId])

  // Save progress periodically
  const progressRef = useRef(progress)
  progressRef.current = progress
  useEffect(() => {
    if (!doc) return
    const id = setInterval(() => {
      updateReadProgress(documentId, progressRef.current).catch(console.error)
    }, 10000)
    return () => clearInterval(id)
  }, [doc, documentId])

  const handleProgressChange = useCallback((pct: number) => setProgress(pct), [])
  const handlePageCount = useCallback((n: number) => setPageCount(n), [])
  const handleTextExtracted = useCallback((t: string) => setTextContent(t), [])

  const handleHighlight = useCallback(async (color: HighlightColor) => {
    if (!selection || !doc) return
    const hl: Highlight = {
      id: crypto.randomUUID(),
      documentId: doc.id,
      text: selection.text,
      color,
      createdAt: new Date().toISOString(),
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      paragraphIndex: selection.paragraphIndex,
    }
    await saveHighlight(hl)
    setHighlights(prev => [hl, ...prev])
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }, [selection, doc])

  const handleDeleteHighlight = useCallback(async (id: string) => {
    await deleteHighlight(id)
    setHighlights(prev => prev.filter(h => h.id !== id))
  }, [])

  const handleSettingsChange = useCallback((s: ReadingSettings) => {
    setSettings(s)
    saveSettings(s).catch(console.error)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen reader-paper flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-stone-400" />
          <p className="text-sm text-stone-400">Membuka dokumen...</p>
        </div>
      </div>
    )
  }

  if (error || !doc || !buffer) {
    return (
      <div className="min-h-screen reader-paper flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <AlertCircle size={40} className="text-red-300" strokeWidth={1} />
          <p className="text-stone-700 font-medium">{error ?? 'Dokumen tidak ditemukan.'}</p>
          <button onClick={() => router.push('/reader')} className="text-sm text-stone-500 hover:text-stone-800 underline">
            Kembali ke perpustakaan
          </button>
        </div>
      </div>
    )
  }

  const theme = THEME_STYLES[settings.theme] ?? THEME_STYLES.light
  const maxWidth = COLUMN_WIDTHS[settings.columnWidth]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.bg, color: theme.text }}
    >
      {/* Reading progress bar */}
      <div className="reading-progress-bar" style={{ width: `${progress}%`, background: theme.text }} />

      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 border-b"
        style={{ background: theme.bg + 'F0', borderColor: theme.text + '15', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={() => { updateReadProgress(documentId, progress); router.push('/reader') }}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: theme.secondary }}
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Perpustakaan</span>
        </button>

        <div className="w-px h-4 mx-2" style={{ background: theme.text + '20' }} />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1
            className="font-playfair font-semibold truncate text-sm sm:text-base leading-tight"
            style={{ color: theme.text }}
            dir={doc.isRTL ? 'rtl' : undefined}
          >
            {doc.title}
          </h1>
          {doc.author && (
            <p className="text-xs truncate hidden sm:block" style={{ color: theme.secondary }}>{doc.author}</p>
          )}
        </div>

        {/* Progress + page info */}
        <div className="hidden md:flex items-center gap-1 text-xs" style={{ color: theme.secondary }}>
          <span className="tabular-nums">{progress}%</span>
          {pageCount && <span>· {pageCount} hal</span>}
        </div>

        <div className="w-px h-4" style={{ background: theme.text + '15' }} />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAudio(v => !v)}
            title="Audio podcast"
            className={`p-2 rounded transition-colors ${showAudio ? 'bg-stone-900 text-white' : ''}`}
            style={showAudio ? {} : { color: theme.secondary }}
          >
            <Headphones size={17} />
          </button>
          <button
            onClick={() => setShowHighlightPanel(v => !v)}
            title="Anotasi"
            className={`p-2 rounded transition-colors`}
            style={{ color: showHighlightPanel ? theme.text : theme.secondary }}
          >
            {showHighlightPanel ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
          </button>
          <button
            onClick={() => setShowSettings(v => !v)}
            title="Pengaturan"
            className="p-2 rounded transition-colors"
            style={{ color: theme.secondary }}
          >
            <Settings2 size={17} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Main reading area */}
        <main className="flex-1 overflow-hidden">
          <div
            className="mx-auto px-4 sm:px-8 py-10 sm:py-14"
            style={{ maxWidth }}
          >
            {/* Document header */}
            <div className="mb-10 pb-8 border-b" style={{ borderColor: theme.text + '12' }}>
              <div
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-2 py-0.5 rounded"
                style={{ background: theme.text + '10', color: theme.secondary }}
              >
                {doc.fileType.toUpperCase()}
                {' · '}
                {formatFileSize(doc.fileSize)}
              </div>
              <h1
                className="font-playfair text-3xl sm:text-4xl font-bold leading-tight mb-2"
                style={{ color: theme.text }}
                dir={doc.isRTL ? 'rtl' : undefined}
              >
                {doc.title}
              </h1>
              {doc.author && (
                <p className="text-base" style={{ color: theme.secondary }}>{doc.author}</p>
              )}
              {doc.wordCount && (
                <p className="text-xs mt-2" style={{ color: theme.secondary }}>
                  {doc.wordCount.toLocaleString('id-ID')} kata
                  {doc.wordCount > 0 && ` · sekitar ${Math.round(doc.wordCount / 200)} menit baca`}
                </p>
              )}
            </div>

            {/* Viewer */}
            {doc.fileType === 'pdf' && (
              <PDFViewer
                buffer={buffer}
                onTextExtracted={handleTextExtracted}
                onPageCount={handlePageCount}
                onProgressChange={handleProgressChange}
              />
            )}
            {doc.fileType === 'epub' && (
              <EPUBViewer
                buffer={buffer}
                onTextExtracted={handleTextExtracted}
                onPageCount={handlePageCount}
                onProgressChange={handleProgressChange}
              />
            )}
            {(doc.fileType === 'txt' || doc.fileType === 'html' || doc.fileType === 'md' || doc.fileType === 'other') && (
              <TextViewer
                content={new TextDecoder().decode(buffer)}
                fileType={doc.fileType === 'other' ? 'txt' : doc.fileType}
                highlights={highlights}
                onTextExtracted={handleTextExtracted}
                onProgressChange={handleProgressChange}
                onSelectionChange={setSelection}
                fontSize={settings.fontSize}
                lineHeight={settings.lineHeight}
              />
            )}

            {/* Footer */}
            <div className="mt-16 pt-8 border-t flex items-center justify-between" style={{ borderColor: theme.text + '12' }}>
              <div className="flex items-center gap-2">
                <BookMarked size={14} style={{ color: theme.secondary }} strokeWidth={1.5} />
                <span className="text-xs" style={{ color: theme.secondary }}>Ruang Baca</span>
              </div>
              <span className="text-xs tabular-nums" style={{ color: theme.secondary }}>{progress}% selesai</span>
            </div>
          </div>
        </main>

        {/* Highlights sidebar */}
        {showHighlightPanel && (
          <HighlightsPanel
            highlights={highlights}
            onDelete={handleDeleteHighlight}
            onClose={() => setShowHighlightPanel(false)}
          />
        )}
      </div>

      {/* Highlight toolbar (appears on text selection) */}
      {selection && (
        <HighlightToolbar
          selection={selection}
          onHighlight={handleHighlight}
          onDismiss={() => setSelection(null)}
        />
      )}

      {/* Audio bar */}
      {showAudio && textContent && (
        <AudioBar
          text={textContent}
          isRTL={doc.isRTL}
          onClose={() => setShowAudio(false)}
        />
      )}

      {/* Settings modal */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
