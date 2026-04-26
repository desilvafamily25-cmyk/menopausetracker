import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];
const PAID_ROUTES = ['/dashboard', '/log', '/insights', '/doctor-report', '/treatments', '/supplements', '/settings'];

export async function middleware(request: NextRequest) {
  // If Supabase env vars aren't set yet (local dev without .env.local), pass through everything
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Require auth for protected routes
  if (!user && PAID_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Require payment for paid routes — only enforced when Stripe is configured
  if (user && process.env.STRIPE_SECRET_KEY && PAID_ROUTES.some((r) => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from('users')
      .select('has_paid, subscription_status')
      .eq('id', user.id)
      .single();

    if (!profile?.has_paid) {
      return NextResponse.redirect(new URL('/checkout', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
