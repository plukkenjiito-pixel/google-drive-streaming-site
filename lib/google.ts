import 'server-only'
import { cache } from 'react'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account } from '@/lib/db/schema'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const FOLDER_MIME = 'application/vnd.google-apps.folder'
const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/

export class DriveAuthError extends Error {}

export type DriveFolder = { id: string; name: string }

export type DriveVideo = {
  id: string
  name: string
  mimeType: string
  hasThumbnail: boolean
  durationMs: number | null
  modifiedTime: string | null
  folderId: string
}

type RawFile = {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  modifiedTime?: string
  parents?: string[]
  videoMediaMetadata?: { durationMillis?: string }
}

export function isValidDriveId(id: string) {
  return DRIVE_ID_PATTERN.test(id)
}

async function refreshAccessToken(accountId: string, refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    console.error('Google token refresh failed', res.status, await res.text())
    throw new DriveAuthError('Unable to refresh Google access')
  }
  const data = (await res.json()) as { access_token: string; expires_in: number }
  await db
    .update(account)
    .set({
      accessToken: data.access_token,
      accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(eq(account.id, accountId))
  return data.access_token
}

export const getGoogleAccessToken = cache(async (userId: string) => {
  const [row] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'google')))
    .limit(1)

  if (!row?.accessToken) throw new DriveAuthError('Google account not linked')

  const expiresAt = row.accessTokenExpiresAt?.getTime() ?? 0
  if (expiresAt - Date.now() > 60_000) return row.accessToken
  if (!row.refreshToken) throw new DriveAuthError('Google session expired')
  return refreshAccessToken(row.id, row.refreshToken)
})

async function driveFetch<T>(userId: string, path: string, params: Record<string, string>) {
  const token = await getGoogleAccessToken(userId)
  const url = `${DRIVE_API}${path}?${new URLSearchParams(params)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (res.status === 401 || res.status === 403) {
    throw new DriveAuthError(`Drive access denied (${res.status})`)
  }
  if (!res.ok) throw new Error(`Drive request failed (${res.status})`)
  return (await res.json()) as T
}

const sharedListParams = {
  supportsAllDrives: 'true',
  includeItemsFromAllDrives: 'true',
  pageSize: '200',
}

export async function listDriveFolders(
  userId: string,
  parent: string,
): Promise<DriveFolder[]> {
  const q =
    parent === 'shared'
      ? `sharedWithMe = true and mimeType = '${FOLDER_MIME}' and trashed = false`
      : `'${parent}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`
  const data = await driveFetch<{ files: DriveFolder[] }>(userId, '/files', {
    ...sharedListParams,
    q,
    orderBy: 'name',
    fields: 'files(id,name)',
  })
  return data.files ?? []
}

function toVideo(file: RawFile, folderId: string): DriveVideo {
  const duration = file.videoMediaMetadata?.durationMillis
  return {
    id: file.id,
    name: file.name.replace(/\.[^.]+$/, ''),
    mimeType: file.mimeType,
    hasThumbnail: Boolean(file.thumbnailLink),
    durationMs: duration ? Number(duration) : null,
    modifiedTime: file.modifiedTime ?? null,
    folderId,
  }
}

const MAX_DEPTH = 3
const MAX_VIDEOS = 300

export const listFolderVideos = cache(
  async (userId: string, folderId: string): Promise<DriveVideo[]> => {
    if (!isValidDriveId(folderId)) return []
    const videos: DriveVideo[] = []
    let queue = [folderId]

    for (let depth = 0; depth < MAX_DEPTH && queue.length > 0; depth++) {
      const next: string[] = []
      await Promise.all(
        queue.map(async (id) => {
          let pageToken: string | undefined
          do {
            const data = await driveFetch<{ files: RawFile[]; nextPageToken?: string }>(
              userId,
              '/files',
              {
                ...sharedListParams,
                q: `'${id}' in parents and trashed = false and (mimeType contains 'video/' or mimeType = '${FOLDER_MIME}')`,
                orderBy: 'name_natural',
                fields:
                  'nextPageToken,files(id,name,mimeType,thumbnailLink,modifiedTime,videoMediaMetadata(durationMillis))',
                ...(pageToken ? { pageToken } : {}),
              },
            )
            for (const file of data.files ?? []) {
              if (file.mimeType === FOLDER_MIME) next.push(file.id)
              else videos.push(toVideo(file, id))
            }
            pageToken = data.nextPageToken
          } while (pageToken && videos.length < MAX_VIDEOS)
        }),
      )
      queue = next
    }

    return videos.slice(0, MAX_VIDEOS)
  },
)

export const getDriveFile = cache(async (userId: string, fileId: string) => {
  if (!isValidDriveId(fileId)) return null
  try {
    return await driveFetch<RawFile>(userId, `/files/${fileId}`, {
      supportsAllDrives: 'true',
      fields: 'id,name,mimeType,thumbnailLink,parents,modifiedTime,videoMediaMetadata(durationMillis)',
    })
  } catch (error) {
    if (error instanceof DriveAuthError) throw error
    return null
  }
})

export function toDriveVideo(file: RawFile, folderId = '') {
  return toVideo(file, folderId)
}
