'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Trash2, Plus, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { testimonialSchema, type TestimonialInput } from '@/lib/validations/cms-schema';
import { saveTestimonialAction, deleteTestimonialAction } from '@/lib/actions/cms-actions';


interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  avatar_url: string | null;
  display_order: number;
  is_published: boolean;
}

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
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
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      author_name: '',
      author_role: 'Parent',
      content: '',
      avatar_url: '',
      display_order: 1,
      is_published: true,
    },
  });

  const openAdd = () => {
    setSelectedId(null);
    reset({
      author_name: '',
      author_role: 'Parent',
      content: '',
      avatar_url: '',
      display_order: 1,
      is_published: true,
    });
    setShowModal(true);
  };

  const openEdit = (t: Testimonial) => {
    setSelectedId(t.id);
    setValue('author_name', t.author_name);
    setValue('author_role', t.author_role);
    setValue('content', t.content);
    setValue('avatar_url', t.avatar_url || '');
    setValue('display_order', t.display_order);
    setValue('is_published', t.is_published);
    setShowModal(true);
  };

  const onSubmit = async (data: TestimonialInput) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await saveTestimonialAction(selectedId, data);
      if (res.success) {
        setFeedback({ success: true, msg: 'Testimonial saved successfully!' });
        setShowModal(false);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to save testimonial.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await deleteTestimonialAction(id);
      if (res.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        setFeedback({ success: true, msg: 'Testimonial deleted successfully.' });
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
          <Plus className="w-4 h-4" /> Add Testimonial
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

      {/* Testimonials List Grid */}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>{t.author_role}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] border ${
                    t.is_published
                      ? 'bg-success-50 border-success-100 text-success'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {t.is_published ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5 text-sm">
                <span className="font-bold text-slate-800">{t.author_name}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Adjust
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl max-w-sm mx-auto space-y-3">
          <div className="text-4xl text-slate-300">💬</div>
          <h3 className="font-bold text-slate-800">No Testimonials</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            Configure student and parent quotes to showcase real academic transformations.
          </p>
        </div>
      )}

      {/* Add / Edit Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5"
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-xl">
                {selectedId ? 'Adjust Quote' : 'Add Quote'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Feature parental and topper insights.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-semibold">
              <div className="grid grid-cols-2 gap-4">
                {/* Author Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Singh"
                    {...register('author_name')}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white ${
                      errors.author_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                    }`}
                  />
                </div>

                {/* Author Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Relationship Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parent of Class 10 Student"
                    {...register('author_role')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Quote Content */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Quote content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Insert testimonial text..."
                  {...register('content')}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white resize-none ${
                    errors.content ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
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

                {/* Status Toggle */}
                <div className="space-y-1.5 flex items-center gap-2 pt-6">
                  <input
                    id="is_published"
                    type="checkbox"
                    {...register('is_published')}
                    className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_published" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer select-none">
                    Publish quote
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
                {loading ? 'Saving...' : 'Save Quote'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export type { Testimonial };
