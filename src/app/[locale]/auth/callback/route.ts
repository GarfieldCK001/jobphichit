import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '';
  const role = url.searchParams.get('role') || 'job_seeker';

  // Extract locale from the URL path (/th/auth/callback or /en/auth/callback)
  const pathParts = url.pathname.split('/');
  const locale = ['th', 'en', 'zh'].includes(pathParts[1]) ? pathParts[1] : 'th';

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Get the newly authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Upsert profile — ignore errors (table may not be set up yet)
        await supabase.from('profiles').upsert({
          id: user.id,
          role,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null,
          avatar_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
        }, { onConflict: 'id' });


        // Redirect to the appropriate dashboard
        if (next) {
          return NextResponse.redirect(new URL(next, url.origin));
        }
        if (role === 'employer') {
          return NextResponse.redirect(new URL(`/${locale}/employer/dashboard`, url.origin));
        }
        return NextResponse.redirect(new URL(`/${locale}/seeker/dashboard`, url.origin));
      }
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(new URL(`/${locale}/auth/login?error=auth_failed`, url.origin));
}
