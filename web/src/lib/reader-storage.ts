import type { ReaderDocument, Highlight, ReadingSettings } from '@/types/reader'

const DB_NAME = 'reader-db'
const DB_VERSION = 1

type DBStore = 'documents' | 'files' | 'highlights' | 'settings'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('highlights')) {
        const store = db.createObjectStore('highlights', { keyPath: 'id' })
        store.createIndex('documentId', 'documentId', { unique: false })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function dbGet<T>(store: DBStore, key: string): Promise<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

async function dbPut(store: DBStore, value: unknown): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const req = tx.objectStore(store).put(value)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function dbDelete(store: DBStore, key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const req = tx.objectStore(store).delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function dbGetAll<T>(store: DBStore): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

// Documents
export async function saveDocument(doc: ReaderDocument): Promise<void> {
  await dbPut('documents', doc)
}

export async function getDocument(id: string): Promise<ReaderDocument | undefined> {
  return dbGet<ReaderDocument>('documents', id)
}

export async function getAllDocuments(): Promise<ReaderDocument[]> {
  return dbGetAll<ReaderDocument>('documents')
}

export async function deleteDocument(id: string): Promise<void> {
  await Promise.all([
    dbDelete('documents', id),
    dbDelete('files', id),
  ])
}

export async function updateReadProgress(id: string, progress: number): Promise<void> {
  const doc = await getDocument(id)
  if (doc) {
    await saveDocument({ ...doc, readProgress: Math.round(progress), lastReadAt: new Date().toISOString() })
  }
}

// Files (ArrayBuffer)
export async function saveFile(id: string, buffer: ArrayBuffer): Promise<void> {
  await dbPut('files', { id, buffer })
}

export async function getFile(id: string): Promise<ArrayBuffer | undefined> {
  const result = await dbGet<{ id: string; buffer: ArrayBuffer }>('files', id)
  return result?.buffer
}

// Highlights
export async function saveHighlight(highlight: Highlight): Promise<void> {
  await dbPut('highlights', highlight)
}

export async function getHighlightsForDoc(documentId: string): Promise<Highlight[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('highlights', 'readonly')
    const index = tx.objectStore('highlights').index('documentId')
    const req = index.getAll(documentId)
    req.onsuccess = () => resolve(req.result as Highlight[])
    req.onerror = () => reject(req.error)
  })
}

export async function deleteHighlight(id: string): Promise<void> {
  await dbDelete('highlights', id)
}

// Settings
export async function getSettings(): Promise<ReadingSettings | undefined> {
  const result = await dbGet<{ key: string; value: ReadingSettings }>('settings', 'global')
  return result?.value
}

export async function saveSettings(settings: ReadingSettings): Promise<void> {
  await dbPut('settings', { key: 'global', value: settings })
}
