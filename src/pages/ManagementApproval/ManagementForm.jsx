import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import ModalForm from '../../components/ModalForm';
import { getIndents, saveIndents } from '../../utils/storageManager';

export default function ManagementForm({ item, onClose, onSuccess }) {
  const ta = item.technicalApproval || {};
  const rankedVendors = [
    { rank: 'T1', vendor: ta.t1 },
    { rank: 'T2', vendor: ta.t2 },
    { rank: 'T3', vendor: ta.t3 },
  ].filter(v => v.vendor);

  const [selectedVendor, setSelectedVendor] = useState(ta.t1?.name || '');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVendor) { toast.error('Please select an approved vendor'); return; }
    
    try {
      setLoading(true);
      const allIndents = getIndents();
      const updated = allIndents.map(indent => {
        if (indent.id !== item.indentId) return indent;
        return {
          ...indent,
          items: indent.items.map(it => {
            if (it.itemCount !== item.itemCount) return it;
            const finalVendor = rankedVendors.find(rv => rv.vendor.name === selectedVendor)?.vendor;
            return {
              ...it,
              managementApproval: {
                approvedVendor: finalVendor,
                remarks: remarks,
                approvedAt: new Date().toISOString()
              }
            };
          })
        };
      });
      saveIndents(updated);
      toast.success('Management approval saved!');
      setTimeout(() => { onSuccess(); setLoading(false); }, 400);
    } catch { 
      toast.error('Error saving approval'); 
      setLoading(false); 
    }
  };

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      title="Management Approval"
      onSubmit={handleSubmit}
      submitText={loading ? 'Processing...' : 'Approve & Save'}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Prefill Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-x-3">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Serial No</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-medium text-indigo-600">
                {item.serialNo}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Item Count</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 font-bold">
                # {item.itemCount}
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Firm Name</label>
            <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
              {item.firmName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Department</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 break-words">
                {item.department}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Group-Head</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 break-words">
                {item.groupHead}
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Item Name</label>
            <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] min-h-[32px] md:min-h-[38px] flex items-center font-semibold text-indigo-600 uppercase break-words py-2">
              {item.itemName}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">UOM</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                {item.uom}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Qty</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-bold text-indigo-600">
                {item.itemQty}
              </div>
            </div>
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Vendor Type</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-black uppercase text-blue-600 whitespace-nowrap">
                {item.vendorRateInfo?.vendorType || 'Regular'}
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Selection */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest px-1">Select Approved Vendor</label>
          <div className="space-y-2">
            {rankedVendors.map(({ rank, vendor }) => (
              <label 
                key={rank}
                className={`flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedVendor === vendor.name 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100' 
                    : 'border-gray-100 bg-white hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="vendor" 
                      className="hidden"
                      checked={selectedVendor === vendor.name}
                      onChange={() => setSelectedVendor(vendor.name)}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedVendor === vendor.name ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {selectedVendor === vendor.name && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-2 py-0.5 rounded">{rank} Rank</span>
                  </div>
                  <span className="text-[12px] font-black text-gray-900">₹{vendor.basicRate}</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[12px] font-bold text-gray-800 uppercase break-words">{vendor.name}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    <div><span className="text-[9px] text-gray-400 uppercase font-bold">QTN Date</span><span className="text-[10px] text-gray-600 ml-1">{vendor.quotationDate}</span></div>
                    <div><span className="text-[9px] text-gray-400 uppercase font-bold">Delivery</span><span className="text-[10px] text-gray-600 ml-1">{vendor.deliveryTime} Days</span></div>
                    <div className="col-span-2"><span className="text-[9px] text-gray-400 uppercase font-bold">Make</span><span className="text-[10px] text-gray-600 ml-1 uppercase">{vendor.make}</span></div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest px-1">Approval Remarks</label>
          <textarea
            rows="2"
            placeholder="Enter approval comments..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all resize-none"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      </div>
    </ModalForm>
  );
}
