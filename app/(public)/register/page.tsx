'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, User, Phone, MapPin, GraduationCap } from 'lucide-react';
import { registrationSchema, personalDetailsSchema, guardianDetailsSchema, academicDetailsSchema, type RegistrationInput } from '../../../lib/validations/registration-schema';
import { submitRegistrationAction } from '../../../lib/actions/registration-actions';
import { CLASS_LEVELS } from '../../../lib/constants/classes';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string } | null>(null);

  // Initialize React Hook Form with full registrationSchema so all step values are preserved
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    // Validate only fields corresponding to the current step
    const fieldsToValidate =
      step === 1
        ? ['student_full_name', 'date_of_birth', 'gender', 'applying_for_class']
        : step === 2
        ? ['guardian_name', 'guardian_relation', 'phone_number', 'email']
        : ['address', 'previous_school'];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: RegistrationInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await submitRegistrationAction(data);
      if (response.success && response.data) {
        setSuccessData({ id: response.data.admissionId });
      } else {
        setSubmitError(response.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      setSubmitError('An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Steps Visual Headers
  const steps = [
    { num: 1, label: 'Student Info', icon: <User className="w-4 h-4" /> },
    { num: 2, label: 'Guardian Info', icon: <Phone className="w-4 h-4" /> },
    { num: 3, label: 'Address & School', icon: <MapPin className="w-4 h-4" /> },
  ];

  if (successData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-3xl p-8 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center text-3xl mx-auto border border-success/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Application Received!</h2>
            <p className="text-slate-500 text-sm">
              Thank you for submitting your application to Gurukul Coaching Institute. We have recorded your admission request.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Application Reference Key
            </div>
            <div className="text-sm font-mono text-slate-800 break-all select-all font-semibold">
              {successData.id}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal pt-1">
              Please save this key. You can use it to track your admission status. An administrator will call you shortly to schedule an interview.
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-800 rounded-xl shadow-md transition-colors"
          >
            Back to Homepage
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 bg-white border border-slate-200 p-6 sm:p-10 rounded-3xl shadow-lg">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-50 text-accent border border-accent-100">
            <GraduationCap className="w-3.5 h-3.5" />
            Admissions Open (Class 1 to 12)
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Admission Registration</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Fill out the form below. The administrative office will process your pending application.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    step >= s.num
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {s.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold whitespace-nowrap ${
                    step >= s.num ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full mx-2 -mt-4 transition-colors duration-300 ${
                    step > s.num ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error notification */}
        {submitError && (
          <div className="bg-destructive-50 border border-destructive-100 text-destructive text-sm rounded-xl p-4">
            {submitError}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  Step 1: Student Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="student_full_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Student Full Name *
                    </label>
                    <input
                      id="student_full_name"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      {...register('student_full_name')}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.student_full_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    />
                    {errors.student_full_name && (
                      <p className="text-xs text-destructive">{errors.student_full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="date_of_birth" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Date of Birth *
                    </label>
                    <input
                      id="date_of_birth"
                      type="date"
                      {...register('date_of_birth')}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.date_of_birth ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="text-xs text-destructive">{errors.date_of_birth.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="gender" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      {...register('gender')}
                      defaultValue=""
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.gender ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-xs text-destructive">{errors.gender.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="applying_for_class" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Applying for Class *
                    </label>
                    <select
                      id="applying_for_class"
                      {...register('applying_for_class')}
                      defaultValue=""
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.applying_for_class ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    >
                      <option value="" disabled>Select Class Level</option>
                      {CLASS_LEVELS.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                    {errors.applying_for_class && (
                      <p className="text-xs text-destructive">{errors.applying_for_class.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  Step 2: Parent / Guardian Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="guardian_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Guardian Name *
                    </label>
                    <input
                      id="guardian_name"
                      type="text"
                      placeholder="e.g. Suresh Sharma"
                      {...register('guardian_name')}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.guardian_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    />
                    {errors.guardian_name && (
                      <p className="text-xs text-destructive">{errors.guardian_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="guardian_relation" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Relation *
                    </label>
                    <input
                      id="guardian_relation"
                      type="text"
                      placeholder="e.g. Father, Mother, Uncle"
                      {...register('guardian_relation')}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.guardian_relation ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    />
                    {errors.guardian_relation && (
                      <p className="text-xs text-destructive">{errors.guardian_relation.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone_number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Contact Mobile Number *
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
                    {errors.phone_number && (
                      <p className="text-xs text-destructive">{errors.phone_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. parent@example.com"
                      {...register('email')}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                        errors.email ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  Step 3: Address & Academic Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Residential Address *
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      placeholder="Enter your complete residential address..."
                      {...register('address')}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors resize-none ${
                        errors.address ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="previous_school" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Previous School Attended (Optional)
                    </label>
                    <input
                      id="previous_school"
                      type="text"
                      placeholder="e.g. St. Xavier's High School"
                      {...register('previous_school')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 rounded-xl shadow-md transition-all group"
              >
                Next Step
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-success hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 rounded-xl shadow-md transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
