import { auth } from '@/lib/auth'
import { DriveAuthError, getGoogleAccessToken, isValidDriveId } from '@/lib/google'

export const maxDuration = 300

const PASSTHROUGH_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'last-modified',
  'etag',
]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const { fileId } = await params
  if (!isValidDriveId(fileId)) return new Response('Bad request', { status: 400 })

  let token: string
  try {
    token = await getGoogleAccessToken(session.user.id)
  } catch (error) {
    if (error instanceof DriveAuthError) return new Response('Reconnect Google', { status: 401 })
    throw error
  }

  const upstreamHeaders: Record<string, string> = { Authorization: `Bearer ${token}` }
  const range = request.headers.get('range')
  if (range) upstreamHeaders.Range = range

  const upstream = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: upstreamHeaders, signal: request.signal, cache: 'no-store' },
  )

  if (!upstream.ok && upstream.status !== 206) {
    return new Response('Unable to stream file', { status: upstream.status })
  }

  const headers = new Headers({ 'Cache-Control': 'private, no-store' })
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes')

  return new Response(upstream.body, { status: upstream.status, headers })
}
