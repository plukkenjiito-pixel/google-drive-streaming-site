'use server'

import { and, eq, notInArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { libraryFolder, watchProgress } from '@/lib/db/schema'
import { isValidDriveId } from '@/lib/google'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

type FolderInput = { id: string; name: string }

export async function saveLibraryFolders(folders: FolderInput[]) {
  const userId = await getUserId()
  const clean = folders
    .filter((f) => isValidDriveId(f.id) && typeof f.name === 'string')
    .slice(0, 50)
    .map((f) => ({ id: f.id, name: f.name.slice(0, 200) }))

  const ids = clean.map((f) => f.id)
  await db
    .delete(libraryFolder)
    .where(
      ids.length > 0
        ? and(eq(libraryFolder.userId, userId), notInArray(libraryFolder.folderId, ids))
        : eq(libraryFolder.userId, userId),
    )

  if (clean.length > 0) {
    await db
      .insert(libraryFolder)
      .values(clean.map((f) => ({ userId, folderId: f.id, name: f.name })))
      .onConflictDoNothing()
  }

  revalidatePath('/')
  return { ok: true }
}

export async function saveWatchProgress(input: {
  fileId: string
  name: string
  position: number
  duration: number
}) {
  const userId = await getUserId()
  if (!isValidDriveId(input.fileId)) return
  const position = Number.isFinite(input.position) ? Math.max(0, input.position) : 0
  const duration = Number.isFinite(input.duration) ? Math.max(0, input.duration) : 0
  const name = String(input.name).slice(0, 300)

  await db
    .insert(watchProgress)
    .values({ userId, fileId: input.fileId, name, position, duration })
    .onConflictDoUpdate({
      target: [watchProgress.userId, watchProgress.fileId],
      set: { position, duration, name, updatedAt: new Date() },
    })
}
