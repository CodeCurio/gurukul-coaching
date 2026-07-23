'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { formatDate } from '../../lib/utils/format-date';
import { formatCurrency } from '../../lib/utils/format-currency';

interface ReceiptData {
  receipt_number: string;
  amount: number;
  payment_method: string;
  issued_at: string;
  student_name: string;
  roll_number: string;
  current_class: string;
  installment_number: number;
  issued_by_name: string;
}

interface DownloadReceiptButtonProps {
  receipt: ReceiptData;
}

export default function DownloadReceiptButton({ receipt }: DownloadReceiptButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const generatePDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Colors
      const primaryColor = [67, 56, 202]; // Indigo 700 (#4338ca)
      const secondaryColor = [190, 18, 60]; // Crimson 700 (#be123c)
      const textColor = [15, 23, 42]; // Slate 900
      const lightTextColor = [100, 116, 139]; // Slate 500

      // Outer Border
      doc.setDrawColor(226, 232, 240); // border gray
      doc.rect(5, 5, 200, 287);

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(10, 10, 190, 30, 'F');

      // Title text inside banner
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('GURUKUL COACHING INSTITUTE', 20, 22);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('In-Person Classroom Coaching | Class 1 to 12', 20, 32);

      // Receipt Metadata Block
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('FEE PAYMENT RECEIPT', 15, 55);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Receipt Number: ${receipt.receipt_number}`, 15, 62);
      doc.text(`Date of Issue: ${formatDate(receipt.issued_at)}`, 15, 68);

      // Horizontal line
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 75, 195, 75);

      // Student and Guardian Details (Left side)
      doc.setFont('Helvetica', 'bold');
      doc.text('STUDENT DETAILS', 15, 85);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Name: ${receipt.student_name}`, 15, 92);
      doc.text(`Roll Number: ${receipt.roll_number}`, 15, 98);
      doc.text(`Class Level: ${receipt.current_class}`, 15, 104);

      // Institute details (Right side)
      doc.setFont('Helvetica', 'bold');
      doc.text('INSTITUTE DETAILS', 120, 85);
      doc.setFont('Helvetica', 'normal');
      doc.text('Gurukul Center Delhi', 120, 92);
      doc.text('Delhi, India', 120, 98);
      doc.text('admissions@gurukulcoaching.com', 120, 104);

      // Horizontal line
      doc.line(15, 112, 195, 112);

      // Invoice Table Headers
      doc.setFillColor(248, 250, 252); // light slate background
      doc.rect(15, 120, 180, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.text('Description', 18, 125);
      doc.text('Payment Mode', 100, 125);
      doc.text('Amount Paid', 160, 125);

      // Table Row Content
      doc.setFont('Helvetica', 'normal');
      doc.text(`Academic Fee Installment #${receipt.installment_number}`, 18, 136);
      doc.text(receipt.payment_method.toUpperCase(), 100, 136);
      doc.text(formatCurrency(receipt.amount), 160, 136);

      // Line under row
      doc.line(15, 142, 195, 142);

      // Totals Box
      doc.setFont('Helvetica', 'bold');
      doc.text('TOTAL PAID:', 120, 155);
      doc.text(formatCurrency(receipt.amount), 160, 155);

      // Payment Terms / Note
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Note: This is a computer-generated receipt issued for physical classroom tuition payments.', 15, 175);
      doc.text('Payments once made are non-refundable and subject to institute policies.', 15, 180);

      // Signature Area
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('Issued & Verified By:', 140, 210);
      doc.setFont('Helvetica', 'normal');
      doc.text(receipt.issued_by_name, 140, 216);
      doc.text('Gurukul Administration', 140, 222);

      // Save document
      doc.save(`receipt-${receipt.receipt_number}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-800 bg-primary-50 border border-primary-100 rounded-xl transition-all"
    >
      {downloading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          Receipt
        </>
      )}
    </button>
  );
}
export type { ReceiptData };
