'use client';

import { useState } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveCMSContentAction } from '@/lib/actions/cms-actions';


interface HomepageFormProps {
  initialContent: {
    hero_title: string;
    hero_subtitle: string;
    cta_primary_label: string;
    cta_secondary_label: string;
    stat_students_count: string;
    stat_students_label: string;
    stat_selection_count: string;
    stat_selection_label: string;
    stat_experience_count: string;
    stat_experience_label: string;
  };
}

export default function HomepageForm({ initialContent }: HomepageFormProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // States for CMS values
  const [heroTitle, setHeroTitle] = useState(initialContent.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(initialContent.hero_subtitle);
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(initialContent.cta_primary_label);
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(initialContent.cta_secondary_label);

  const [statStudentsCount, setStatStudentsCount] = useState(initialContent.stat_students_count);
  const [statStudentsLabel, setStatStudentsLabel] = useState(initialContent.stat_students_label);
  const [statSelectionCount, setStatSelectionCount] = useState(initialContent.stat_selection_count);
  const [statSelectionLabel, setStatSelectionLabel] = useState(initialContent.stat_selection_label);
  const [statExperienceCount, setStatExperienceCount] = useState(initialContent.stat_experience_count);
  const [statExperienceLabel, setStatExperienceLabel] = useState(initialContent.stat_experience_label);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await saveCMSContentAction('homepage_hero', {
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        cta_primary_label: ctaPrimaryLabel,
        cta_secondary_label: ctaSecondaryLabel,
        stat_students_count: statStudentsCount,
        stat_students_label: statStudentsLabel,
        stat_selection_count: statSelectionCount,
        stat_selection_label: statSelectionLabel,
        stat_experience_count: statExperienceCount,
        stat_experience_label: statExperienceLabel,
      });

      if (res.success) {
        setFeedback({ success: true, msg: 'Homepage content updated successfully!' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to update homepage content.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
        Hero Banner Content
      </h3>

      {feedback && (
        <div
          className={`border rounded-xl p-3.5 text-xs sm:text-sm flex gap-2 ${
            feedback.success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-destructive-50 border-destructive-100 text-destructive'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-destructive" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Hero Title and Subtitle */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Hero Headline Title
          </label>
          <input
            type="text"
            required
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Hero Subtitle Text
          </label>
          <textarea
            rows={3}
            required
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* CTA Button Labels */}
      <h3 className="text-lg font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">
        Call to Actions Buttons
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Primary Button Label
          </label>
          <input
            type="text"
            required
            value={ctaPrimaryLabel}
            onChange={(e) => setCtaPrimaryLabel(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Secondary Button Label
          </label>
          <input
            type="text"
            required
            value={ctaSecondaryLabel}
            onChange={(e) => setCtaSecondaryLabel(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Stats Counters */}
      <h3 className="text-lg font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">
        Performance Statistics Stats Counters
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Stat Column 1</h4>
          <div className="space-y-2 text-xs font-semibold">
            <input
              type="text"
              placeholder="Value (e.g. 500+)"
              value={statStudentsCount}
              onChange={(e) => setStatStudentsCount(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:bg-white"
            />
            <input
              type="text"
              placeholder="Label (e.g. Students Enrolled)"
              value={statStudentsLabel}
              onChange={(e) => setStatStudentsLabel(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:bg-white text-slate-500"
            />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Stat Column 2</h4>
          <div className="space-y-2 text-xs font-semibold">
            <input
              type="text"
              placeholder="Value (e.g. 96%)"
              value={statSelectionCount}
              onChange={(e) => setStatSelectionCount(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:bg-white"
            />
            <input
              type="text"
              placeholder="Label (e.g. Success Rate)"
              value={statSelectionLabel}
              onChange={(e) => setStatSelectionLabel(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:bg-white text-slate-500"
            />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Stat Column 3</h4>
          <div className="space-y-2 text-xs font-semibold">
            <input
              type="text"
              placeholder="Value (e.g. 10+)"
              value={statExperienceCount}
              onChange={(e) => setStatExperienceCount(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:bg-white"
            />
            <input
              type="text"
              placeholder="Label (e.g. Years of Rigor)"
              value={statExperienceLabel}
              onChange={(e) => setStatExperienceLabel(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:bg-white text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 rounded-xl shadow-md transition-colors"
        >
          <Save className="w-4.5 h-4.5" />
          {loading ? 'Saving Changes...' : 'Save Homepage Content'}
        </button>
      </div>
    </form>
  );
}
export type { HomepageFormProps };
