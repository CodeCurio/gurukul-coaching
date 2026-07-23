'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Trash2, Plus, AlertCircle, CheckCircle2, DollarSign, Calendar, BookOpen } from 'lucide-react';
import { courseSchema, type CourseInput } from '@/lib/validations/course-schema';
import { saveCourseAction, deleteCourseAction, updateStandardFeeAction } from '@/lib/actions/course-actions';
import { CLASS_LEVELS } from '@/lib/constants/classes';
import { formatCurrency } from '@/lib/utils/format-currency';


interface CoursesAndFeesManagerProps {
  courses: {
    id: string;
    subject_name: string;
    class_level: string;
    description: string;
    display_order: number;
    is_published: boolean;
  }[];
  standardFees: {
    class_level: string;
    total_fee_amount: number;
    number_of_installments: number;
  }[];
}

export default function CoursesAndFeesManager({ courses, standardFees }: CoursesAndFeesManagerProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'fees'>('courses');
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states for Course Add/Edit
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modal states for Standard Fee Edit
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      subject_name: '',
      class_level: 'Class 9',
      description: '',
      display_order: 1,
      is_published: true,
    },
  });

  // standard fee inline edits
  const [feeAmountInput, setFeeAmountInput] = useState(0);
  const [feeInstallmentsInput, setFeeInstallmentsInput] = useState(1);

  const openAddCourse = () => {
    setSelectedCourseId(null);
    reset({
      subject_name: '',
      class_level: 'Class 9',
      description: '',
      display_order: 1,
      is_published: true,
    });
    setShowCourseModal(true);
  };

  const openEditCourse = (course: any) => {
    setSelectedCourseId(course.id);
    setValue('subject_name', course.subject_name);
    setValue('class_level', course.class_level);
    setValue('description', course.description || '');
    setValue('display_order', course.display_order);
    setValue('is_published', course.is_published);
    setShowCourseModal(true);
  };

  const onSaveCourse = async (data: CourseInput) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await saveCourseAction(selectedCourseId, data);
      if (res.success) {
        setFeedback({ success: true, msg: 'Subject saved successfully!' });
        setShowCourseModal(false);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to save subject.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await deleteCourseAction(id);
      if (res.success) {
        setFeedback({ success: true, msg: 'Subject deleted successfully.' });
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to delete.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const openEditFee = (fee: any) => {
    setSelectedClassLevel(fee.class_level);
    setFeeAmountInput(fee.total_fee_amount);
    setFeeInstallmentsInput(fee.number_of_installments);
    setShowFeeModal(true);
  };

  const onSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassLevel) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await updateStandardFeeAction(
        selectedClassLevel,
        feeAmountInput,
        feeInstallmentsInput
      );
      if (res.success) {
        setFeedback({ success: true, msg: 'Standard fee templates updated!' });
        setShowFeeModal(false);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to update.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab select header */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('courses');
            setFeedback(null);
          }}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
            activeTab === 'courses'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Academic Batches
        </button>
        <button
          onClick={() => {
            setActiveTab('fees');
            setFeedback(null);
          }}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
            activeTab === 'fees'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Standard Fees Layout
        </button>
      </div>

      {/* Action feedback banners */}
      {feedback && (
        <div
          className={`border rounded-xl p-3.5 text-xs sm:text-sm flex gap-2 ${
            feedback.success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-destructive-50 border-destructive-100 text-destructive'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-destructive" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Tab: Courses manager */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddCourse}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Academic Subject
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <th className="py-4 px-6">Subject Name</th>
                      <th className="py-4 px-6">Class Level</th>
                      <th className="py-4 px-6">Display Order</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4.5 px-6 font-bold text-slate-800">{course.subject_name}</td>
                        <td className="py-4.5 px-6 text-slate-500 font-medium">{course.class_level}</td>
                        <td className="py-4.5 px-6 text-slate-500 font-mono text-xs">{course.display_order}</td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            course.is_published
                              ? 'bg-success-50 border-success-100 text-success'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            {course.is_published ? 'Published' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right space-x-2">
                          <button
                            onClick={() => openEditCourse(course)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors"
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
              <p className="text-slate-400 text-xs py-8 text-center italic">No subjects configured.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Standard fees manager */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-lg">Tuition Fee Standards</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6">Class Level</th>
                  <th className="py-4 px-6">Standard Annual Fee</th>
                  <th className="py-4 px-6">Installments Limit</th>
                  <th className="py-4 px-6 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {CLASS_LEVELS.map((cls) => {
                  const fee = standardFees.find((f) => f.class_level === cls) || {
                    class_level: cls,
                    total_fee_amount: 0,
                    number_of_installments: 1,
                  };

                  return (
                    <tr key={cls} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-bold text-slate-800">{cls}</td>
                      <td className="py-4.5 px-6 font-extrabold text-slate-900">
                        {fee.total_fee_amount > 0 ? formatCurrency(fee.total_fee_amount) : 'Not Configured'}
                      </td>
                      <td className="py-4.5 px-6 text-slate-500 font-medium">
                        {fee.number_of_installments} {fee.number_of_installments === 1 ? 'installment' : 'installments'}
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => openEditFee(fee)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-800 bg-primary-50 border border-primary-100 rounded-xl transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit(onSaveCourse)}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5"
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-xl">
                {selectedCourseId ? 'Adjust Subject' : 'Add Subject'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Map a subject batch to classroom levels.
              </p>
            </div>

            <div className="space-y-4">
              {/* Subject Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics / Physics"
                  {...register('subject_name')}
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none ${
                    errors.subject_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                  }`}
                />
                {errors.subject_name && (
                  <p className="text-xs text-destructive">{String(errors.subject_name.message)}</p>
                )}
              </div>

              {/* Class Level */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Class Level Allocation
                </label>
                <select
                  {...register('class_level')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
                >
                  {CLASS_LEVELS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Syllabus Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief notes..."
                  {...register('description')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none resize-none"
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
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5 flex items-center gap-2 pt-6">
                  <input
                    id="is_published"
                    type="checkbox"
                    {...register('is_published')}
                    className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:outline-none"
                  />
                  <label htmlFor="is_published" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer select-none">
                    Publish Online
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-md"
              >
                {loading ? 'Saving...' : 'Save Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Fee template */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={onSaveFee}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5"
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-xl">Adjust Standard Fees</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Update standard templates for <span className="font-bold text-slate-800">{selectedClassLevel}</span>.
              </p>
            </div>

            <div className="space-y-4">
              {/* Fee Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Standard Tuition Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={feeAmountInput}
                  onChange={(e) => setFeeAmountInput(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none font-bold"
                />
              </div>

              {/* Installments count */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Installments Breakdown Limit *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  value={feeInstallmentsInput}
                  onChange={(e) => setFeeInstallmentsInput(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-md"
              >
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
