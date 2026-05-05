'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

interface EPUBViewerProps {
  buffer: ArrayBuffer
  onTextExtracted: (text: string) => void
  onPageCount: (n: number) => void
  onProgressChange: (pct: number) => void
}

export default function EPUBViewer({ buffer, onTextExtracted, onPageCount, onProgressChange }: EPUBViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null)

  useEffect(() => {
    if (!viewerRef.current) return
    let destroyed = false

    async function loadEpub() {
      try {
        setLoading(true)
        setError(null)
        const Epub = (await import('epubjs')).default
        const book = Epub(buffer.slice(0))
        bookRef.current = book

        await book.ready
        if (destroyed) return

        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          flow: 'scrolled-doc',
          manager: 'continuous',
        })
        renditionRef.current = rendition

        // Apply reading styles
        rendition.themes.register('reader', {
          body: {
            'font-family': "'Lora', Georgia, serif",
            'font-size': '1.125rem',
            'line-height': '1.9',
            'color': '#1C1917',
            'max-width': '70ch',
            'margin': '0 auto',
            'padding': '2rem 1rem',
          },
          'body[dir="rtl"]': {
            'font-family': "'Amiri', 'Cairo', serif",
            'font-size': '1.25rem',
            'line-height': '2',
          },
          'h1, h2, h3': {
            'font-family': "'Playfair Display', Georgia, serif",
          },
          p: { 'margin-bottom': '1.5em' },
        })
        rendition.themes.select('reader')

        await rendition.display()
        if (destroyed) return
        setLoading(false)

        // Extract text from all spine items for TTS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spine = (book.spine as unknown) as { items: any[] }
        onPageCount(spine.items.length)
        let fullText = ''
        for (const item of spine.items) {
          try {
            const doc = await item.load(book.load.bind(book))
            const text = doc?.documentElement?.textContent ?? ''
            fullText += text + '\n\n'
            item.unload?.()
          } catch {
            // skip failed spine items
          }
        }
        onTextExtracted(fullText)

        // Track location
        rendition.on('relocated', (loc: { start: { percentage: number } }) => {
          const pct = Math.round((loc.start.percentage ?? 0) * 100)
          setProgress(pct)
          onProgressChange(pct)
        })
      } catch (e) {
        console.error('EPUB load error', e)
        if (!destroyed) setError('Gagal memuat EPUB. File mungkin tidak valid.')
        setLoading(false)
      }
    }

    loadEpub()
    return () => {
      destroyed = true
      renditionRef.current?.destroy?.()
      bookRef.current?.destroy?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffer])

  const prev = () => renditionRef.current?.prev()
  const next = () => renditionRef.current?.next()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle size={40} className="text-red-300" strokeWidth={1} />
        <p className="text-stone-600 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={28} className="animate-spin text-stone-400" />
          <p className="text-sm text-stone-400">Memuat EPUB...</p>
        </div>
      )}

      {/* EPUB render target */}
      <div
        ref={viewerRef}
        className="w-full"
        style={{ minHeight: loading ? 0 : '80vh', display: loading ? 'none' : 'block' }}
      />

      {/* Navigation */}
      {!loading && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
          <button
            onClick={prev}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors px-4 py-2 rounded hover:bg-stone-100"
          >
            <ChevronLeft size={16} />
            Sebelumnya
          </button>
          <span className="text-xs text-stone-400 tabular-nums">{progress}%</span>
          <button
            onClick={next}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors px-4 py-2 rounded hover:bg-stone-100"
          >
            Berikutnya
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
