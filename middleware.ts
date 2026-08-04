import { NextResponse, type NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

/**
 * Server-side guard for the back-office.
 * Verifies the PocketBase session against the server (authRefresh — the cookie
 * model is client-writable and never trusted) and requires role 'admin'.
 * Unauthorized -> 404 (we do not reveal that the route exists).
 */
export async function middleware(request: NextRequest) {
  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090',
  );
  pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

  let isAdmin = false;
  if (pb.authStore.isValid) {
    try {
      const { record } = await pb.collection('users').authRefresh();
      isAdmin = record?.role === 'admin';
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    // Render the not-found page with a 404 status (never 403).
    return NextResponse.rewrite(new URL('/_blocked_not_found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
