import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { type User } from '../server/payload-types'
import { type NextRequest } from 'next/server'

// SEND A REQUEST TO THE AUTH ROUTE IN THE SERVER WITH THE USER TOKEN STORED IN THE COOKIES
// AND RETURN THE CURRENT LOGGED IN USER
export async function getServerSideUser (cookies: ReadonlyRequestCookies | NextRequest['cookies']): Promise< { user: User | null } > {
  const token = cookies.get('payload-token')?.value
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`

    }
  })

  const { user } = (await res.json()) as { user: User | null }
  return { user }
}
