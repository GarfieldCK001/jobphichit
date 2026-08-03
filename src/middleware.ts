import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const locales = ['th', 'en', 'zh'];
const defaultLocale = 'th';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  // Start with a mutable response
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to both request and response so Server Components can read them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: always call getUser() — this refreshes the session if needed
  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard routes
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/(th|en|zh)/, '');
  const locale = pathname.split('/')[1] || defaultLocale;

  const protectedPaths = ['/seeker', '/employer', '/admin'];
  const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  // Run i18n middleware after auth check
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
