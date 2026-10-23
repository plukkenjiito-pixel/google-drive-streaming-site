import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Hero, HeroSkeleton } from '@/components/browse/hero'
import { FolderRow } from '@/components/browse/folder-row'
import { VideoRow, VideoRowSkeleton } from '@/components/browse/video-row'
import { getContinueWatching, getLibraryFolders } from '@/lib/library'
import { requireUser } from '@/lib/session'

export default async function HomePage() {
  const user = await requireUser()
  const [folders, continueWatching] = await Promise.all([
    getLibraryFolders(user.id),
    getContinueWatching(user.id),
  ])

  if (folders.length === 0) redirect('/folders?onboarding=1')

  const inProgress = continueWatching.filter(
    (p) => p.duration === 0 || p.position / p.duration < 0.95,
  )

  return (
    <>
      <Navbar user={user} />
      <main className="pb-20">
        <Suspense fallback={<HeroSkeleton />}>
          <Hero userId={user.id} folders={folders} />
        </Suspense>

        <div className="relative z-10 -mt-16 flex flex-col gap-6 md:-mt-24 md:gap-10">
          {inProgress.length > 0 ? (
            <VideoRow
              title={`Continue Watching for ${user.name.split(' ')[0]}`}
              items={inProgress.map((p) => ({
                id: p.fileId,
                name: p.name,
                hasThumbnail: true,
                progress: p.duration > 0 ? p.position / p.duration : 0,
              }))}
            />
          ) : null}

          {folders.map((folder) => (
            <Suspense key={folder.folderId} fallback={<VideoRowSkeleton title={folder.name} />}>
              <FolderRow userId={user.id} folderId={folder.folderId} title={folder.name} />
            </Suspense>
          ))}
        </div>
      </main>
    </>
  )
}
