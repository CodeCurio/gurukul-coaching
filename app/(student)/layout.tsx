import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import StudentSidebar from '../../components/student/student-sidebar';
import { ROUTES } from '../../lib/constants/routes';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch student profile details
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch unread notifications count
  let unreadCount = 0;
  try {
    // 1. Get all notifications targeted or broadcast to this student
    const { data: allNotifications } = await supabase
      .from('notifications')
      .select('id')
      .or(`target_student_id.eq.${user.id},target_student_id.is.null`);

    if (allNotifications && allNotifications.length > 0) {
      const notificationIds = allNotifications.map((n) => n.id);

      // 2. Count how many of these have read records
      const { count: readCount } = await supabase
        .from('notification_reads')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id)
        .in('notification_id', notificationIds);

      unreadCount = allNotifications.length - (readCount || 0);
    }
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
  }

  const avatarChar = profile.full_name.charAt(0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Dashboard Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gurukul Student Portal</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <Link
              href={ROUTES.STUDENT.NOTIFICATIONS}
              className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-5.5 h-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 border border-white text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Brief */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="leading-tight text-right hidden sm:block">
                <span className="block text-sm font-semibold text-slate-800">{profile.full_name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student</span>
              </div>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary border border-primary-100 flex items-center justify-center font-bold text-sm shadow-inner">
                  {avatarChar}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Sub-pages */}
        <main className="flex-grow p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
