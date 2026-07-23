import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { ROUTES } from './lib/constants/routes';

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Protected paths
  const isStudentRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');
  const isStatusPendingRoute = pathname === ROUTES.AUTH.PENDING_APPROVAL;
  const isStatusRejectedRoute = pathname === ROUTES.AUTH.REJECTED;

  // Protect student/admin dashboards
  if (isStudentRoute || isAdminRoute) {
    if (!user) {
      url.pathname = ROUTES.AUTH.LOGIN;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      url.pathname = ROUTES.AUTH.LOGIN;
      return NextResponse.redirect(url);
    }

    // Role verification
    if (isAdminRoute && profile.role !== 'admin') {
      url.pathname = ROUTES.STUDENT.DASHBOARD;
      return NextResponse.redirect(url);
    }

    if (isStudentRoute && profile.role !== 'student') {
      url.pathname = ROUTES.ADMIN.DASHBOARD;
      return NextResponse.redirect(url);
    }

    // Check admission status gating for students
    if (profile.role === 'student') {
      const { data: admission } = await supabase
        .from('admissions')
        .select('status')
        .eq('linked_student_id', user.id)
        .maybeSingle();

      const status = admission?.status || 'approved'; // Default to approved for manual student creations

      if (status === 'pending') {
        url.pathname = ROUTES.AUTH.PENDING_APPROVAL;
        return NextResponse.redirect(url);
      }

      if (status === 'rejected') {
        url.pathname = ROUTES.AUTH.REJECTED;
        return NextResponse.redirect(url);
      }
    }
  }

  // Handle direct access to pending-approval or rejected screens
  if (isStatusPendingRoute || isStatusRejectedRoute) {
    if (!user) {
      url.pathname = ROUTES.AUTH.LOGIN;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'student') {
      const { data: admission } = await supabase
        .from('admissions')
        .select('status')
        .eq('linked_student_id', user.id)
        .maybeSingle();

      const status = admission?.status || 'approved';

      if (status === 'approved') {
        url.pathname = ROUTES.STUDENT.DASHBOARD;
        return NextResponse.redirect(url);
      } else if (status === 'pending' && isStatusRejectedRoute) {
        url.pathname = ROUTES.AUTH.PENDING_APPROVAL;
        return NextResponse.redirect(url);
      } else if (status === 'rejected' && isStatusPendingRoute) {
        url.pathname = ROUTES.AUTH.REJECTED;
        return NextResponse.redirect(url);
      }
    } else if (profile?.role === 'admin') {
      // Admins shouldn't be on these screens
      url.pathname = ROUTES.ADMIN.DASHBOARD;
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth login/recovery pages
  const isAuthRoute =
    pathname === ROUTES.AUTH.LOGIN ||
    pathname === ROUTES.AUTH.FORGOT_PASSWORD ||
    pathname === ROUTES.AUTH.RESET_PASSWORD;

  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      url.pathname = ROUTES.ADMIN.DASHBOARD;
      return NextResponse.redirect(url);
    } else if (profile?.role === 'student') {
      url.pathname = ROUTES.STUDENT.DASHBOARD;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  // Run proxy on dashboards, settings, login/reset/pending/rejected routes
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/pending-approval',
    '/rejected',
  ],
};
