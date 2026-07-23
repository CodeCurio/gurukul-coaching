'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { loginSchema, type LoginInput } from '../../../lib/validations/auth-schema';
import { loginAction } from '../../../lib/actions/auth-actions';
import { ROUTES } from '../../../lib/constants/routes';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await loginAction(data);
      if (result.success && result.data) {
        // Force refresh session state and routing
        window.location.href = result.data.redirectUrl;
      } else {
        setErrorMsg(result.error || 'Invalid credentials');
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMsg('An unexpected network error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-slate-400 text-xs sm:text-sm">Sign in to your Gurukul dashboard</p>
      </div>

      {errorMsg && (
        <div className="bg-destructive-50 border border-destructive-100 text-destructive text-sm rounded-xl p-3 text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                errors.email ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Password
            </label>
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs font-semibold text-primary hover:text-primary-800 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 disabled:bg-slate-300 rounded-xl shadow-md transition-colors"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Prospective Student?{' '}
          <Link
            href={ROUTES.PUBLIC.REGISTER}
            className="font-semibold text-primary hover:text-primary-800 transition-colors"
          >
            Apply for Admission
          </Link>
        </p>
      </div>
    </div>
  );
}
