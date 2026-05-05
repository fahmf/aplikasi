'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, ScanText, AlertCircle } from 'lucide-react'

interface PDFViewerProps {
  buffer: ArrayBuffer
  onTextExtracted: (text: string) => void
  onPageCount: (n: number) => void
  onProgressChange: (pct: number) => void
}

const PDFJS_VERSION = '5.7.284'
const WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`

export default function PDFViewer({ buffer, onTextExtracted, onPageCount, onProgressChange }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.4)
  const [loading, setLoading] = useState(true)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrAvailable, setOcrAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const renderPage = useCallback(async (pdf: unknown, pageNum: number, s: number) => {
    if (!canvasRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (pdf as any).getPage(pageNum)
    const viewport = page.getViewport({ scale: s })
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height
    renderTaskRef.current?.cancel()
    const task = page.render({ canvasContext: ctx, viewport })
    renderTaskRef.current = task
    try {
      await task.promise
    } catch {
      // cancelled — ignore
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        GlobalWorkerOptions.workerSrc = WORKER_CDN

        const pdf = await getDocument({ data: buffer.slice(0) }).promise
        if (cancelled) return

        pdfRef.current = pdf
        setNumPages(pdf.numPages)
        onPageCount(pdf.numPages)
        setLoading(false)

        await renderPage(pdf, 1, scale)

        // Extract text from all pages for TTS
        let fullText = ''
        let hasText = false
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pageText = content.items.map((item: any) => item.str ?? '').join(' ').trim()
          if (pageText.length > 20) hasText = true
          fullText += pageText + '\n\n'
        }

        if (hasText) {
          onTextExtracted(fullText)
          setOcrAvailable(false)
        } else {
          // Scanned PDF — no text layer
          setOcrAvailable(true)
        }
      } catch (e) {
        if (!cancelled) setError('Gagal memuat PDF. File mungkin rusak.')
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffer])

  useEffect(() => {
    if (pdfRef.current && !loading) {
      renderPage(pdfRef.current, currentPage, scale)
      onProgressChange(Math.round((currentPage / numPages) * 100))
    }
  }, [currentPage, scale, loading, numPages, renderPage, onProgressChange])

  const goTo = (n: number) => setCurrentPage(Math.max(1, Math.min(numPages, n)))

  const runOCR = useCallback(async () => {
    if (!canvasRef.current || !pdfRef.current) return
    setOcrLoading(true)
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker(['ara', 'eng'])

      let allText = ''
      for (let i = 1; i <= Math.min(pdfRef.current.numPages, 20); i++) {
        const page = await pdfRef.current.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const offscreen = document.createElement('canvas')
        offscreen.width = viewport.width
        offscreen.height = viewport.height
        await page.render({ canvasContext: offscreen.getContext('2d')!, viewport }).promise
        const { data: { text } } = await worker.recognize(offscreen)
        allText += text + '\n\n'
      }

      await worker.terminate()
      onTextExtracted(allText)
      setOcrAvailable(false)
    } catch (e) {
      console.error('OCR failed', e)
    } finally {
      setOcrLoading(false)
    }
  }, [onTextExtracted])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <AlertCircle size={40} className="text-red-300" strokeWidth={1} />
        <p className="text-stone-600 font-medium">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-stone-400" />
        <p className="text-sm text-stone-400">Memuat PDF...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Toolbar */}
      <div className="sticky top-[57px] z-20 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full px-4 py-2 shadow-sm mb-6">
        <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}
          className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-stone-600 tabular-nums min-w-[6rem] text-center">
          {currentPage} / {numPages}
        </span>
        <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === numPages}
          className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 transition-colors">
          <ChevronRight size={16} />
        </button>

        <div className="w-px h-4 bg-stone-200 mx-1" />

        <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
          className="p-1 rounded hover:bg-stone-100 transition-colors text-stone-500">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-stone-400 tabular-nums w-10 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.2))}
          className="p-1 rounded hover:bg-stone-100 transition-colors text-stone-500">
          <ZoomIn size={16} />
        </button>

        {ocrAvailable && (
          <>
            <div className="w-px h-4 bg-stone-200 mx-1" />
            <button
              onClick={runOCR}
              disabled={ocrLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-full px-3 py-1 transition-colors disabled:opacity-60"
            >
              {ocrLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <ScanText size={12} />}
              {ocrLoading ? 'OCR berjalan...' : 'Ekstrak teks (OCR)'}
            </button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full flex justify-center overflow-x-auto">
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Page input */}
      <div className="mt-6 flex items-center gap-2 text-sm text-stone-400">
        <span>Halaman</span>
        <input
          type="number"
          value={currentPage}
          min={1}
          max={numPages}
          onChange={e => goTo(Number(e.target.value))}
          className="w-14 text-center border border-stone-200 rounded px-2 py-1 text-stone-700 text-sm focus:outline-none focus:border-stone-400"
        />
        <span>dari {numPages}</span>
      </div>
    </div>
  )
}
