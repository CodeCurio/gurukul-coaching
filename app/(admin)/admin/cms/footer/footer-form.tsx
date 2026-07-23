'use client';

import { useState } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveCMSContentAction } from '@/lib/actions/cms-actions';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);



interface FooterFormProps {
  initialContent: {
    description: string;
    copyright: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
  };
}

export default function FooterForm({ initialContent }: FooterFormProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [description, setDescription] = useState(initialContent.description);
  const [copyright, setCopyright] = useState(initialContent.copyright);
  const [facebookUrl, setFacebookUrl] = useState(initialContent.facebook_url);
  const [instagramUrl, setInstagramUrl] = useState(initialContent.instagram_url);
  const [youtubeUrl, setYoutubeUrl] = useState(initialContent.youtube_url);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await saveCMSContentAction('footer_settings', {
        description,
        copyright,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        youtube_url: youtubeUrl,
      });

      if (res.success) {
        setFeedback({ success: true, msg: 'Footer settings updated successfully!' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
        Footer Summary & Branding
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

      {/* Description & Copyright */}
      <div className="space-y-4 text-xs sm:text-sm font-semibold">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Short Description Text
          </label>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Copyright Line Text
          </label>
          <input
            type="text"
            required
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Social URLs */}
      <h3 className="text-lg font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">
        Social Networking Links
      </h3>
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Facebook */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <FacebookIcon className="w-4 h-4 text-slate-500" />
            Facebook Page Link
          </label>
          <input
            type="url"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            placeholder="https://facebook.com/..."
          />
        </div>

        {/* Instagram */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <InstagramIcon className="w-4 h-4 text-slate-500" />
            Instagram Channel Link
          </label>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            placeholder="https://instagram.com/..."
          />
        </div>

        {/* YouTube */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <YoutubeIcon className="w-4 h-4 text-slate-500" />
            YouTube Channel Link
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 rounded-xl shadow-md transition-colors"
        >
          <Save className="w-4.5 h-4.5" />
          {loading ? 'Saving Changes...' : 'Save Footer settings'}
        </button>
      </div>
    </form>
  );
}
export type { FooterFormProps };
