'use client';

import { useState } from 'react';
import { Save, CheckCircle2, AlertCircle, BookOpen, Target, Eye } from 'lucide-react';
import { saveCMSContentAction } from '@/lib/actions/cms-actions';


interface AboutCMSFormProps {
  initialStory: { story_heading: string; story_text: string };
  initialMission: { mission_heading: string; mission_text: string };
  initialVision: { vision_heading: string; vision_text: string };
}

export default function AboutCMSForm({ initialStory, initialMission, initialVision }: AboutCMSFormProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Forms
  const [storyHeading, setStoryHeading] = useState(initialStory.story_heading);
  const [storyText, setStoryText] = useState(initialStory.story_text);

  const [missionHeading, setMissionHeading] = useState(initialMission.mission_heading);
  const [missionText, setMissionText] = useState(initialMission.mission_text);

  const [visionHeading, setVisionHeading] = useState(initialVision.vision_heading);
  const [visionText, setVisionText] = useState(initialVision.vision_text);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      // Run updates parallel
      const resStory = await saveCMSContentAction('about_story', {
        story_heading: storyHeading,
        story_text: storyText,
      });

      const resMission = await saveCMSContentAction('about_mission', {
        mission_heading: missionHeading,
        mission_text: missionText,
      });

      const resVision = await saveCMSContentAction('about_vision', {
        vision_heading: visionHeading,
        vision_text: visionText,
      });

      if (resStory.success && resMission.success && resVision.success) {
        setFeedback({ success: true, msg: 'About page contents saved successfully!' });
      } else {
        setFeedback({
          success: false,
          msg: 'One or more blocks failed to save. Please review logs.',
        });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {feedback && (
        <div
          className={`border rounded-xl p-3.5 text-xs sm:text-sm flex gap-2 ${
            feedback.success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-destructive-50 border-destructive-100 text-destructive'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Story */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-slate-900 text-lg">Our Story Block</h3>
        </div>
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Story Section Heading
            </label>
            <input
              type="text"
              required
              value={storyHeading}
              onChange={(e) => setStoryHeading(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Story Paragraph Text
            </label>
            <textarea
              rows={4}
              required
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Mission & Vision grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900 text-lg">Our Mission</h3>
          </div>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Mission Heading
              </label>
              <input
                type="text"
                required
                value={missionHeading}
                onChange={(e) => setMissionHeading(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Mission Description
              </label>
              <textarea
                rows={4}
                required
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
            </div>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Eye className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-slate-900 text-lg">Our Vision</h3>
          </div>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Vision Heading
              </label>
              <input
                type="text"
                required
                value={visionHeading}
                onChange={(e) => setVisionHeading(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Vision Description
              </label>
              <textarea
                rows={4}
                required
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 rounded-xl shadow-md transition-colors"
        >
          <Save className="w-4.5 h-4.5" />
          {loading ? 'Saving Changes...' : 'Save About Page Content'}
        </button>
      </div>
    </form>
  );
}
export type { AboutCMSFormProps };
