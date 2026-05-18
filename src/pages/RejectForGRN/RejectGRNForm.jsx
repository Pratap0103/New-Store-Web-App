import React, { useState } from 'react';
import ModalForm from '../../components/ModalForm';
import { saveRejectGRNRecord } from '../../utils/storageManager';
import { X, Check, Paperclip, AlertTriangle } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';
import { toast } from 'sonner';

export default function RejectGRNForm({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    grnStatus: 'Select',
    attachment: '',
    reason: '',
    debitNoteSent: 'Select'
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, attachment: file.name });
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (formData.grnStatus === 'Select' || !formData.grnStatus) {
      toast.error('Please select GRN Status');
      return;
    }
    if (formData.debitNoteSent === 'Select' || !formData.debitNoteSent) {
      toast.error('Please specify if Debit Note was sent');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setLoading(true);
    try {
      const newRecord = {
        referenceId: item.id,
        timestamp: new Date().toISOString(),
        grnStatus: formData.grnStatus,
        attachment: formData.grnStatus === 'Accept' ? formData.attachment : '',
        reason: formData.reason,
        debitNoteSent: formData.debitNoteSent
      };

      saveRejectGRNRecord(newRecord);
      toast.success(`GRN ${formData.grnStatus} recorded successfully`);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to save GRN record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="GRN Action for Rejected Store In"
      submitText={loading ? 'Processing...' : 'Submit Action'}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-3 md:space-y-5">
        
        {/* Read-Only Pre-fills (Matches Create Indent Top Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 pb-3 md:pb-4 border-b border-gray-100">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Vendor Name</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-[11px] md:text-[13px] h-[30px] md:h-[34px] flex items-center font-semibold text-gray-800 truncate">
              {item.vendorName || '-'}
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Bill No</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-[11px] md:text-[13px] h-[30px] md:h-[34px] flex items-center font-semibold text-gray-800">
              {item.billNumber || '-'}
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] md:text-[13px] text-red-600 uppercase tracking-tight">HOD Remark</label>
            <div className="w-full border border-red-200 bg-red-50 rounded px-3 py-1.5 text-[11px] md:text-[13px] h-[30px] md:h-[34px] flex items-center font-bold text-red-700 truncate" title={item.hodRemark}>
              {item.hodRemark || '-'}
            </div>
          </div>
        </div>

        <div className="pt-1 hidden md:block">
          <h3 className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" /> Action Configuration
          </h3>
        </div>

        {/* Action Details Container (Matches Create Indent Sub-Section) */}
        <div className="relative p-2.5 md:p-5 bg-gray-50/50 rounded-xl border border-gray-200 space-y-2.5 md:space-y-4 transition-all hover:bg-white hover:shadow-md">
          <div className="flex justify-between items-center border-b border-gray-200/50 pb-2 mb-1">
             <span className="text-[9px] md:text-xs text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">Final Decision</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-2 md:gap-x-4 md:gap-y-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">GRN Status *</label>
              <SearchableDropdown
                options={[
                  { value: 'Accept', label: 'Accept' },
                  { value: 'Reject', label: 'Reject' }
                ]}
                value={formData.grnStatus === 'Select' ? '' : formData.grnStatus}
                onChange={(val) => setFormData({ ...formData, grnStatus: val })}
                placeholder="Select Status"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Debit Note Sent *</label>
              <SearchableDropdown
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' }
                ]}
                value={formData.debitNoteSent === 'Select' ? '' : formData.debitNoteSent}
                onChange={(val) => setFormData({ ...formData, debitNoteSent: val })}
                placeholder="Select Option"
              />
            </div>

            {formData.grnStatus === 'Accept' && (
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Bill Copy Attached</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer group">
                    <div className={`flex items-center justify-center gap-2 border border-dashed rounded h-[30px] md:h-[34px] transition-all
                      ${formData.attachment ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-300 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'}
                    `}>
                      {formData.attachment ? <Check size={14} /> : <Paperclip size={14} />}
                      <span className="text-[11px] md:text-[13px] uppercase tracking-wider truncate max-w-[100px]">
                        {formData.attachment ? formData.attachment : 'Browse'}
                      </span>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                  </label>
                  {formData.attachment && (
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, attachment: '' })}
                      className="w-[30px] h-[30px] md:w-[34px] md:h-[34px] flex items-center justify-center text-gray-300 hover:text-red-500 bg-gray-50 rounded border border-gray-200 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1 col-span-2 lg:col-span-3">
              <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Reason *</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Provide details..."
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]"
                required
              />
            </div>
          </div>
        </div>

      </div>
    </ModalForm>
  );
}
