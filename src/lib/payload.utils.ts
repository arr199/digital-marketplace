import { getPayloadClient } from '@/server/get-payload'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { type User } from '../server/payload-types'
import { type NextRequest } from 'next/server'

export async function getServerSideUser (
  cookies: ReadonlyRequestCookies | NextRequest['cookies']
): Promise<{ user: User | null }> {
  const token = cookies.get('payload-token')?.value

  if (!token) return { user: null }

  // Pass the token as a JWT header: Payload's CSRF check rejects cookie auth without Origin/Sec-Fetch-Site,
  // which a server-to-server call like this one never has
  const headers = new Headers()
  headers.set('Authorization', `JWT ${token}`)

  try {
    const payload = await getPayloadClient({})
    const { user } = await payload.auth({ headers })
    return { user: (user as unknown as User) ?? null }
  } catch {
    return { user: null }
  }
}
