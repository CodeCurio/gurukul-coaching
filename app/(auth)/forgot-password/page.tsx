'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../../lib/validations/auth-schema';
import { forgotPasswordAction } from '../../../lib/actions/auth-actions';
import { ROUTES } from '../../../lib/constants/routes';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    try {
      await forgotPasswordAction(data);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true); // Always set true for security
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center text-xl mx-auto border border-success/20">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Check Your Email</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            If an account exists for that email address, we have sent a secure link to reset your password.
          </p>
        </div>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 rounded-xl shadow-md transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
        <p className="text-slate-400 text-xs sm:text-sm">We will email you a password recovery link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 disabled:bg-slate-300 rounded-xl shadow-md transition-colors"
        >
          {isSubmitting ? 'Sending Link...' : 'Send Recovery Link'}
        </button>
      </form>

      <div className="text-center">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
