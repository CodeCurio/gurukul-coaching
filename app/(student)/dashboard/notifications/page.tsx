import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/constants/routes';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';

import { Bell, CheckCircle2, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentNotificationsPage() {
  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // 1. Fetch targeted and broadcast notifications
  const { data: notifications, error: fetchError } = await supabase
    .from('notifications')
    .select('*, profiles (full_name)')
    .or(`target_student_id.eq.${user.id},target_student_id.is.null`)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('Error fetching notifications:', fetchError);
  }

  // 2. Fetch notifications read by this student
  let readIds: Set<string> = new Set();
  try {
    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('student_id', user.id);

    if (reads) {
      readIds = new Set(reads.map((r) => r.notification_id));
    }
  } catch (error) {
    console.error('Error fetching read receipts:', error);
  }

  // 3. Mark all loaded notifications as read automatically
  if (notifications && notifications.length > 0) {
    try {
      const readInserts = notifications.map((n) => ({
        notification_id: n.id,
        student_id: user.id,
      }));

      await supabase
        .from('notification_reads')
        .upsert(readInserts, { onConflict: 'notification_id,student_id' });
    } catch (error) {
      console.error('Failed to auto-mark notifications as read:', error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Announcements</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Keep track of official institute news, holiday lists, and schedule alterations.
        </p>
      </div>

      {/* Notifications List */}
      {notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n) => {
            const isUnread = !readIds.has(n.id);
            const senderName = n.profiles?.full_name || 'Institute Desk';

            return (
              <div
                key={n.id}
                className={`p-6 rounded-3xl border shadow-sm transition-all relative overflow-hidden flex gap-4 ${
                  isUnread
                    ? 'bg-white border-primary-100 ring-1 ring-primary-50'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Visual indicator bar */}
                {isUnread && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                  isUnread
                    ? 'bg-primary-50 text-primary border-primary-100'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  <MessageSquare className="w-5 h-5" />
                </div>

                {/* Text Details */}
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{n.title}</h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {n.message}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Sender: {senderName}</span>
                    <span>
                      {n.target_student_id ? 'Targeted Notice' : 'Institute Broadcast'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 max-w-md mx-auto">
          <div className="text-4xl">🔔</div>
          <h3 className="text-lg font-bold text-slate-800">No Announcements</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            There are no active notifications or circulars published for your account right now.
          </p>
        </div>
      )}
    </div>
  );
}
