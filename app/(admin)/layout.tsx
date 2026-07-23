import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import AdminSidebar from '../../components/admin/admin-sidebar';
import AdminTopbar from '../../components/admin/admin-topbar';
import { ROUTES } from '../../lib/constants/routes';

export default async function AdminLayout({
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

  // Fetch admin profile details
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Gating check
  if (profile.role !== 'admin') {
    redirect(ROUTES.STUDENT.DASHBOARD);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col">
        {/* Admin Topbar */}
        <AdminTopbar adminName={profile.full_name} avatarUrl={profile.avatar_url} />

        {/* Dynamic subpages */}
        <main className="flex-grow p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
