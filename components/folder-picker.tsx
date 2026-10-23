'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Check, ChevronRight, Folder, HardDrive, Loader2, Users, X } from 'lucide-react'
import { saveLibraryFolders } from '@/app/actions/library'
import { cn } from '@/lib/utils'

type DriveFolder = { id: string; name: string }
type Crumb = { id: string; name: string }

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Unable to load folders')
  return data as { folders: DriveFolder[] }
}

const roots: (Crumb & { icon: typeof HardDrive })[] = [
  { id: 'root', name: 'My Drive', icon: HardDrive },
  { id: 'shared', name: 'Shared with me', icon: Users },
]

export function FolderPicker({ initialSelected }: { initialSelected: DriveFolder[] }) {
  const router = useRouter()
  const [path, setPath] = useState<Crumb[]>([roots[0]])
  const [selected, setSelected] = useState(
    () => new Map(initialSelected.map((f) => [f.id, f.name])),
  )
  const [isSaving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)

  const current = path[path.length - 1]
  const { data, error, isLoading } = useSWR(
    `/api/drive/folders?parent=${encodeURIComponent(current.id)}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  function toggle(folder: DriveFolder) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(folder.id)) next.delete(folder.id)
      else next.set(folder.id, folder.name)
      return next
    })
  }

  function handleSave() {
    setSaveError(null)
    startSaving(async () => {
      try {
        await saveLibraryFolders([...selected].map(([id, name]) => ({ id, name })))
        router.push('/')
        router.refresh()
      } catch {
        setSaveError('Could not save your folders. Please try again.')
      }
    })
  }

  return (
    <div className="mt-8">
      <div className="flex gap-2" role="tablist" aria-label="Drive location">
        {roots.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={path[0].id === id}
            onClick={() => setPath([{ id, name }])}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
              path[0].id === id
                ? 'bg-foreground text-background'
                : 'bg-card text-foreground hover:bg-accent',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {name}
          </button>
        ))}
      </div>

      <nav aria-label="Folder path" className="mt-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {path.map((crumb, index) => (
            <li key={crumb.id} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="size-4" aria-hidden="true" /> : null}
              <button
                type="button"
                onClick={() => setPath(path.slice(0, index + 1))}
                className={cn(
                  'rounded px-1 hover:text-foreground',
                  index === path.length - 1 && 'font-semibold text-foreground',
                )}
              >
                {crumb.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Loading folders…
          </div>
        ) : error ? (
          <p role="alert" className="p-10 text-center text-primary">
            {error.message}
          </p>
        ) : data && data.folders.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">No subfolders here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data?.folders.map((folder) => {
              const checked = selected.has(folder.id)
              return (
                <li key={folder.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(folder)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                        checked ? 'border-primary bg-primary' : 'border-muted-foreground',
                      )}
                    >
                      {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
                    </span>
                    <Folder className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{folder.name}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPath([...path, { id: folder.id, name: folder.name }])}
                    className="flex items-center gap-1 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    Open
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <span className="sr-only">{folder.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {selected.size === 0 ? (
              <p className="text-sm text-muted-foreground">No folders selected</p>
            ) : (
              [...selected].map(([id, name]) => (
                <span
                  key={id}
                  className="flex max-w-48 items-center gap-1 rounded-full bg-card py-1 pl-3 pr-1 text-xs"
                >
                  <span className="truncate">{name}</span>
                  <button
                    type="button"
                    onClick={() => toggle({ id, name })}
                    className="rounded-full p-0.5 hover:bg-accent"
                  >
                    <X className="size-3" aria-hidden="true" />
                    <span className="sr-only">Remove {name}</span>
                  </button>
                </span>
              ))
            )}
          </div>
          {saveError ? (
            <p role="alert" className="text-sm text-primary">
              {saveError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || selected.size === 0}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save {selected.size > 0 ? `${selected.size} folder${selected.size > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
