'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type { Highlight, HighlightColor } from '@/types/reader'
import { detectIsRTL } from '@/types/reader'

interface TextViewerProps {
  content: string
  fileType: 'txt' | 'html' | 'md' | 'other'
  highlights: Highlight[]
  onTextExtracted: (text: string) => void
  onProgressChange: (pct: number) => void
  onSelectionChange: (info: SelectionInfo | null) => void
  fontSize: number
  lineHeight: number
}

export interface SelectionInfo {
  text: string
  x: number
  y: number
  startOffset: number
  endOffset: number
  paragraphIndex: number
}

function parseMarkdown(md: string): string {
  return md
    .replace(/^#{1} (.+)$/gm, '<h1>$1</h1>')
    .replace(/^#{2} (.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{3} (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (line) => {
      if (/^<[h1-6|blockquote|hr]/.test(line)) return line
      return line
    })
}

function buildHighlightedHTML(rawHTML: string, highlights: Highlight[]): string {
  if (highlights.length === 0) return rawHTML

  // Apply highlights by replacing plain text matches with marked versions
  let result = rawHTML
  for (const hl of highlights) {
    const escapedText = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?!<[^>]*>)(${escapedText})`, 'g')
    result = result.replace(re, `<mark class="hl-${hl.color}" data-hl="${hl.id}">$1</mark>`)
  }
  return result
}

export default function TextViewer({
  content,
  fileType,
  highlights,
  onTextExtracted,
  onProgressChange,
  onSelectionChange,
  fontSize,
  lineHeight,
}: TextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const isRTL = useMemo(() => detectIsRTL(content.slice(0, 2000)), [content])

  const processedHTML = useMemo(() => {
    let html = ''
    if (fileType === 'html') {
      // Strip outer html/body tags, keep inner content
      html = content.replace(/<html[^>]*>|<\/html>|<head[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, '')
    } else if (fileType === 'md') {
      html = `<p>${parseMarkdown(content)}</p>`
    } else {
      // Plain text — split by double newline into paragraphs
      html = content
        .split(/\n{2,}/)
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('')
    }
    return html
  }, [content, fileType])

  const highlightedHTML = useMemo(
    () => buildHighlightedHTML(processedHTML, highlights),
    [processedHTML, highlights]
  )

  // Extract plain text for TTS
  useEffect(() => {
    const div = document.createElement('div')
    div.innerHTML = processedHTML
    onTextExtracted(div.textContent ?? '')
  }, [processedHTML, onTextExtracted])

  // Track scroll progress
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const scrollable = document.documentElement
      const pct = Math.round((scrollable.scrollTop / (scrollable.scrollHeight - scrollable.clientHeight)) * 100)
      onProgressChange(Math.max(0, Math.min(100, pct)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onProgressChange])

  // Handle text selection for highlight toolbar
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      onSelectionChange(null)
      return
    }
    const text = selection.toString().trim()
    if (text.length < 2) {
      onSelectionChange(null)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // Find paragraph index
    const container = containerRef.current
    let paragraphIndex = 0
    let charCount = 0
    if (container) {
      const paras = container.querySelectorAll('p, h1, h2, h3, blockquote')
      for (let i = 0; i < paras.length; i++) {
        const para = paras[i]
        if (para.contains(range.startContainer)) {
          paragraphIndex = i
          break
        }
        charCount += (para.textContent ?? '').length
      }
    }

    onSelectionChange({
      text,
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY - 8,
      startOffset: charCount + range.startOffset,
      endOffset: charCount + range.endOffset,
      paragraphIndex,
    })
  }, [onSelectionChange])

  const bodyFont = isRTL
    ? "'Amiri', 'Cairo', serif"
    : "'Lora', Georgia, serif"

  return (
    <div
      ref={containerRef}
      className="reading-body"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: bodyFont,
        fontSize: `${fontSize}px`,
        lineHeight,
        ...(isRTL ? { textAlign: 'right' } : {}),
      }}
      onMouseUp={handleMouseUp}
      dangerouslySetInnerHTML={{ __html: highlightedHTML }}
    />
  )
}
