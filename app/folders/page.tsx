import { Navbar } from '@/components/navbar'
import { FolderPicker } from '@/components/folder-picker'
import { getLibraryFolders } from '@/lib/library'
import { requireUser } from '@/lib/session'

export const metadata = { title: 'My Folders — StreamHive' }

export default async function FoldersPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const user = await requireUser()
  const [folders, { onboarding }] = await Promise.all([getLibraryFolders(user.id), searchParams])

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto max-w-4xl px-4 pb-32 pt-24 md:pt-28">
        <h1 className="text-balance text-3xl font-bold md:text-4xl">
          {onboarding ? 'Build your library' : 'My Folders'}
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Tick the Google Drive folders you want to stream from. Each folder becomes a row on your
          home screen, including videos in its subfolders.
        </p>
        <FolderPicker
          initialSelected={folders.map((f) => ({ id: f.folderId, name: f.name }))}
        />
      </main>
    </>
  )
}
