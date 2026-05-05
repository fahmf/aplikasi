export type FileType = 'pdf' | 'epub' | 'txt' | 'html' | 'md' | 'docx' | 'other'

export interface ReaderDocument {
  id: string
  title: string
  author: string
  fileType: FileType
  fileSize: number
  fileName: string
  addedAt: string
  lastReadAt?: string
  readProgress: number
  coverColor: string
  pageCount?: number
  wordCount?: number
  isRTL?: boolean
  language?: string
}

export type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink'

export interface Highlight {
  id: string
  documentId: string
  text: string
  color: HighlightColor
  note?: string
  createdAt: string
  pageIndex?: number
  paragraphIndex?: number
  startOffset: number
  endOffset: number
  contextBefore?: string
  contextAfter?: string
}

export interface ReadingSettings {
  fontSize: number
  lineHeight: number
  fontFamily: 'serif' | 'sans' | 'arabic'
  theme: 'light' | 'sepia' | 'dark'
  columnWidth: 'narrow' | 'medium' | 'wide'
  ttsSpeed: number
  ttsVoice?: string
  ttsLang?: string
}

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.9,
  fontFamily: 'serif',
  theme: 'light',
  columnWidth: 'medium',
  ttsSpeed: 1,
}

export const COVER_COLORS = [
  '#1C1917', '#292524', '#44403C',
  '#1E3A5F', '#1D4ED8', '#0E7490',
  '#14532D', '#365314', '#4D7C0F',
  '#7C2D12', '#9A3412', '#92400E',
  '#4C1D95', '#5B21B6', '#6B21A8',
]

export function getCoverColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]
}

export function detectIsRTL(text: string): boolean {
  const arabicRange = /[؀-ۿݐ-ݿࢠ-ࣿ]/
  const rtlChars = (text.match(/[؀-ۿݐ-ݿࢠ-ࣿ֐-׿]/g) || []).length
  const totalChars = text.replace(/\s/g, '').length
  return totalChars > 0 && rtlChars / totalChars > 0.3
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
