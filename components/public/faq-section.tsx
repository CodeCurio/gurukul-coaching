'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageSquare, PhoneCall } from 'lucide-react';

interface FAQItem {
  id: number;
  category: 'general' | 'academics' | 'tests' | 'fees';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    category: 'general',
    question: 'Which classes and subjects are taught at Gurukul Coaching Institute?',
    answer: 'We provide specialized offline classroom coaching for students from Class 1 through Class 12. For primary & middle classes (Class 1 to 8), we cover Mathematics, Science, English, and Social Studies. For senior classes (Class 9 to 12), we offer intensive coaching in Mathematics, Physics, Chemistry, Biology, and Commerce subjects.',
  },
  {
    id: 2,
    category: 'academics',
    question: 'What is the maximum batch size per class?',
    answer: 'We strictly limit our offline classroom batch sizes to a maximum of 20 students per batch. This guarantees that every student receives individual attention, customized feedback, and direct doubt resolution from faculty.',
  },
  {
    id: 3,
    category: 'tests',
    question: 'How are weekly homework and Sunday tests evaluated?',
    answer: 'Homework assignments are assigned daily and checked strictly during classroom sessions. Every Sunday, students sit for a mandatory subjective assessment test. Answer scripts are graded with detailed descriptive marks and shared directly with parents.',
  },
  {
    id: 4,
    category: 'fees',
    question: 'What is the admission procedure and fee structure?',
    answer: 'Admissions start by submitting the online registration form or visiting our office desk. After a short diagnostic counseling session, the batch is allocated. Fee details vary by class level and can be paid in monthly or quarterly installment plans.',
  },
  {
    id: 5,
    category: 'general',
    question: 'Are classes online or physical in-person classrooms?',
    answer: 'Gurukul is an exclusive offline physical coaching center. We strongly believe that physical classroom discipline, teacher-student interaction, and face-to-face doubt resolution produce superior conceptual clarity compared to online screens.',
  },
  {
    id: 6,
    category: 'academics',
    question: 'How do parent-teacher progress meetings (PTMs) work?',
    answer: 'We hold mandatory monthly Parent-Teacher Meetings. Parents receive a detailed progress report sheet containing weekly test scores, attendance records, homework compliance, and faculty notes.',
  },
];

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'academics' | 'tests' | 'fees'>('all');
  const [openId, setOpenId] = useState<number | null>(1); // Default first question open

  const filteredFaqs = FAQS.filter(
    (faq) => activeTab === 'all' || faq.category === activeTab
  );

  const toggleAccordion = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary rounded-full filter blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
            <HelpCircle className="w-3.5 h-3.5" /> Have Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Everything you need to know about Gurukul Coaching Institute admissions, batch schedules, tests, and academic policies.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { key: 'all', label: 'All Questions' },
            { key: 'general', label: 'General & Batches' },
            { key: 'academics', label: 'Classes & Faculty' },
            { key: 'tests', label: 'Sunday Tests & Homework' },
            { key: 'fees', label: 'Fees & Admissions' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? 'bg-secondary border-secondary text-slate-950 shadow-lg shadow-secondary/20'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 pt-2">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900/90 border border-white/15 hover:border-secondary/40 rounded-2xl overflow-hidden transition-colors shadow-lg"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-white hover:text-secondary transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-secondary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-secondary' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 bg-slate-950/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact Help Banner */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">Still have questions?</h4>
            <p className="text-xs text-slate-400">Our desk team is available Monday to Saturday (10 AM - 7 PM).</p>
          </div>
          <a
            href="tel:7985347987"
            className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 bg-secondary hover:bg-secondary-400 rounded-xl shadow-md transition-all shrink-0"
          >
            <PhoneCall className="w-4 h-4" /> Call: 7985347987
          </a>
        </div>
      </div>
    </section>
  );
}
