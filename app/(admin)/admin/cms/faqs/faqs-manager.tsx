'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Trash2, Plus, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { faqSchema, type FaqInput } from '@/lib/validations/cms-schema';
import { saveFAQAction, deleteFAQAction } from '@/lib/actions/cms-actions';


interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
}

interface FAQsManagerProps {
  initialFaqs: FAQ[];
}

export default function FAQsManager({ initialFaqs }: FAQsManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      display_order: 1,
      is_published: true,
    },
  });

  const openAdd = () => {
    setSelectedId(null);
    reset({
      question: '',
      answer: '',
      display_order: 1,
      is_published: true,
    });
    setShowModal(true);
  };

  const openEdit = (f: FAQ) => {
    setSelectedId(f.id);
    setValue('question', f.question);
    setValue('answer', f.answer);
    setValue('display_order', f.display_order);
    setValue('is_published', f.is_published);
    setShowModal(true);
  };

  const onSubmit = async (data: FaqInput) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await saveFAQAction(selectedId, data);
      if (res.success) {
        setFeedback({ success: true, msg: 'FAQ saved successfully!' });
        setShowModal(false);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to save FAQ.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await deleteFAQAction(id);
      if (res.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        setFeedback({ success: true, msg: 'FAQ deleted successfully.' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to delete.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add FAQ Item
        </button>
      </div>

      {feedback && (
        <div
          className={`border rounded-xl p-3.5 text-xs sm:text-sm flex gap-2 ${
            feedback.success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-destructive-50 border-destructive-100 text-destructive'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* FAQs List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-lg">Active FAQs List ({faqs.length})</h3>
        </div>

        {faqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6 w-1/3">Question</th>
                  <th className="py-4 px-6 w-1/3">Answer Preview</th>
                  <th className="py-4 px-6">Display Order</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {faqs.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-900 font-bold leading-relaxed">{f.question}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium line-clamp-2 max-w-xs truncate leading-relaxed">
                      {f.answer}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">{f.display_order}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        f.is_published
                          ? 'bg-success-50 border-success-100 text-success'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        {f.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(f)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Adjust
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-xs py-8 text-center italic">No FAQs configured.</p>
        )}
      </div>

      {/* Add / Edit FAQ Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5"
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-xl">
                {selectedId ? 'Adjust FAQ' : 'Add FAQ Item'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Add helper Q&A blocks to clarify admission terms.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-semibold">
              {/* Question */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Question Text *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the batch timing structure?"
                  {...register('question')}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white ${
                    errors.question ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                  }`}
                />
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Answer Text *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clarification details..."
                  {...register('answer')}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white resize-none ${
                    errors.answer ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Display Order
                  </label>
                  <input
                    type="number"
                    {...register('display_order', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Published Toggle */}
                <div className="space-y-1.5 flex items-center gap-2 pt-6">
                  <input
                    id="is_published"
                    type="checkbox"
                    {...register('is_published')}
                    className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_published" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer select-none">
                    Publish Q&A
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-md"
              >
                {loading ? 'Saving...' : 'Save Q&A'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export type { FAQ };
