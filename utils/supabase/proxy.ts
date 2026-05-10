import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/login';
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isProfileRoute = request.nextUrl.pathname.startsWith('/profile');

  // Verify suspended status using Supabase client to avoid Prisma Edge Runtime issues
  if (user && (isDashboardRoute || isProfileRoute)) {
    const { data: userData } = await supabase
      .from('User')
      .select('status')
      .eq('id', user.id)
      .single();

    if (userData?.status === 'SUSPENDED') {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('suspended', 'true');
      return NextResponse.redirect(url);
    }
  }

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
