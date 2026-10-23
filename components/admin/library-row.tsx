'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { deleteLibrary, syncLibrary, type ActionState } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import type { Library } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export function LibraryRow({ library, count }: { library: Library; count: number }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionState>(null)

  const synced = library.last_synced_at
    ? new Date(library.last_synced_at).toLocaleString()
    : 'never'

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Link href={`/library/${library.id}`} className="truncate font-medium hover:underline">
          {library.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {count} video{count === 1 ? '' : 's'} · last synced {synced}
        </p>
        {result && (
          <p
            role="status"
            className={cn('text-xs', result.ok ? 'text-primary' : 'text-destructive')}
          >
            {result.message}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(async () => setResult(await syncLibrary(library.id)))}
        >
          <RefreshCw className={cn('size-4', pending && 'animate-spin')} aria-hidden="true" />
          Sync
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Remove "${library.name}" from the catalog? Drive files are not touched.`))
              return
            startTransition(async () => setResult(await deleteLibrary(library.id)))
          }}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Remove</span>
        </Button>
      </div>
    </li>
  )
}
