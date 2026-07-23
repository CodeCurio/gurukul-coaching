'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { resetPasswordSchema, type ResetPasswordInput } from '../../../lib/validations/auth-schema';
import { resetPasswordAction } from '../../../lib/actions/auth-actions';
import { ROUTES } from '../../../lib/constants/routes';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await resetPasswordAction(data);
      if (result.success) {
        setSuccess(true);
      } else {
        setErrorMsg(result.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center text-xl mx-auto border border-success/20">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Password Updated</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Your new password has been successfully configured. You can now sign in using your new credentials.
          </p>
        </div>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 rounded-xl shadow-md transition-colors"
        >
          Proceed to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Configure Password</h2>
        <p className="text-slate-400 text-xs sm:text-sm">Setup a secure, unique password for your account</p>
      </div>

      {errorMsg && (
        <div className="bg-destructive-50 border border-destructive-100 text-destructive text-sm rounded-xl p-3 text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                errors.password ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                errors.confirmPassword ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 disabled:bg-slate-300 rounded-xl shadow-md transition-colors"
        >
          {isSubmitting ? 'Configuring Password...' : 'Save Password'}
        </button>
      </form>
    </div>
  );
}
