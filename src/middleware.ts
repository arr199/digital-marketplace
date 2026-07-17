import { NextResponse, type NextRequest } from 'next/server'

export async function middleware (req: NextRequest) {
  const { cookies, nextUrl } = req
  const token = cookies.get('payload-token')?.value

  const authRoutes = ['/sign-in', '/sign-up']
  const protectedRoutes = ['/cart']

  if (token && authRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/`)
  }

  if (!token && protectedRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/sign-in?origin=cart`)
  }

  return NextResponse.next()
}
