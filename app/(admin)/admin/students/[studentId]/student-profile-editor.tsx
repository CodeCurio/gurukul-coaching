'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Plus, Trash2, ShieldAlert, CheckCircle2, AlertCircle, Ban, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { adminStudentUpdateSchema } from '@/lib/validations/student-schema';
import { updateStudentByAdminAction, deactivateStudentAction, activateStudentAction, permanentlyDeleteStudentAction } from '@/lib/actions/admin-actions';
import { enrollStudentInSubjectAction, unenrollStudentFromSubjectAction } from '@/lib/actions/course-actions';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { CLASS_LEVELS } from '@/lib/constants/classes';
import { ROUTES } from '@/lib/constants/routes';


interface StudentProfileEditorProps {
  student: {
    id: string;
    roll_number: string;
    current_class: string;
    date_of_birth: string;
    guardian_name: string;
    guardian_phone_number: string;
    address: string;
    is_active: boolean;
    profiles: {
      full_name: string;
      phone_number: string;
    };
  };
  enrollments: { id: string; subject_name: string }[];
  availableCourses: { id: string; subject_name: string }[];
  feeLedger: {
    total_fee_amount: number;
    discount_amount: number;
    scholarship_amount: number;
    net_payable_amount: number;
    installments: {
      installment_number: number;
      amount_due: number;
      amount_paid: number;
      due_date: string;
      status: string;
    }[];
  } | null;
}

export default function StudentProfileEditor({
  student,
  enrollments,
  availableCourses,
  feeLedger,
}: StudentProfileEditorProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'fees' | 'danger'>('profile');
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Initialize profile form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(adminStudentUpdateSchema),
    defaultValues: {
      full_name: student.profiles.full_name,
      current_class: student.current_class,
      roll_number: student.roll_number,
      date_of_birth: student.date_of_birth,
      guardian_name: student.guardian_name,
      guardian_phone_number: student.guardian_phone_number,
      address: student.address,
      is_active: student.is_active,
    },
  });

  const onUpdateProfile = async (data: any) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await updateStudentByAdminAction(student.id, data);
      if (res.success) {
        setFeedback({ success: true, msg: 'Student profile updated successfully!' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to update student profile.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await deactivateStudentAction(student.id);
      if (res.success) {
        setFeedback({ success: true, msg: 'Student account has been deactivated.' });
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to deactivate student.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await activateStudentAction(student.id);
      if (res.success) {
        setFeedback({ success: true, msg: 'Student account has been reactivated.' });
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to activate student.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmName.trim().toLowerCase() !== student.profiles.full_name.trim().toLowerCase()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await permanentlyDeleteStudentAction(student.id, confirmName);
      if (res.success) {
        window.location.href = '/admin/students';
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to delete student.' });
        setActionLoading(false);
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'Failed to complete delete request.' });
      setActionLoading(false);
    }
  };

  const handleEnrollSubject = async (courseId: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await enrollStudentInSubjectAction(student.id, courseId);
      if (res.success) {
        setFeedback({ success: true, msg: 'Enrolled student in subject successfully!' });
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Enrollment failed.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenrollSubject = async (courseId: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await unenrollStudentFromSubjectAction(student.id, courseId);
      if (res.success) {
        setFeedback({ success: true, msg: 'Unenrolled student from subject successfully.' });
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Unenrollment failed.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Student Profile' },
    { id: 'courses', label: 'Subjects Mapping' },
    { id: 'fees', label: 'Fee Log Statement' },
    { id: 'danger', label: 'Danger Safety Zone' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Sub tabs nav */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setFeedback(null);
            }}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors focus:outline-none whitespace-nowrap ${
              activeTab === t.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Action feedback banner */}
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

      {/* Tab: Profile Edit Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit(onUpdateProfile)} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Student Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                {...register('full_name')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                  errors.full_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                }`}
              />
              {errors.full_name?.message && <p className="text-xs text-destructive">{errors.full_name.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="roll_number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Roll Number *
              </label>
              <input
                id="roll_number"
                type="text"
                {...register('roll_number')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                  errors.roll_number ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                }`}
              />
              {errors.roll_number?.message && <p className="text-xs text-destructive">{errors.roll_number.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="current_class" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Class Level *
              </label>
              <select
                id="current_class"
                {...register('current_class')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
              {errors.date_of_birth?.message && <p className="text-xs text-destructive">{errors.date_of_birth.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="guardian_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Guardian Name *
              </label>
              <input
                id="guardian_name"
                type="text"
                {...register('guardian_name')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                  errors.guardian_name ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                }`}
              />
              {errors.guardian_name?.message && <p className="text-xs text-destructive">{errors.guardian_name.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="guardian_phone_number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Guardian Phone Number *
              </label>
              <input
                id="guardian_phone_number"
                type="text"
                {...register('guardian_phone_number')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors ${
                  errors.guardian_phone_number ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
                }`}
              />
              {errors.guardian_phone_number?.message && (
                <p className="text-xs text-destructive">{errors.guardian_phone_number.message as string}</p>
              )}
            </div>

            {/* Active Status Toggles */}
            <div className="space-y-1.5 flex items-center gap-2 pt-5">
              <input
                id="is_active"
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:outline-none"
              />
              <label htmlFor="is_active" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer">
                Student Record Active in Roster
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Address *
            </label>
            <textarea
              id="address"
              rows={3}
              {...register('address')}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-colors resize-none ${
                errors.address ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'
              }`}
            />
            {errors.address?.message && <p className="text-xs text-destructive">{errors.address.message as string}</p>}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-800 active:bg-primary-900 rounded-xl shadow-md transition-colors"
            >
              <Save className="w-4.5 h-4.5" />
              Save Student Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab: Courses Enrollment mapping */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Enrolled Subjects List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
              Enrolled Subjects ({enrollments.length})
            </h3>

            {enrollments.length > 0 ? (
              <div className="space-y-2">
                {enrollments.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700"
                  >
                    <span>{sub.subject_name}</span>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUnenrollSubject(sub.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors"
                      title="Unenroll student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-6 text-center italic">Not mapped to any subjects.</p>
            )}
          </div>

          {/* Enrollable Subjects List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
              Available Subjects ({availableCourses.length})
            </h3>

            {availableCourses.length > 0 ? (
              <div className="space-y-2">
                {availableCourses.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700"
                  >
                    <span>{sub.subject_name}</span>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleEnrollSubject(sub.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-primary hover:text-primary-800 bg-primary-50 border border-primary-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Enroll
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-6 text-center italic">
                All class level subjects already mapped.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Fee history ledger */}
      {activeTab === 'fees' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Fee Ledger Records</h3>
            <Link
              href={`${ROUTES.ADMIN.FEES}/${student.id}`}
              className="text-xs font-bold text-primary hover:text-primary-800 transition-colors flex items-center gap-0.5 group"
            >
              Collect Fees
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {feeLedger ? (
            <div className="space-y-6">
              {/* Financial block */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50 border-b border-slate-100 text-xs sm:text-sm font-semibold">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Amount</div>
                  <div className="text-slate-800 font-extrabold text-lg">{formatCurrency(feeLedger.total_fee_amount)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Discount</div>
                  <div className="text-slate-800 font-extrabold text-lg">{formatCurrency(feeLedger.discount_amount)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Scholarship</div>
                  <div className="text-slate-800 font-extrabold text-lg">{formatCurrency(feeLedger.scholarship_amount)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Net Payable</div>
                  <div className="text-slate-900 font-extrabold text-lg">{formatCurrency(feeLedger.net_payable_amount)}</div>
                </div>
              </div>

              {/* Installments table */}
              <div className="px-6 pb-6">
                <h4 className="font-bold text-slate-700 text-sm mb-3">Installment Schedules</h4>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                        <th className="py-3 px-4">Installment</th>
                        <th className="py-3 px-4">Due</th>
                        <th className="py-3 px-4">Paid</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                      {feeLedger.installments.map((inst) => (
                        <tr key={inst.installment_number}>
                          <td className="py-3 px-4 font-bold text-slate-800">Installment #{inst.installment_number}</td>
                          <td className="py-3 px-4">{formatCurrency(inst.amount_due)}</td>
                          <td className="py-3 px-4 text-slate-500">{formatCurrency(inst.amount_paid)}</td>
                          <td className="py-3 px-4 text-slate-400">{formatDate(inst.due_date)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              inst.status === 'paid'
                                ? 'bg-success-50 text-success border-success-100'
                                : inst.status === 'overdue'
                                ? 'bg-destructive-50 text-destructive border-destructive-100'
                                : 'bg-warning-50 text-warning border-warning-100'
                            }`}>
                              {inst.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-8 text-center italic">No active fee ledger initialized.</p>
          )}
        </div>
      )}

      {/* Tab: Danger zone */}
      {activeTab === 'danger' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex gap-3 text-rose-800 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <span className="font-bold">Dangerous Action Warnings:</span>
              <p className="text-slate-600 leading-relaxed">
                Deactivating an account restricts student logins but retains historical data. Permanently deleting an account destroys authentication logs, enrollment histories, payment records, and fee ledgers recursively!
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Deactivation / Activation block */}
            <div className="py-6 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">
                  {student.is_active ? 'Deactivate Student Account' : 'Reactivate Student Account'}
                </h4>
                <p className="text-slate-400 text-xs max-w-md leading-normal">
                  {student.is_active
                    ? 'Temporary deactivation blocks this student from logging into their dashboard but preserves rosters.'
                    : 'Reactivating this record grants immediate access back to the student portal.'}
                </p>
              </div>
              {student.is_active ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleDeactivate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
                >
                  <Ban className="w-4.5 h-4.5 text-slate-500" />
                  Deactivate Account
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleActivate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-success text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4.5 h-4.5" />
                  Reactivate Account
                </button>
              )}
            </div>

            {/* Permanent deletion block */}
            <div className="py-6 last:pb-0 space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-rose-600 text-base">Permanently Delete Roster Record</h4>
                <p className="text-slate-400 text-xs max-w-md leading-normal">
                  This action is irreversible. All student details, enrollments, fee structures, and receipts are destroyed forever.
                </p>
              </div>

              <div className="space-y-3 max-w-sm">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Confirm by typing the student name: <span className="text-slate-800 select-none font-bold underline">{student.profiles.full_name}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student full name"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={
                    actionLoading ||
                    confirmName.trim().toLowerCase() !== student.profiles.full_name.trim().toLowerCase()
                  }
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-destructive hover:bg-red-700 disabled:bg-slate-200 rounded-xl transition-colors w-full"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
