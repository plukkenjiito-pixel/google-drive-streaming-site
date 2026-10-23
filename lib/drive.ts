import 'server-only'

const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{10,100}$/
const FOLDER_MIME = 'application/vnd.google-apps.folder'
const MAX_DEPTH = 5
const MAX_FILES = 2000

export type DriveVideo = {
  id: string
  name: string
  mimeType: string
  size: number | null
  durationMs: number | null
  createdTime: string | null
  folderPath: string
}

type DriveFile = {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime?: string
  videoMediaMetadata?: { durationMillis?: string }
}

export function parseDriveFolderId(input: string): string | null {
  const value = input.trim()
  const fromPath = value.match(/\/folders\/([A-Za-z0-9_-]+)/)?.[1]
  const fromQuery = value.match(/[?&]id=([A-Za-z0-9_-]+)/)?.[1]
  const id = fromPath ?? fromQuery ?? value
  return DRIVE_ID_PATTERN.test(id) ? id : null
}

async function listChildren(folderId: string, apiKey: string): Promise<DriveFile[]> {
  const files: DriveFile[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        'nextPageToken, files(id, name, mimeType, size, createdTime, videoMediaMetadata(durationMillis))',
      pageSize: '1000',
      orderBy: 'name_natural',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
      key: apiKey,
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const message = body?.error?.message ?? res.statusText
      throw new Error(`Google Drive error (${res.status}): ${message}`)
    }
    const data = (await res.json()) as { files: DriveFile[]; nextPageToken?: string }
    files.push(...data.files)
    pageToken = data.nextPageToken
  } while (pageToken && files.length < MAX_FILES)

  return files
}

export async function listFolderVideos(rootFolderId: string): Promise<DriveVideo[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) throw new Error('GOOGLE_DRIVE_API_KEY is not configured.')
  if (!DRIVE_ID_PATTERN.test(rootFolderId)) throw new Error('Invalid folder ID.')

  const videos: DriveVideo[] = []
  const queue: { id: string; path: string; depth: number }[] = [
    { id: rootFolderId, path: '', depth: 0 },
  ]

  while (queue.length > 0 && videos.length < MAX_FILES) {
    const folder = queue.shift()!
    const children = await listChildren(folder.id, apiKey)

    for (const file of children) {
      if (file.mimeType === FOLDER_MIME) {
        if (folder.depth < MAX_DEPTH) {
          queue.push({
            id: file.id,
            path: folder.path ? `${folder.path} / ${file.name}` : file.name,
            depth: folder.depth + 1,
          })
        }
      } else if (file.mimeType.startsWith('video/')) {
        videos.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size ? Number(file.size) : null,
          durationMs: file.videoMediaMetadata?.durationMillis
            ? Number(file.videoMediaMetadata.durationMillis)
            : null,
          createdTime: file.createdTime ?? null,
          folderPath: folder.path,
        })
      }
    }
  }

  return videos.slice(0, MAX_FILES)
}
