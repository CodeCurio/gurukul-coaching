'use client';

import Link from 'next/link';
import { ClipboardCheck, Building2, UserCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/constants/routes';

const STEPS = [
  {
    num: '01',
    title: 'Submit Online Registration',
    desc: 'Fill out student details and target class (Class 1 to 12) via our simple online application form.',
    icon: <ClipboardCheck className="w-6 h-6 text-secondary" />,
  },
  {
    num: '02',
    title: 'Desk Consultation Visit',
    desc: 'Our administrative desk reviews your application and schedules a campus visit with parent & student.',
    icon: <Building2 className="w-6 h-6 text-secondary" />,
  },
  {
    num: '03',
    title: 'Diagnostic Test & Batching',
    desc: 'A short diagnostic assessment to evaluate current concept clarity and assign the optimal small batch.',
    icon: <UserCheck className="w-6 h-6 text-secondary" />,
  },
  {
    num: '04',
    title: 'Classroom Onboarding',
    desc: 'Receive study material, timetable, and begin structured offline physical classroom sessions.',
    icon: <GraduationCap className="w-6 h-6 text-secondary" />,
  },
];

export default function AdmissionProcess() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
            Simple 4-Step Journey
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How to Get Admitted to Gurukul
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Our admission process is transparent, structured, and student-focused. Get started in just 4 simple steps.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-slate-950/80 border border-white/10 hover:border-secondary/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-secondary/20 group-hover:border-secondary/40 transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black font-mono text-white/20 group-hover:text-secondary/60 transition-colors">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-secondary transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] font-semibold text-secondary-300 uppercase tracking-wider">
                Step {step.num} of 04
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="text-center pt-4">
          <Link
            href={ROUTES.PUBLIC.REGISTER}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-accent via-accent-400 to-accent-300 hover:brightness-110 rounded-2xl shadow-xl transition-all group"
          >
            Start Student Admission Now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
