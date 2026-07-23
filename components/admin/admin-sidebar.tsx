'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Image,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '../../lib/constants/routes';
import Logo from '../shared/logo';
import { signOutAction } from '../../lib/actions/auth-actions';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Students', path: ROUTES.ADMIN.STUDENTS, icon: <Users className="w-5 h-5" /> },
  { name: 'Admissions', path: ROUTES.ADMIN.ADMISSIONS, icon: <GraduationCap className="w-5 h-5" /> },
  { name: 'Courses & Fees', path: ROUTES.ADMIN.COURSES, icon: <BookOpen className="w-5 h-5" /> },
  { name: 'Fee Ledgers', path: ROUTES.ADMIN.FEES, icon: <CreditCard className="w-5 h-5" /> },
  { name: 'Gallery Uploads', path: ROUTES.ADMIN.GALLERY, icon: <Image className="w-5 h-5" /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [cmsOpen, setCmsOpen] = useState(pathname.startsWith('/admin/cms'));

  const handleLogout = async () => {
    const res = await signOutAction();
    if (res.success) {
      window.location.href = ROUTES.PUBLIC.HOME;
    }
  };

  const cmsSubitems = [
    { name: 'Homepage CMS', path: ROUTES.ADMIN.CMS_HOMEPAGE },
    { name: 'About CMS', path: ROUTES.ADMIN.CMS_ABOUT },
    { name: 'Testimonials CMS', path: ROUTES.ADMIN.CMS_TESTIMONIALS },
    { name: 'FAQs CMS', path: ROUTES.ADMIN.CMS_FAQS },
    { name: 'Footer CMS', path: ROUTES.ADMIN.CMS_FOOTER },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 bg-white/5">
        <div className="bg-white p-2 rounded-xl">
          <Logo />
        </div>
      </div>

      {/* Navigation Roster */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
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

        {/* CMS Nested Collapsible */}
        <div className="space-y-1">
          <button
            onClick={() => setCmsOpen(!cmsOpen)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              pathname.startsWith('/admin/cms')
                ? 'text-white bg-slate-800/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <span className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              CMS Pages
            </span>
            {cmsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {cmsOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1.5 border-l border-slate-800 ml-5">
              {cmsSubitems.map((sub) => {
                const isSubActive = pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    href={sub.path}
                    className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSubActive
                        ? 'text-primary bg-primary/10 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Analytics & Settings */}
        <Link
          href={ROUTES.ADMIN.ANALYTICS}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            pathname.startsWith(ROUTES.ADMIN.ANALYTICS)
              ? 'bg-primary text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Analytics & Reports
        </Link>

        <Link
          href={ROUTES.ADMIN.SETTINGS}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            pathname.startsWith(ROUTES.ADMIN.SETTINGS)
              ? 'bg-primary text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          Institute Settings
        </Link>
      </nav>

      {/* Sign Out */}
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
