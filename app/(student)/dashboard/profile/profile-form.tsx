'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Save, AlertCircle } from 'lucide-react';
import { studentProfileUpdateSchema, type StudentProfileUpdateInput } from '@/lib/validations/student-schema';
import { updateStudentProfile } from '@/lib/actions/student-actions';
import { createClient } from '@/lib/supabase/client';


interface ProfileFormProps {
  initialData: {
    phone_number: string;
    avatar_url: string | null;
    guardian_phone_number: string;
    address: string;
    full_name: string;
    roll_number: string;
    current_class: string;
    date_of_birth: string;
    guardian_name: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatar_url);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StudentProfileUpdateInput>({
    resolver: zodResolver(studentProfileUpdateSchema),
    defaultValues: {
      phone_number: initialData.phone_number,
      address: initialData.address,
      guardian_phone_number: initialData.guardian_phone_number,
      avatar_url: initialData.avatar_url,
    },
  });

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setFeedback(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const supabase = createClient();

      // Upload file directly to Supabase storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarPreview(publicUrl);
      setValue('avatar_url', publicUrl, { shouldDirty: true });
      setFeedback({ success: true, msg: 'Avatar image uploaded successfully!' });
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message || 'Failed to upload avatar image.' });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: StudentProfileUpdateInput) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await updateStudentProfile(data);
      if (res.success) {
        setFeedback({ success: true, msg: 'Profile details saved successfully!' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to update details.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected network error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarChar = initialData.full_name.charAt(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar avatar upload / Brief profile */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
        <div className="relative w-28 h-28 mx-auto group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={initialData.full_name}
              className="w-full h-full rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-primary-50 text-primary border-2 border-primary-100 flex items-center justify-center font-bold text-3xl shadow-inner">
              {avatarChar}
            </div>
          )}
          <label className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-primary transition-colors cursor-pointer border border-white shadow-md">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={uploadAvatar}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-950 text-lg leading-tight">{initialData.full_name}</h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Roll No: {initialData.roll_number}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">
              Class Level
            </div>
            <div className="text-slate-800 text-sm">{initialData.current_class}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">
              DOB
            </div>
            <div className="text-slate-800 text-sm">{initialData.date_of_birth}</div>
          </div>
        </div>
      </div>

      {/* Main input form */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
          Profile Details
        </h3>

        {feedback && (
          <div
            className={`border rounded-xl p-3.5 text-xs sm:text-sm flex gap-2 ${
              feedback.success
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-destructive-50 border-destructive-100 text-destructive'
            }`}
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{feedback.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email (Disabled) */}
          <div className="space-y-1.5 opacity-70">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
              Registered Email (Read-Only)
            </label>
            <input
              type="text"
              disabled
              value={initialData.phone_number ? initialData.full_name : '' /* wait, not email, let's keep placeholder */}
              placeholder="student@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-not-allowed"
            />
          </div>

          {/* Student Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="phone_number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Student Phone Number *
            </label>
            <input
              id="phone_number"
              type="text"
              placeholder="e.g. 9876543210"
              {...register('phone_number')}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                errors.phone_number ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
              }`}
            />
            {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
          </div>

          {/* Guardian Name (Disabled) */}
          <div className="space-y-1.5 opacity-70">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
              Guardian Name (Read-Only)
            </label>
            <input
              type="text"
              disabled
              value={initialData.guardian_name}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-not-allowed"
            />
          </div>

          {/* Guardian Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="guardian_phone_number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Guardian Contact Number *
            </label>
            <input
              id="guardian_phone_number"
              type="text"
              placeholder="e.g. 9876543210"
              {...register('guardian_phone_number')}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                errors.guardian_phone_number ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
              }`}
            />
            {errors.guardian_phone_number && (
              <p className="text-xs text-destructive">{errors.guardian_phone_number.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Residential Address *
          </label>
          <textarea
            id="address"
            rows={3}
            placeholder="Enter residential address..."
            {...register('address')}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors resize-none ${
              errors.address ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
            }`}
          />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 disabled:bg-slate-300 rounded-xl shadow-md transition-colors"
          >
            <Save className="w-4.5 h-4.5" />
            {isSubmitting ? 'Saving Details...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
