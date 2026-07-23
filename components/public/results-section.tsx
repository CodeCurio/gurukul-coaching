'use client';

import { Trophy, Star, Award, Sparkles, GraduationCap } from 'lucide-react';

const TOPPERS = [
  {
    id: 1,
    name: 'Ananya Sharma',
    score: '98.6%',
    class: 'Class 10 Board',
    subject: 'Maths 100/100 | Science 99',
    tag: 'Overall City Topper',
    badge: '🏆 Rank 1',
  },
  {
    id: 2,
    name: 'Rohan Verma',
    score: '97.4%',
    class: 'Class 12 Science',
    subject: 'Physics 98 | Chemistry 97',
    tag: 'PCM Stream Topper',
    badge: '⭐ Gold Medalist',
  },
  {
    id: 3,
    name: 'Priya Mishra',
    score: '96.8%',
    class: 'Class 10 Board',
    subject: 'Maths 99 | English 98',
    tag: 'High Achiever',
    badge: '✨ Outstanding',
  },
  {
    id: 4,
    name: 'Aditya Gupta',
    score: '96.2%',
    class: 'Class 12 Commerce',
    subject: 'Accounts 99 | Economics 98',
    tag: 'Commerce Topper',
    badge: '🎯 Top Ranker',
  },
];

export default function ResultsSection() {
  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00c2ff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
            <Trophy className="w-3.5 h-3.5" /> Proven Track Record of Success
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Our Hall of Fame & Board Toppers
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Consistent excellence year after year. Gurukul Coaching Institute students consistently secure top percentages in Class 10 & 12 Board examinations.
          </p>
        </div>

        {/* Toppers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPPERS.map((topper) => (
            <div
              key={topper.id}
              className="relative bg-slate-900/90 border border-white/15 hover:border-secondary/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group"
            >
              {/* Top Badge */}
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary/20 text-secondary border border-secondary/30">
                  {topper.badge}
                </span>
                <Sparkles className="w-4 h-4 text-accent opacity-70 group-hover:rotate-12 transition-transform" />
              </div>

              {/* Score Highlight */}
              <div className="my-6 text-center space-y-1">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-300 to-yellow-500 font-mono tracking-tight">
                  {topper.score}
                </div>
                <div className="text-xs font-semibold text-secondary-300 uppercase tracking-widest">
                  {topper.tag}
                </div>
              </div>

              {/* Student Details */}
              <div className="space-y-2 pt-4 border-t border-white/10 text-center">
                <h3 className="font-bold text-lg text-white group-hover:text-secondary transition-colors">
                  {topper.name}
                </h3>
                <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5 text-accent" />
                  {topper.class}
                </div>
                <p className="text-[11px] text-slate-400 font-mono bg-white/5 py-1 px-2 rounded-lg border border-white/5">
                  {topper.subject}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Callout Band */}
        <div className="bg-gradient-to-r from-primary-900 via-slate-900 to-primary-900 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-accent">98.6%</div>
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Highest Board Score</div>
          </div>

          <div className="h-8 w-px bg-white/20 hidden sm:block" />

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-secondary">450+</div>
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Successful Alumni</div>
          </div>

          <div className="h-8 w-px bg-white/20 hidden sm:block" />

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-amber-400">100%</div>
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Board Pass Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
