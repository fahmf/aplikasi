'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronDown, Mic
} from 'lucide-react'

interface AudioBarProps {
  text: string
  isRTL?: boolean
  onClose: () => void
}

const CHUNK_SIZE = 200 // chars per utterance (avoids Chrome 15s TTS bug)

function splitIntoChunks(text: string, size: number): string[] {
  const sentences = text.match(/[^.!?؟।\n]+[.!?؟।\n]*/g) ?? [text]
  const chunks: string[] = []
  let current = ''
  for (const s of sentences) {
    if ((current + s).length > size && current) {
      chunks.push(current.trim())
      current = s
    } else {
      current += s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.filter(c => c.length > 0)
}

export default function AudioBar({ text, isRTL, onClose }: AudioBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [muted, setMuted] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [chunkIndex, setChunkIndex] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [showVoices, setShowVoices] = useState(false)
  const chunksRef = useRef<string[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const playingRef = useRef(false)

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices()
      setVoices(all)
      // Prefer Arabic voice if RTL
      const preferred = isRTL
        ? all.find(v => v.lang.startsWith('ar')) ?? all[0]
        : all.find(v => v.lang.startsWith('id')) ?? all.find(v => v.lang.startsWith('en')) ?? all[0]
      if (preferred && !selectedVoice) setSelectedVoice(preferred.name)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [isRTL, selectedVoice])

  // Prepare chunks when text changes
  useEffect(() => {
    const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const chunks = splitIntoChunks(cleanText, CHUNK_SIZE)
    chunksRef.current = chunks
    setTotalChunks(chunks.length)
    setChunkIndex(0)
  }, [text])

  const speakChunk = useCallback((idx: number) => {
    if (idx >= chunksRef.current.length) {
      setIsPlaying(false)
      playingRef.current = false
      setChunkIndex(0)
      return
    }

    const chunk = chunksRef.current[idx]
    const utter = new SpeechSynthesisUtterance(chunk)
    utter.rate = speed
    utter.volume = muted ? 0 : 1

    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) utter.voice = voice
    else if (isRTL) utter.lang = 'ar-SA'
    else utter.lang = 'id-ID'

    utter.onend = () => {
      if (playingRef.current) {
        const next = idx + 1
        setChunkIndex(next)
        speakChunk(next)
      }
    }

    utter.onerror = () => {
      setIsPlaying(false)
      playingRef.current = false
    }

    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [speed, muted, voices, selectedVoice, isRTL])

  const play = useCallback(() => {
    window.speechSynthesis.cancel()
    playingRef.current = true
    setIsPlaying(true)
    speakChunk(chunkIndex)
  }, [speakChunk, chunkIndex])

  const pause = useCallback(() => {
    playingRef.current = false
    setIsPlaying(false)
    window.speechSynthesis.cancel()
  }, [])

  const skipBack = () => {
    pause()
    const next = Math.max(0, chunkIndex - 5)
    setChunkIndex(next)
    if (isPlaying) {
      playingRef.current = true
      setIsPlaying(true)
      setTimeout(() => speakChunk(next), 50)
    }
  }

  const skipForward = () => {
    pause()
    const next = Math.min(totalChunks - 1, chunkIndex + 5)
    setChunkIndex(next)
    if (isPlaying) {
      playingRef.current = true
      setIsPlaying(true)
      setTimeout(() => speakChunk(next), 50)
    }
  }

  // Re-apply speed/mute in real time
  useEffect(() => {
    if (isPlaying) { pause(); play() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, muted, selectedVoice])

  useEffect(() => {
    return () => {
      playingRef.current = false
      window.speechSynthesis.cancel()
    }
  }, [])

  const progress = totalChunks > 0 ? (chunkIndex / totalChunks) * 100 : 0
  const currentTimeLabel = `${chunkIndex}/${totalChunks}`

  const arVoices = voices.filter(v => v.lang.startsWith('ar'))
  const idVoices = voices.filter(v => v.lang.startsWith('id'))
  const enVoices = voices.filter(v => v.lang.startsWith('en'))
  const otherVoices = voices.filter(v => !v.lang.startsWith('ar') && !v.lang.startsWith('id') && !v.lang.startsWith('en'))

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-2xl">
      {/* Progress bar */}
      <div className="h-0.5 bg-stone-100">
        <div
          className="h-full bg-stone-800 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-9 h-9 bg-stone-900 rounded-full flex items-center justify-center">
          <Mic size={16} className="text-white" />
        </div>

        {/* Title */}
        <div className="flex-shrink-0 hidden sm:block">
          <p className="text-xs font-medium text-stone-800 leading-tight">Podcast Audio</p>
          <p className="text-xs text-stone-400">{currentTimeLabel} bagian</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 mx-auto">
          <button onClick={skipBack} className="p-2 text-stone-500 hover:text-stone-900 transition-colors rounded hover:bg-stone-100">
            <SkipBack size={18} />
          </button>
          <button
            onClick={isPlaying ? pause : play}
            className="w-10 h-10 bg-stone-900 hover:bg-stone-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={skipForward} className="p-2 text-stone-500 hover:text-stone-900 transition-colors rounded hover:bg-stone-100">
            <SkipForward size={18} />
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1">
          {[0.75, 1, 1.25, 1.5, 2].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                speed === s ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Mute */}
        <button
          onClick={() => setMuted(m => !m)}
          className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded hover:bg-stone-100"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Voice picker */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowVoices(v => !v)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded px-2.5 py-1.5 transition-colors hover:bg-stone-50"
          >
            <span className="max-w-[8rem] truncate">{selectedVoice || 'Pilih suara'}</span>
            <ChevronDown size={12} />
          </button>
          {showVoices && (
            <div className="absolute bottom-full right-0 mb-2 bg-white border border-stone-200 rounded shadow-xl w-64 max-h-64 overflow-y-auto z-50">
              {[
                { label: 'Arab (عربي)', list: arVoices },
                { label: 'Indonesia', list: idVoices },
                { label: 'English', list: enVoices },
                { label: 'Lainnya', list: otherVoices },
              ].map(({ label, list }) => list.length > 0 && (
                <div key={label}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100 bg-stone-50">
                    {label}
                  </div>
                  {list.map(v => (
                    <button
                      key={v.name}
                      onClick={() => { setSelectedVoice(v.name); setShowVoices(false) }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-stone-50 ${
                        selectedVoice === v.name ? 'font-semibold text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      {v.name}
                      <span className="text-xs text-stone-400 ml-1">{v.lang}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => { pause(); onClose() }}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded hover:bg-stone-100 flex-shrink-0"
        >
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  )
}
