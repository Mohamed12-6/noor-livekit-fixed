import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'noor-dev-secret');

// Pages anyone can open without a session.
const PUBLIC_PAGES = ['/login', '/signup'];
// Prefixes that must stay reachable without a session (auth APIs + payment return/webhook).
const PUBLIC_PREFIXES = ['/pay', '/api/auth', '/api/payments'];

async function readRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('noor_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  if (req.nextUrl.pathname !== '/') url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PAGES.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const role = await readRole(req);

  // Admin area — ADMIN only.
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin')) {
    if (role !== 'ADMIN') return redirectToLogin(req);
    return NextResponse.next();
  }

  // Teacher dashboard — TEACHER only.
  // NOTE: must be an EXACT match (or a sub-path), never startsWith('/teacher'):
  // '/teachers' is the STUDENT page listing the teachers, and '/teachers'.startsWith('/teacher')
  // is true — a plain startsWith() would treat the student page as teacher-only and bounce
  // every logged-in student straight back to /login right after signing in.
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    if (role !== 'TEACHER') return redirectToLogin(req);
    return NextResponse.next();
  }

  // Other APIs answer JSON, never an HTML redirect (so fetch() gets a clean 401).
  if (pathname.startsWith('/api')) {
    if (!role) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    return NextResponse.next();
  }

  // Everything else (the whole student app + "/") needs a session: login first.
  if (!role) return redirectToLogin(req);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
