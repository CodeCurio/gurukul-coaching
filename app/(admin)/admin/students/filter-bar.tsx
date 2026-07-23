'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CLASS_LEVELS } from '../../../../lib/constants/classes';

export default function StudentFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [classLevel, setClassLevel] = useState(searchParams.get('classLevel') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams();
  };

  const updateParams = (newClass = classLevel, newStatus = status, newQuery = query) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('query', newQuery.trim());
    if (newClass !== 'all') params.set('classLevel', newClass);
    if (newStatus !== 'all') params.set('status', newStatus);

    router.push(`/admin/students?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery('');
    setClassLevel('all');
    setStatus('all');
    router.push('/admin/students');
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative w-full md:max-w-xs flex gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, roll number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-800 active:bg-primary-900 transition-colors shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Select Filters & Clear */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Class Filter */}
        <select
          value={classLevel}
          onChange={(e) => {
            setClassLevel(e.target.value);
            updateParams(e.target.value);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none font-semibold text-slate-700 transition-colors"
        >
          <option value="all">All Classes</option>
          {CLASS_LEVELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Active Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updateParams(classLevel, e.target.value);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none font-semibold text-slate-700 transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Clear Button */}
        {(query || classLevel !== 'all' || status !== 'all') && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
