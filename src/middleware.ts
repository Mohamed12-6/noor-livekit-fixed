import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'noor-dev-secret');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('noor_token')?.value;
    let role: string | null = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret());
        role = (payload.role as string) || null;
      } catch {
        role = null;
      }
    }
    if (role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/settings:update'],
};
