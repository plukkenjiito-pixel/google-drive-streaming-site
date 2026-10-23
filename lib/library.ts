import 'server-only'
import { cache } from 'react'
import { and, asc, desc, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { libraryFolder, watchProgress } from '@/lib/db/schema'

export const getLibraryFolders = cache(async (userId: string) =>
  db
    .select()
    .from(libraryFolder)
    .where(eq(libraryFolder.userId, userId))
    .orderBy(asc(libraryFolder.createdAt)),
)

export const getContinueWatching = cache(async (userId: string) =>
  db
    .select()
    .from(watchProgress)
    .where(and(eq(watchProgress.userId, userId), gt(watchProgress.position, 5)))
    .orderBy(desc(watchProgress.updatedAt))
    .limit(20),
)

export async function getProgressFor(userId: string, fileId: string) {
  const [row] = await db
    .select()
    .from(watchProgress)
    .where(and(eq(watchProgress.userId, userId), eq(watchProgress.fileId, fileId)))
    .limit(1)
  return row ?? null
}
