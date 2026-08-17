import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side guard for the back-office.
 * Verifies the Supabase session against the Auth server (getUser — the cookie
 * is never trusted blindly) and requires the profile role 'admin'.
 * Unauthorized -> 404 (we do not reveal that the route exists).
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let isAdmin = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  if (!isAdmin) {
    // Render the not-found page with a 404 status (never 403).
    return NextResponse.rewrite(new URL('/_blocked_not_found', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
