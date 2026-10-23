'use server'

import { revalidatePath } from 'next/cache'
import { getAdminState, createClient } from '@/lib/supabase/server'
import { listFolderVideos, parseDriveFolderId } from '@/lib/drive'

export type ActionState = { ok: boolean; message: string } | null

const UUID_PATTERN = /^[0-9a-f-]{36}$/i

async function requireAdmin() {
  const { supabase, isAdmin } = await getAdminState()
  if (!isAdmin) throw new Error('You must be an admin to do that.')
  return supabase
}

export async function claimAdmin(): Promise<ActionState> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('claim_admin')
  if (error || data !== true) {
    return { ok: false, message: 'An admin already exists for this site.' }
  }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'You are now the site admin.' }
}

async function syncLibraryVideos(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  libraryId: string,
  folderId: string,
) {
  const videos = await listFolderVideos(folderId)

  if (videos.length > 0) {
    const { error } = await supabase.from('videos').upsert(
      videos.map((v) => ({
        library_id: libraryId,
        drive_file_id: v.id,
        name: v.name,
        mime_type: v.mimeType,
        size_bytes: v.size,
        duration_ms: v.durationMs,
        folder_path: v.folderPath || null,
        drive_created_at: v.createdTime,
      })),
      { onConflict: 'library_id,drive_file_id' },
    )
    if (error) throw new Error(error.message)
  }

  const keepIds = videos.map((v) => v.id)
  const deleteQuery = supabase.from('videos').delete().eq('library_id', libraryId)
  const { error: deleteError } =
    keepIds.length > 0
      ? await deleteQuery.not('drive_file_id', 'in', `(${keepIds.join(',')})`)
      : await deleteQuery
  if (deleteError) throw new Error(deleteError.message)

  await supabase
    .from('libraries')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', libraryId)

  return videos.length
}

export async function createLibrary(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = await requireAdmin()
    const name = String(formData.get('name') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const folderId = parseDriveFolderId(String(formData.get('folder') ?? ''))

    if (!name || name.length > 120) return { ok: false, message: 'Name must be 1–120 characters.' }
    if (description.length > 1000) return { ok: false, message: 'Description is too long.' }
    if (!folderId) return { ok: false, message: 'Enter a valid Google Drive folder link or ID.' }

    const { data, error } = await supabase
      .from('libraries')
      .insert({ name, description: description || null, drive_folder_id: folderId })
      .select('id')
      .single()
    if (error) {
      return {
        ok: false,
        message: error.code === '23505' ? 'That folder is already in the catalog.' : error.message,
      }
    }

    let count = 0
    try {
      count = await syncLibraryVideos(supabase, data.id, folderId)
    } catch (err) {
      revalidatePath('/', 'layout')
      return {
        ok: false,
        message: `Library saved, but sync failed: ${(err as Error).message}`,
      }
    }

    revalidatePath('/', 'layout')
    return { ok: true, message: `Added "${name}" with ${count} video${count === 1 ? '' : 's'}.` }
  } catch (err) {
    return { ok: false, message: (err as Error).message }
  }
}

export async function syncLibrary(libraryId: string): Promise<ActionState> {
  try {
    if (!UUID_PATTERN.test(libraryId)) return { ok: false, message: 'Invalid library.' }
    const supabase = await requireAdmin()
    const { data: library, error } = await supabase
      .from('libraries')
      .select('id, drive_folder_id')
      .eq('id', libraryId)
      .single()
    if (error || !library) return { ok: false, message: 'Library not found.' }

    const count = await syncLibraryVideos(supabase, library.id, library.drive_folder_id)
    revalidatePath('/', 'layout')
    return { ok: true, message: `Synced ${count} video${count === 1 ? '' : 's'}.` }
  } catch (err) {
    return { ok: false, message: (err as Error).message }
  }
}

export async function deleteLibrary(libraryId: string): Promise<ActionState> {
  try {
    if (!UUID_PATTERN.test(libraryId)) return { ok: false, message: 'Invalid library.' }
    const supabase = await requireAdmin()
    const { error } = await supabase.from('libraries').delete().eq('id', libraryId)
    if (error) return { ok: false, message: error.message }
    revalidatePath('/', 'layout')
    return { ok: true, message: 'Library removed.' }
  } catch (err) {
    return { ok: false, message: (err as Error).message }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
