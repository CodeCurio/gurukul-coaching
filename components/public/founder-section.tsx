'use client';

import Image from 'next/image';
import { Quote, Award, Users, CheckCircle, Sparkles } from 'lucide-react';

export default function FounderSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28 border-y border-white/10">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Founder Image Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl bg-slate-950 group">
              <Image
                src="/assets/banner1.png"
                alt="Founder Vishal Pandey - Gurukul Coaching Institute"
                fill
                className="object-cover object-right transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 p-5 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-slate-950">
                  <Sparkles className="w-3 h-3" /> Founder & Director
                </span>
                <h3 className="text-xl font-bold text-white">Vishal Pandey</h3>
                <p className="text-xs text-secondary-300 font-medium">
                  Gurukul Coaching Institute (Est. 2014)
                </p>
              </div>
            </div>
          </div>

          {/* Founder Message & Highlights */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
                <Award className="w-3.5 h-3.5" /> Leadership & Vision
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                "Your Success is Our Single Commitment."
              </h2>
            </div>

            <div className="relative bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm space-y-4">
              <Quote className="w-10 h-10 text-accent opacity-60" />
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed italic">
                At Gurukul Coaching Institute, we don't just teach subjects—we shape minds. Every student from Class 1 to 12 possesses unique potential. Through small batch sizes, regular progress tracking, and personal attention, we ensure no child is left behind.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-slate-400 font-mono">
                <span>— Vishal Pandey, Founder</span>
                <span>Contact: +91 7985347987</span>
              </div>
            </div>

            {/* Core Commitments List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div className="text-left space-y-0.5">
                  <h4 className="text-sm font-bold text-white">Personalized Mentorship</h4>
                  <p className="text-xs text-slate-400">Direct access to experienced subject faculty.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div className="text-left space-y-0.5">
                  <h4 className="text-sm font-bold text-white">Small Batch Focus</h4>
                  <p className="text-xs text-slate-400">Max 20 students per class for 1-on-1 doubt clearing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div className="text-left space-y-0.5">
                  <h4 className="text-sm font-bold text-white">Weekly Sunday Testing</h4>
                  <p className="text-xs text-slate-400">Rigorous descriptive exams matching board standards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div className="text-left space-y-0.5">
                  <h4 className="text-sm font-bold text-white">Parent Progress Transparency</h4>
                  <p className="text-xs text-slate-400">Regular PTMs & report updates direct to parents.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
