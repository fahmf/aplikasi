'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, BookOpen, Search, Loader2, FileText, Grid3X3, List, Trash2, BookMarked } from 'lucide-react'
import type { ReaderDocument, FileType } from '@/types/reader'
import { getCoverColor, formatFileSize, detectIsRTL } from '@/types/reader'
import {
  saveDocument, saveFile, getAllDocuments, deleteDocument
} from '@/lib/reader-storage'

const ACCEPTED_TYPES: Record<string, FileType> = {
  'application/pdf': 'pdf',
  'application/epub+zip': 'epub',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/markdown': 'md',
  'application/x-markdown': 'md',
}

function fileTypeFromName(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase()
  const map: Record<string, FileType> = {
    pdf: 'pdf', epub: 'epub', txt: 'txt',
    html: 'html', htm: 'html', md: 'md', markdown: 'md',
  }
  return map[ext ?? ''] ?? 'other'
}

function extractTitleFromFile(file: File): string {
  const name = file.name.replace(/\.[^.]+$/, '')
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

async function processFile(file: File): Promise<ReaderDocument & { buffer: ArrayBuffer }> {
  const buffer = await file.arrayBuffer()
  const fileType = ACCEPTED_TYPES[file.type] ?? fileTypeFromName(file.name)
  const title = extractTitleFromFile(file)
  const coverColor = getCoverColor(title)

  let isRTL = false
  let wordCount: number | undefined

  if (fileType === 'txt' || fileType === 'html' || fileType === 'md') {
    const text = new TextDecoder().decode(buffer)
    isRTL = detectIsRTL(text)
    wordCount = text.split(/\s+/).filter(Boolean).length
  }

  const doc: ReaderDocument = {
    id: crypto.randomUUID(),
    title,
    author: '',
    fileType,
    fileSize: file.size,
    fileName: file.name,
    addedAt: new Date().toISOString(),
    readProgress: 0,
    coverColor,
    isRTL,
    wordCount,
  }

  return { ...doc, buffer }
}

function DocumentCard({
  doc,
  view,
  onOpen,
  onDelete,
}: {
  doc: ReaderDocument
  view: 'grid' | 'list'
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Hapus dokumen ini?')) return
    setDeleting(true)
    await deleteDocument(doc.id)
    onDelete(doc.id)
  }

  const typeLabel: Record<FileType, string> = {
    pdf: 'PDF', epub: 'EPUB', txt: 'TXT',
    html: 'HTML', md: 'MD', docx: 'DOCX', other: 'FILE',
  }

  const dateStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(doc.lastReadAt ?? doc.addedAt))

  if (view === 'list') {
    return (
      <div
        onClick={() => onOpen(doc.id)}
        className="group flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
      >
        <div
          className="flex-shrink-0 w-10 h-12 rounded flex items-center justify-center text-white text-xs font-bold tracking-wider"
          style={{ background: doc.coverColor }}
        >
          {typeLabel[doc.fileType]}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-playfair font-semibold text-stone-900 truncate text-base leading-tight"
            dir={doc.isRTL ? 'rtl' : undefined}
            style={doc.isRTL ? { fontFamily: "'Amiri', serif" } : undefined}
          >
            {doc.title}
          </div>
          {doc.author && (
            <div className="text-sm text-stone-500 mt-0.5">{doc.author}</div>
          )}
        </div>
        <div className="flex items-center gap-6 flex-shrink-0 text-sm text-stone-400">
          <span className="hidden sm:block">{formatFileSize(doc.fileSize)}</span>
          <span className="hidden md:block">{dateStr}</span>
          {doc.readProgress > 0 && (
            <span className="font-medium text-stone-600">{doc.readProgress}%</span>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-all p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => onOpen(doc.id)}
      className="group cursor-pointer"
    >
      {/* Cover */}
      <div
        className="relative w-full aspect-[3/4] rounded-sm overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow"
        style={{ background: doc.coverColor }}
      >
        {/* Book texture lines */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-white" style={{ marginTop: `${12.5 * (i + 1)}%` }} />
          ))}
        </div>
        {/* Type badge */}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5 text-white text-xs font-bold tracking-wider">
          {typeLabel[doc.fileType]}
        </div>
        {/* Progress bar */}
        {doc.readProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div className="h-full bg-white/70" style={{ width: `${doc.readProgress}%` }} />
          </div>
        )}
        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 bg-black/40 hover:bg-red-500/80 text-white rounded p-1 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Meta */}
      <div className="px-0.5">
        <h3
          className="font-playfair font-semibold text-stone-900 leading-snug text-sm line-clamp-2 mb-0.5"
          dir={doc.isRTL ? 'rtl' : undefined}
          style={doc.isRTL ? { fontFamily: "'Amiri', serif", fontSize: '0.95rem' } : undefined}
        >
          {doc.title}
        </h3>
        {doc.author ? (
          <p className="text-xs text-stone-500 truncate">{doc.author}</p>
        ) : (
          <p className="text-xs text-stone-400">{dateStr}</p>
        )}
        {doc.readProgress > 0 && (
          <p className="text-xs text-stone-400 mt-0.5">{doc.readProgress}% dibaca</p>
        )}
      </div>
    </div>
  )
}

function UploadZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase()
      return ['pdf', 'epub', 'txt', 'html', 'htm', 'md'].includes(ext ?? '')
    })
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 py-14 px-8 rounded border-2 border-dashed cursor-pointer transition-all select-none ${
        dragging
          ? 'border-stone-400 bg-stone-100'
          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.epub,.txt,.html,.htm,.md,.markdown"
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
      <Upload size={28} className="text-stone-300" strokeWidth={1.5} />
      <div className="text-center">
        <p className="text-sm font-medium text-stone-600">Seret file ke sini, atau klik untuk unggah</p>
        <p className="text-xs text-stone-400 mt-1">PDF · EPUB · TXT · HTML · Markdown</p>
        <p className="text-xs text-stone-400">PDF hasil scan akan diproses OCR secara otomatis</p>
      </div>
    </div>
  )
}

export default function LibraryClient() {
  const router = useRouter()
  const [docs, setDocs] = useState<ReaderDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    getAllDocuments()
      .then(all => setDocs(all.sort((a, b) => (b.lastReadAt ?? b.addedAt).localeCompare(a.lastReadAt ?? a.addedAt))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleFiles = useCallback(async (files: File[]) => {
    setShowUpload(false)
    const names = files.map(f => f.name)
    setUploading(prev => [...prev, ...names])

    for (const file of files) {
      try {
        const { buffer, ...doc } = await processFile(file)
        await saveFile(doc.id, buffer)
        await saveDocument(doc)
        setDocs(prev => [doc, ...prev])
      } catch (err) {
        console.error('Failed to process file:', file.name, err)
      } finally {
        setUploading(prev => prev.filter(n => n !== file.name))
      }
    }
  }, [])

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.author.toLowerCase().includes(search.toLowerCase())
  )

  const isEmpty = docs.length === 0 && !loading && uploading.length === 0

  return (
    <div className="min-h-screen reader-paper">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          {/* Logo / title */}
          <div className="flex items-center gap-2.5 mr-4">
            <BookMarked size={20} className="text-stone-700" strokeWidth={1.5} />
            <span className="font-playfair font-bold text-stone-900 text-xl tracking-tight">Ruang Baca</span>
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari judul atau penulis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* View toggle */}
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <List size={15} />
            </button>

            <div className="w-px h-5 bg-stone-200 mx-1" />

            {/* Upload button */}
            <button
              onClick={() => setShowUpload(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded hover:bg-stone-700 transition-colors"
            >
              <Upload size={14} />
              Tambah Dokumen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Masthead / date line */}
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-xs text-stone-400 tracking-widest uppercase font-medium">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
          {docs.length > 0 && (
            <p className="text-xs text-stone-400">{docs.length} dokumen</p>
          )}
        </div>
        <hr className="reader-rule mb-6" />

        {/* Upload zone */}
        {showUpload && (
          <div className="mb-8">
            <UploadZone onFiles={handleFiles} />
          </div>
        )}

        {/* Upload progress */}
        {uploading.length > 0 && (
          <div className="mb-6 space-y-2">
            {uploading.map(name => (
              <div key={name} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded px-4 py-3">
                <Loader2 size={14} className="animate-spin text-stone-500" />
                <span className="text-sm text-stone-600 truncate">{name}</span>
                <span className="text-xs text-stone-400 ml-auto">memproses...</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-stone-400" />
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={40} className="text-stone-200 mb-6" strokeWidth={1} />
            <h2 className="font-playfair text-2xl font-bold text-stone-700 mb-2">Perpustakaan Kosong</h2>
            <p className="text-stone-400 text-sm max-w-xs leading-relaxed mb-8">
              Mulai dengan mengunggah dokumen PDF, EPUB, atau teks untuk dibaca.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded font-medium hover:bg-stone-700 transition-colors"
            >
              <Upload size={16} />
              Unggah Dokumen Pertama
            </button>
          </div>
        )}

        {/* Document grid */}
        {!loading && filtered.length > 0 && (
          view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {filtered.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  view="grid"
                  onOpen={id => router.push(`/reader/${id}`)}
                  onDelete={id => setDocs(prev => prev.filter(d => d.id !== id))}
                />
              ))}
            </div>
          ) : (
            <div className="border border-stone-200 rounded overflow-hidden bg-white">
              {filtered.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  view="list"
                  onOpen={id => router.push(`/reader/${id}`)}
                  onDelete={id => setDocs(prev => prev.filter(d => d.id !== id))}
                />
              ))}
            </div>
          )
        )}

        {/* No search results */}
        {!loading && search && filtered.length === 0 && docs.length > 0 && (
          <div className="text-center py-16">
            <FileText size={32} className="text-stone-200 mx-auto mb-4" strokeWidth={1} />
            <p className="text-stone-500 font-medium">Tidak ditemukan: &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch('')} className="text-sm text-stone-400 hover:text-stone-600 mt-2">
              Hapus pencarian
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
