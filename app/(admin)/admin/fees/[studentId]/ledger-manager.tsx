'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle2, DollarSign, Edit3, Calendar, Plus, Coins } from 'lucide-react';
import { recordPaymentAction, applyDiscountScholarshipAction } from '@/lib/actions/fee-actions';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import DownloadReceiptButton from '@/components/student/download-receipt-button';



interface LedgerManagerProps {
  student: {
    roll_number: string;
    current_class: string;
    profiles: {
      full_name: string;
    };
  };
  ledger: {
    id: string;
    total_fee_amount: number;
    discount_amount: number;
    discount_reason: string | null;
    scholarship_amount: number;
    scholarship_reason: string | null;
    net_payable_amount: number;
    academic_year: string;
  };
  installments: {
    id: string;
    installment_number: number;
    amount_due: number;
    amount_paid: number;
    due_date: string;
    status: string;
    fee_receipts?: {
      id: string;
      receipt_number: string;
      amount: number;
      payment_method: string;
      issued_at: string;
      profiles: {
        full_name: string;
      } | null;
    }[];
  }[];
}

export default function LedgerManager({ student, ledger, installments }: LedgerManagerProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeInstallment, setActiveInstallment] = useState<any | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Payment Form Fields
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'cheque' | 'upi' | 'bank_transfer'>('cash');
  const [payNote, setPayNote] = useState('');

  // Discount Form Fields
  const [discountVal, setDiscountVal] = useState(ledger.discount_amount);
  const [discountReason, setDiscountReason] = useState(ledger.discount_reason || '');
  const [scholarshipVal, setScholarshipVal] = useState(ledger.scholarship_amount);
  const [scholarshipReason, setScholarshipReason] = useState(ledger.scholarship_reason || '');

  const totalPaid = installments.reduce((acc, inst) => acc + Number(inst.amount_paid), 0);
  const balance = Number(ledger.net_payable_amount) - totalPaid;

  const handleOpenPayment = (inst: any) => {
    setActiveInstallment(inst);
    setPayAmount(Number(inst.amount_due) - Number(inst.amount_paid));
    setPayNote('');
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInstallment || payAmount <= 0) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await recordPaymentAction(activeInstallment.id, {
        amount: payAmount,
        payment_method: payMethod,
        notes: payNote || undefined,
      });
      if (res.success) {
        setFeedback({ success: true, msg: 'Office payment recorded! Receipt generated successfully.' });
        setShowPaymentModal(false);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to record payment.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustments = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await applyDiscountScholarshipAction(ledger.id, {
        discount_amount: Number(discountVal),
        discount_reason: discountReason || undefined,
        scholarship_amount: Number(scholarshipVal),
        scholarship_reason: scholarshipReason || undefined,
      });
      if (res.success) {
        setFeedback({ success: true, msg: 'Discounts and scholarship values successfully updated!' });
        setShowAdjustModal(false);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to save adjustments.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'Failed to record adjustments.' });
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'Total Base Fee', val: ledger.total_fee_amount, color: 'text-slate-900 bg-slate-50 border-slate-100' },
    { label: 'Net Payable Fee', val: ledger.net_payable_amount, color: 'text-indigo-900 bg-indigo-50 border-indigo-100' },
    { label: 'Total Paid Fees', val: totalPaid, color: 'text-emerald-900 bg-emerald-50 border-emerald-100' },
    { label: 'Outstanding Balance', val: balance, color: balance > 0 ? 'text-rose-900 bg-rose-50 border-rose-100' : 'text-emerald-950 bg-emerald-100/50' },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border font-semibold shadow-sm space-y-1.5 ${m.color}`}>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</span>
            <div className="text-xl font-extrabold">{formatCurrency(m.val)}</div>
          </div>
        ))}
      </div>

      {/* Action banner feedback */}
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

      {/* Adjustments and Actions bar */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowAdjustModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Coins className="w-4 h-4" /> Scholarship / Discounts
        </button>
      </div>

      {/* Installment breakdown list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-lg">Tuition Schedule Details</h3>
        </div>

        {installments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {installments.map((inst) => {
              const outstanding = Number(inst.amount_due) - Number(inst.amount_paid);
              const receipts = inst.fee_receipts || [];

              return (
                <div key={inst.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/20 transition-colors">
                  {/* Left Side: installment description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-900 text-base">Installment #{inst.installment_number}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        inst.status === 'paid'
                          ? 'bg-success-50 border-success-100 text-success'
                          : inst.status === 'overdue'
                          ? 'bg-destructive-50 border-destructive-100 text-destructive'
                          : 'bg-warning-50 border-warning-100 text-warning'
                      }`}>
                        {inst.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-semibold space-x-4">
                      <span>Due: {formatCurrency(inst.amount_due)}</span>
                      <span>Paid: {formatCurrency(inst.amount_paid)}</span>
                      <span>Expiry: {formatDate(inst.due_date)}</span>
                    </div>

                    {/* Receipts listing */}
                    {receipts.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receipts:</span>
                        {receipts.map((rc) => (
                          <DownloadReceiptButton
                            key={rc.id}
                            receipt={{
                              receipt_number: rc.receipt_number,
                              amount: Number(rc.amount),
                              payment_method: rc.payment_method,
                              issued_at: rc.issued_at,
                              student_name: student.profiles.full_name,
                              roll_number: student.roll_number,
                              current_class: student.current_class,
                              installment_number: inst.installment_number,
                              issued_by_name: rc.profiles?.full_name || 'Admin Clerk',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side: collect payment action */}
                  {outstanding > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenPayment(inst)}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-800 shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Collect Fee
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-xs py-8 text-center italic">No installments mapped.</p>
        )}
      </div>

      {/* Record Payment Dialog */}
      {showPaymentModal && activeInstallment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5"
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-xl">Record Payment Collection</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Collecting installment #{activeInstallment.installment_number} for {student.profiles.full_name}.
              </p>
            </div>

            <div className="space-y-4">
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Collect Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={Number(activeInstallment.amount_due) - Number(activeInstallment.amount_paid)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none font-bold"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Payment Mode *
                </label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none font-bold text-slate-800"
                >
                  <option value="cash">Cash Payment</option>
                  <option value="upi">UPI / Online QR</option>
                  <option value="cheque">Cheque Deposit</option>
                  <option value="bank_transfer">Net Banking / Direct Transfer</option>
                </select>
              </div>

              {/* Payment Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Transaction Reference / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transaction ID / Bank slip reference"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || payAmount <= 0}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-md"
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjust Discount / Scholarship Dialog */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustments}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-5"
          >
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-xl">Adjust Financial Ledger</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Apply discounts or scholarships. The net payable fee is re-calculated automatically.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Discount Amount */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discountVal}
                    onChange={(e) => setDiscountVal(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>

                {/* Scholarship Amount */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Scholarship (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={scholarshipVal}
                    onChange={(e) => setScholarshipVal(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
              </div>

              {/* Discount Reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Discount Reasoning
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sibling discount / Early bird promotion"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>

              {/* Scholarship Reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Scholarship Reasoning
                </label>
                <input
                  type="text"
                  placeholder="e.g. Academic excellence / Board topper"
                  value={scholarshipReason}
                  onChange={(e) => setScholarshipReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-md"
              >
                {loading ? 'Adjusting...' : 'Save Adjustments'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
