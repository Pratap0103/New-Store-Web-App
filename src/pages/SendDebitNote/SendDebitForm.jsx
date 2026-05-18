import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Paperclip, X } from 'lucide-react';
import ModalForm from '../../components/ModalForm';
import { saveDebitNote } from '../../utils/storageManager';

export default function SendDebitForm({ item, onClose, onSuccess }) {
  const [debitNoteNo, setDebitNoteNo] = useState('');
  const [debitNoteCopy, setDebitNoteCopy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDebitNoteCopy(file.name);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!debitNoteNo.trim()) {
      toast.error('Please enter Debit Note Number');
      return;
    }
    if (!debitNoteCopy) {
      toast.error('Please upload Debit Note Copy');
      return;
    }

    setLoading(true);
    try {
      const newDebitNote = {
        liftNumber: item.id || `LIFT-DUMMY`,
        indentNo: item.indentNo || '',
        projectName: item.projectName || item.firmName || 'Botivate',
        firmName: item.firmName || 'Botivate Services',
        billNo: item.billNumber || '',
        vendorName: item.vendorName || '',
        productName: item.productName || item.items?.[0]?.productName || '',
        qty: item.qty || item.items?.[0]?.liftQty || 0,
        typeOfBill: item.typeOfBill || 'Tax Invoice',
        billAmount: item.billAmount || 0,
        paymentType: item.paymentType || '30 Days Credit',
        advanceAmount: item.advanceAmount || '₹0.00',
        photoOfBill: item.photoOfBill || '',
        transportation: item.transportation || 'Yes',
        transporterName: item.transporterName || 'Self',
        amount: item.totalAmount || item.billAmount || 0,
        reason: item.reason || item.billRemarks || 'Material rejected due to physical check failure',
        plannedDate: item.plannedDate || '22/05/2026',
        debitNoteNo: debitNoteNo,
        debitNoteCopy: debitNoteCopy,
        status: 'Sent',
        statusPurchaser: 'Approved',
        billCopy: 'bill_copy.pdf',
        returnCopy: 'return_challan.pdf'
      };

      saveDebitNote(newDebitNote);
      toast.success('Debit note sent and recorded successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setLoading(false);
      }, 400);
    } catch (error) {
      toast.error('Failed to save Debit Note');
      setLoading(false);
    }
  };

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Send Debit Note"
      submitText={loading ? 'Saving...' : 'Save'}
      cancelText="Cancel"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Prefilled upper fields block */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-3 text-left">
          <div className="space-y-0.5">
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">Indent Number</label>
            <div className="w-full bg-white border border-gray-200 rounded-md px-3 py-1 text-xs md:text-sm font-semibold text-gray-700 h-[34px] flex items-center">
              {item.indentNo || '-'}
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">Lift Number</label>
            <div className="w-full bg-white border border-gray-200 rounded-md px-3 py-1 text-xs md:text-sm font-semibold text-indigo-600 h-[34px] flex items-center">
              {item.id || '-'}
            </div>
          </div>

          <div className="col-span-2 space-y-0.5">
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">Product Name</label>
            <div className="w-full bg-white border border-gray-200 rounded-md px-3 py-1 text-xs md:text-sm font-semibold text-gray-700 min-h-[34px] flex items-center truncate">
              {item.items?.[0]?.productName || item.productName || '-'}
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">Vendor Name</label>
            <div className="w-full bg-white border border-gray-200 rounded-md px-3 py-1 text-xs md:text-sm font-semibold text-gray-700 h-[34px] flex items-center truncate">
              {item.vendorName || '-'}
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">Quantity</label>
            <div className="w-full bg-white border border-gray-200 rounded-md px-3 py-1 text-xs md:text-sm font-bold text-indigo-600 h-[34px] flex items-center">
              {item.items?.[0]?.liftQty || item.qty || 0}
            </div>
          </div>

          <div className="col-span-2 space-y-0.5">
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">Bill Amount</label>
            <div className="w-full bg-white border border-gray-200 rounded-md px-3 py-1 text-xs md:text-sm font-black text-emerald-600 h-[34px] flex items-center">
              ₹{parseFloat(item.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-3 pt-2 text-left">
          <div className="space-y-1">
            <label className="block text-[11px] md:text-[12px] font-bold text-gray-700 uppercase tracking-tight">Debit Note Number *</label>
            <input
              type="text"
              value={debitNoteNo}
              onChange={(e) => setDebitNoteNo(e.target.value)}
              placeholder="e.g. DN-2026-001"
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs md:text-sm h-[34px] bg-white font-medium text-gray-800"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] md:text-[12px] font-bold text-gray-700 uppercase tracking-tight">Debit Note Copy Upload *</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer">
                <div className={`flex items-center justify-center gap-2 border border-dashed rounded-lg h-[38px] transition-all
                  ${debitNoteCopy ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-300 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'}
                `}>
                  {debitNoteCopy ? <Check size={16} /> : <Paperclip size={16} />}
                  <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[180px]">
                    {debitNoteCopy ? debitNoteCopy : 'Upload Copy'}
                  </span>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
              </label>
              {debitNoteCopy && (
                <button
                  type="button"
                  onClick={() => setDebitNoteCopy('')}
                  className="w-[38px] h-[38px] flex items-center justify-center text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg border border-gray-200 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
