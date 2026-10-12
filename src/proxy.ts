import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { cookies, nextUrl } = req;
  const token = cookies.get('payload-token')?.value;

  const authRoutes = ['/sign-in', '/sign-up'];
  const protectedRoutes = ['/cart'];

  if (token && authRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!token && protectedRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/sign-in?origin=cart', req.url));
  }

  return NextResponse.next();
}
