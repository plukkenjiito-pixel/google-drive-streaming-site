import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/components/video-player'
import { FolderRow } from '@/components/browse/folder-row'
import { VideoRowSkeleton } from '@/components/browse/video-row'
import { ReconnectBanner } from '@/components/browse/reconnect-banner'
import { DriveAuthError, getDriveFile, isValidDriveId } from '@/lib/google'
import { getProgressFor } from '@/lib/library'
import { requireUser } from '@/lib/session'

export default async function WatchPage({ params }: { params: Promise<{ fileId: string }> }) {
  const user = await requireUser()
  const { fileId } = await params
  if (!isValidDriveId(fileId)) notFound()

  let file
  try {
    file = await getDriveFile(user.id, fileId)
  } catch (error) {
    if (error instanceof DriveAuthError) return <ReconnectBanner />
    throw error
  }
  if (!file) notFound()

  const progress = await getProgressFor(user.id, fileId)
  const title = file.name.replace(/\.[^.]+$/, '')
  const parentId = file.parents?.[0]

  return (
    <main className="min-h-dvh bg-black">
      <VideoPlayer
        fileId={fileId}
        title={title}
        mimeType={file.mimeType}
        startAt={progress?.position ?? 0}
      />
      {parentId ? (
        <div className="bg-background py-8">
          <Suspense fallback={<VideoRowSkeleton title="More from this folder" />}>
            <FolderRow userId={user.id} folderId={parentId} title="More from this folder" />
          </Suspense>
        </div>
      ) : null}
    </main>
  )
}
