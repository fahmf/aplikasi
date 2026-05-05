import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ruang Baca',
  description: 'Baca dokumen dengan nyaman — PDF, EPUB, teks — dengan anotasi dan audio.',
}

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="reader-paper min-h-screen">
      {children}
    </div>
  )
}
