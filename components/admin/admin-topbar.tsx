'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader2, User, GraduationCap, X } from 'lucide-react';
import { globalSearchAction } from '../../lib/actions/admin-actions';
import { ROUTES } from '../../lib/constants/routes';

interface AdminTopbarProps {
  adminName: string;
  avatarUrl: string | null;
}

export default function AdminTopbar({ adminName, avatarUrl }: AdminTopbarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<{
    students: { id: string; full_name: string; roll_number: string; current_class: string }[];
    admissions: { id: string; student_full_name: string; applying_for_class: string; status: string }[];
  }>({ students: [], admissions: [] });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length >= 2) {
        setLoading(true);
        try {
          const res = await globalSearchAction(trimmed);
          if (res.success && res.data) {
            setResults(res.data);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ students: [], admissions: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults({ students: [], admissions: [] });
    setShowDropdown(false);
  };

  const avatarChar = adminName.charAt(0);
  const totalResults = results.students.length + results.admissions.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      {/* Global Search Bar */}
      <div ref={containerRef} className="relative w-full max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            type="text"
            placeholder="Search students or admissions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown Overlay */}
        {showDropdown && (
          <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {totalResults === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching active students or applications found.
              </div>
            ) : (
              <>
                {/* Active Students section */}
                {results.students.length > 0 && (
                  <div className="p-2 space-y-1">
                    <h4 className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Active Students
                    </h4>
                    {results.students.map((s) => (
                      <Link
                        key={s.id}
                        href={`${ROUTES.ADMIN.STUDENTS}/${s.id}`}
                        onClick={clearSearch}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{s.full_name}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {s.roll_number} ({s.current_class})
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pending Admissions section */}
                {results.admissions.length > 0 && (
                  <div className="p-2 space-y-1">
                    <h4 className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Admission Applications
                    </h4>
                    {results.admissions.map((a) => (
                      <Link
                        key={a.id}
                        href={`${ROUTES.ADMIN.ADMISSIONS}/${a.id}`}
                        onClick={clearSearch}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{a.student_full_name}</span>
                        </div>
                        <span className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">
                            {a.applying_for_class}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            a.status === 'pending'
                              ? 'bg-warning-50 text-warning border border-warning-100'
                              : a.status === 'approved'
                              ? 'bg-success-50 text-success border border-success-100'
                              : 'bg-destructive-50 text-destructive border border-destructive-100'
                          }`}>
                            {a.status}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Admin Profile brief */}
      <div className="flex items-center gap-3">
        <div className="leading-tight text-right hidden sm:block">
          <span className="block text-sm font-semibold text-slate-800">{adminName}</span>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Administrator</span>
        </div>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={adminName}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
            {avatarChar}
          </div>
        )}
      </div>
    </header>
  );
}
