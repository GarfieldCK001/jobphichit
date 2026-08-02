import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const role = url.searchParams.get('role') || 'job_seeker';
  const locale = url.pathname.split('/')[1] || 'th';

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      // Upsert profile with role
      await supabase.from('profiles').upsert({
        id: data.user.id,
        role,
        full_name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          null,
        avatar_url:
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture ||
          null,
      }, { onConflict: 'id' });

      // Redirect to appropriate dashboard
      if (role === 'employer') {
        return NextResponse.redirect(new URL(`/${locale}/employer/dashboard`, url.origin));
      }
      return NextResponse.redirect(new URL(`/${locale}/seeker/dashboard`, url.origin));
    }
  }

  return NextResponse.redirect(new URL(`/${locale}/auth/login`, url.origin));
}
