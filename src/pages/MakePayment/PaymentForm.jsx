import React, { useState } from 'react';
import ModalForm from '../../components/ModalForm';
import { savePayment } from '../../utils/storageManager';
import { IndianRupee, UploadCloud, MessageSquare, Tag, FileText, CheckCircle2 } from 'lucide-react';

export default function PaymentForm({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    paidAmount: '',
    paymentStatus: 'Paid', // or 'Partial'
    attachment: '',
    remarks: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const paymentNo = `PAY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newPayment = {
      referenceId: item.id,
      referenceType: item.recordType,
      timestamp: new Date().toISOString(),
      paymentNo: paymentNo,
      paymentCount: (item.paymentCount || 0) + 1,
      paidAmount: formData.paidAmount,
      pendingAmount: Math.max(0, item.pendingPrice - formData.paidAmount),
      paymentStatus: formData.paymentStatus,
      attachment: formData.attachment,
      remarks: formData.remarks
    };

    savePayment(newPayment);
    if (onSuccess) onSuccess();
  };

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Make Payment"
      icon={IndianRupee}
    >
      <div className="space-y-4">
        {/* Pre-fill Read-Only Information */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Party Name</span>
              <p className="text-xs font-semibold text-gray-800 break-words">{item.partyName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PO / Indent</span>
              <p className="text-xs font-semibold text-gray-800 break-words">{item.poNumber || item.indentNo || 'DIRECT'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Amount</span>
              <p className="text-xs font-bold text-gray-900 break-words">₹{Number(item.totalAmount).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pending Price</span>
              <p className="text-xs font-bold text-red-600 break-words">₹{Number(item.pendingPrice).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              <IndianRupee size={14} className="text-indigo-500" /> Pay Amount
            </label>
            <input
              type="number"
              required
              max={item.pendingPrice}
              min="1"
              value={formData.paidAmount}
              onChange={(e) => {
                const amount = parseFloat(e.target.value);
                let status = 'Paid';
                if (amount < item.pendingPrice) {
                  status = 'Partial';
                }
                setFormData({ ...formData, paidAmount: e.target.value, paymentStatus: status });
              }}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 transition-all font-semibold"
              placeholder="Enter amount"
            />
            {formData.paidAmount && (
              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                Remaining Balance will be: <span className="font-bold text-red-500">₹{Math.max(0, item.pendingPrice - (parseFloat(formData.paidAmount) || 0)).toFixed(2)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              <CheckCircle2 size={14} className="text-indigo-500" /> Payment Status
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 transition-all font-semibold appearance-none"
            >
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partial Payment</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              <UploadCloud size={14} className="text-indigo-500" /> Attachment
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500 font-semibold">Click to upload receipt</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0]?.name || 'receipt.pdf' })} />
              </label>
            </div>
            {formData.attachment && <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1"><FileText size={12}/> {formData.attachment}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              <MessageSquare size={14} className="text-indigo-500" /> Remarks
            </label>
            <textarea
              rows="3"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 transition-all resize-none"
              placeholder="Add any payment remarks..."
            ></textarea>
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
