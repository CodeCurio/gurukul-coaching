'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, CreditCard, BookOpen, Bell, Receipt, Settings, LogOut } from 'lucide-react';
import { ROUTES } from '../../lib/constants/routes';
import Logo from '../shared/logo';
import { signOutAction } from '../../lib/actions/auth-actions';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: ROUTES.STUDENT.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'My Profile', path: ROUTES.STUDENT.PROFILE, icon: <User className="w-5 h-5" /> },
  { name: 'Fees & Dues', path: ROUTES.STUDENT.FEES, icon: <CreditCard className="w-5 h-5" /> },
  { name: 'My Courses', path: ROUTES.STUDENT.COURSES, icon: <BookOpen className="w-5 h-5" /> },
  { name: 'Notifications', path: ROUTES.STUDENT.NOTIFICATIONS, icon: <Bell className="w-5 h-5" /> },
  { name: 'Receipts', path: ROUTES.STUDENT.RECEIPTS, icon: <Receipt className="w-5 h-5" /> },
  { name: 'Settings', path: ROUTES.STUDENT.SETTINGS, icon: <Settings className="w-5 h-5" /> },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const res = await signOutAction();
    if (res.success) {
      window.location.href = ROUTES.PUBLIC.HOME;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 bg-white/5">
        <div className="bg-white p-2 rounded-xl">
          <Logo />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Log Out Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
export type { SIDEBAR_ITEMS };
