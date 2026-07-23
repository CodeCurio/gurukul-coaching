'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, UserPlus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { saveInstituteSettingsAction } from '@/lib/actions/cms-actions';

interface SettingsManagerProps {
  initialSettings: {
    institute_name: string;
    logo_storage_path: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    primary_color: string;
  };
}

export default function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Global Settings Form
  const [instName, setInstName] = useState(initialSettings.institute_name);
  const [logoPath, setLogoPath] = useState(initialSettings.logo_storage_path);
  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email);
  const [contactPhone, setContactPhone] = useState(initialSettings.contact_phone);
  const [address, setAddress] = useState(initialSettings.address);
  const [themeColor, setThemeColor] = useState(initialSettings.primary_color);

  // New Admin Form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await saveInstituteSettingsAction({
        institute_name: instName,
        logo_storage_path: logoPath,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
        primary_color: themeColor,
      });

      if (res.success) {
        setFeedback({ success: true, msg: 'Global settings saved successfully!' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim() || !newAdminPhone.trim()) return;

    setLoading(true);
    setFeedback(null);
    try {
      // Re-use createAdminAccountAction from admin-actions (we can import it here!)
      // Wait, is it in cms-actions or admin-actions? We wrote it in admin-actions!
      // Let's import it from admin-actions.
      const { createAdminAccountAction } = await import('@/lib/actions/admin-actions');
      const res = await createAdminAccountAction(
        newAdminEmail.trim(),
        newAdminName.trim(),
        newAdminPhone.trim()
      );

      if (res.success) {
        setFeedback({
          success: true,
          msg: `Secondary administrator account created for ${newAdminName}. Access invitation dispatched!`,
        });
        setNewAdminEmail('');
        setNewAdminName('');
        setNewAdminPhone('');
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to create account.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'Failed to complete transaction.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Global Config Form */}
      <form onSubmit={handleSaveSettings} className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
          Global Config Settings
        </h3>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Institute Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Institute Title *
            </label>
            <input
              type="text"
              required
              value={instName}
              onChange={(e) => setInstName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Contact Email *
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Office Phone Number *
            </label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
            />
          </div>

          {/* Color theme hex */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Primary Theme Color (Hex) *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
              />
              <input
                type="text"
                required
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Campus Address *
          </label>
          <textarea
            rows={3}
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white resize-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 rounded-xl shadow-md transition-colors"
          >
            <Save className="w-4.5 h-4.5" />
            {loading ? 'Saving changes...' : 'Save Config Parameters'}
          </button>
        </div>
      </form>

      {/* Danger Admin Provisioning Panel */}
      <div className="lg:col-span-4 space-y-6">
        <form onSubmit={handleCreateAdmin} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Create Admin Account
          </h3>

          <div className="flex gap-2 text-rose-800 bg-rose-50 border border-rose-100 p-3 rounded-2xl">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-normal text-slate-600">
              Warning: Administrative accounts have complete write permissions. Dispatched users can edit databases, collections, and approve registrations.
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm font-semibold">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Singh"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin@gurukul.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9876543210"
                value={newAdminPhone}
                onChange={(e) => setNewAdminPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newAdminEmail.trim() || !newAdminName.trim() || !newAdminPhone.trim()}
              className="inline-flex items-center justify-center gap-1 w-full px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm pt-2"
            >
              <UserPlus className="w-4 h-4" /> Provision Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export type { SettingsManagerProps };
