import { getServerSideUser } from '@/lib/payload.utils'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware (req: NextRequest): Promise<NextResponse | any > {
  const { cookies, nextUrl } = req
  const { user } = await getServerSideUser(cookies)

  const protectedRoutes = ['/sign-in', '/sign-up']

  if (user && protectedRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/`)
  }
  return NextResponse.next()
}
