import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side guard for the back-office.
 * Refreshes the Supabase session and blocks any request to /admin
 * that is not an authenticated admin (profiles.role = 'admin').
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = data?.role === 'admin';
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
