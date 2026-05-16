import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertCircle, FileText, Package, Truck, 
  User, Calendar, Info, ShieldCheck, ClipboardCheck
} from 'lucide-react';
import ModalForm from '../../components/ModalForm';
import { getStoreInRecords, saveStoreInRecords } from '../../utils/storageManager';
import { toast } from 'sonner';

export default function HODCheckForm({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    hodStatus: 'Approved',
    hodRemark: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const records = getStoreInRecords();
      const index = records.findIndex(r => r.id === item.id);
      
      if (index !== -1) {
        records[index] = {
          ...records[index],
          hodStatus: formData.hodStatus,
          hodRemark: formData.hodRemark,
          hodApprovedAt: new Date().toISOString()
        };
        saveStoreInRecords(records);
        toast.success(`HOD Check ${formData.hodStatus} successfully`);
        onSuccess();
      }
    } catch (error) {
      toast.error("Error saving HOD Check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 text-indigo-600 shadow-sm border border-indigo-100">
                <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">HOD Verification</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Review reception details & authorize</p>
        </div>
      }
      onSubmit={handleSubmit}
      submitText={loading ? "Processing..." : "Submit Decision"}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Package size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Shipment Info</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">PO Number</span>
                        <span className="text-[11px] font-black text-indigo-600">{item.poNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Indent No</span>
                        <span className="text-[11px] font-bold text-gray-800">{item.indentNo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Firm</span>
                        <span className="text-[11px] font-bold text-gray-800 uppercase">{item.firmName || item.projectName}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <User size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Vendor Info</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Vendor</span>
                        <span className="text-[11px] font-black text-gray-800 uppercase truncate max-w-[120px]">{item.vendorName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Bill Status</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${item.billStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.billStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Bill No</span>
                        <span className="text-[11px] font-bold text-gray-800">{item.billNumber || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <ClipboardCheck size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Reception Check</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Rec. Qty</span>
                        <span className="text-[12px] font-black text-green-600">{item.items?.[0]?.recQty} / {item.items?.[0]?.liftQty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Physical</span>
                        <span className="text-[11px] font-black text-indigo-600 uppercase">{item.physicalCheck}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Price Match</span>
                        <span className="text-[11px] font-black text-blue-600 uppercase">{item.priceMatch}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Product Detail List */}
        <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Details</span>
                <span className="text-[10px] font-bold text-gray-400">Total 1 Item</span>
            </div>
            <div className="p-4">
                {item.items?.map((prod, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-bold">
                                {idx + 1}
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{prod.productName}</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">Lift No: {prod.liftNo || 'LN-15'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <span className="text-[8px] text-gray-400 uppercase font-black block">Lift Qty</span>
                                <span className="text-[11px] font-bold text-gray-700">{prod.liftQty}</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[8px] text-gray-400 uppercase font-black block">Rec Qty</span>
                                <span className="text-[11px] font-black text-green-600">{prod.recQty}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Decision Section */}
        <div className="bg-white rounded-2xl border-2 border-indigo-50 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Info size={18} className="text-indigo-500" />
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Approval Decision</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hodStatus: 'Approved' })}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.hodStatus === 'Approved' 
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-[1.02]' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-green-200'
                    }`}
                >
                    <CheckCircle2 size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">Approve Shipment</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hodStatus: 'Rejected' })}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.hodStatus === 'Rejected' 
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md scale-[1.02]' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-red-200'
                    }`}
                >
                    <AlertCircle size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">Reject Shipment</span>
                </button>
            </div>

            <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Remarks / Comments</label>
                <textarea
                    required
                    rows={2}
                    placeholder="Enter your approval or rejection remarks here..."
                    value={formData.hodRemark}
                    onChange={(e) => setFormData({ ...formData, hodRemark: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                />
            </div>
        </div>
      </div>
    </ModalForm>
  );
}
