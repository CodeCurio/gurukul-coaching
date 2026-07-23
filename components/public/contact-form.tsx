'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { contactFormSchema, type ContactFormInput } from '../../lib/validations/contact-schema';
import { submitContactFormAction } from '../../lib/actions/registration-actions';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ContactFormInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitContactFormAction(data);
      if (res.success) {
        setSuccess(true);
        reset();
      } else {
        setErrorMsg(res.error || 'Failed to send your message. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 space-y-4"
          >
            <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center text-xl mx-auto border border-success/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
              Thank you for contacting Gurukul Coaching Institute. Our administrative staff will reach out to you shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="inline-flex text-xs font-semibold text-primary hover:text-primary-800 transition-colors pt-2"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">Send an Inquiry</h3>

            {errorMsg && (
              <div className="bg-destructive-50 border border-destructive-100 text-destructive text-xs rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                placeholder="e.g. Anil Kumar"
                {...register('full_name')}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                  errors.full_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                }`}
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. name@example.com"
                  {...register('email')}
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                    errors.email ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone_number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Phone Number *
                </label>
                <input
                  id="phone_number"
                  type="text"
                  placeholder="e.g. 9876543210"
                  {...register('phone_number')}
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                    errors.phone_number ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                  }`}
                />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Message / Inquiry *
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Type your message here..."
                {...register('message')}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors resize-none ${
                  errors.message ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                }`}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 disabled:bg-slate-300 rounded-xl shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
