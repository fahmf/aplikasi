import ReaderClient from '@/components/reader/ReaderClient'

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ReaderClient documentId={id} />
}
