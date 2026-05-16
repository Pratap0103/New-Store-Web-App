import React, { useState, useEffect } from 'react';
import { 
  Trash2, Package, Truck, Receipt, FileText, Camera, IndianRupee, X, Check
} from 'lucide-react';
import { toast } from 'sonner';
import ModalForm from '../../components/ModalForm';

export default function LiftingForm({ isOpen, onClose, initialData, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    billStatus: 'Not Received',
    transportation: 'No',
    billNumber: '',
    billAmount: '',
    billRemarks: '',
    billAttachment: null,
    challanNumber: '',
    challanImage: null,
    transporterName: '',
    vehicleNo: '',
    driverName: '',
    driverMobile: '',
    frightAmount: '',
    items: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        items: initialData.items.map(item => ({
          ...item,
          liftQty: item.pendingQty,
          cancelQty: 0,
          effRate: item.rate * (1 + (item.gst || 0) / 100),
          amount: item.pendingQty * (item.rate * (1 + (item.gst || 0) / 100))
        }))
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const numericValue = parseFloat(value) || 0;
    newItems[index][field] = numericValue;
    
    const item = newItems[index];
    const effRate = item.rate * (1 + (item.gst || 0) / 100);
    item.amount = item.liftQty * effRate;
    
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
      toast.error("At least one item is required");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (formData.items.length === 0) {
        toast.error("At least one item is required");
        return;
    }
    
    setLoading(true);
    onSave({
        ...formData,
        totalAmount: calculateTotal(),
        poNumber: initialData.poNumber,
        indentNo: initialData.indentNo,
        vendorName: initialData.vendorName,
        timestamp: new Date().toISOString()
    });
    setLoading(false);
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text", inputMode, required }) => (
    <div className="space-y-0.5">
      <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">{label} {required && '*'}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-700 shadow-sm"
      />
    </div>
  );

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="Material Lifting Entry"
      onSubmit={handleSubmit}
      submitText={loading ? 'Processing...' : 'Approve & Save'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Prefill Section - EXACT ManagementForm Style */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-x-3">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Indent No</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-medium text-indigo-600">
                {initialData?.indentNo}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">PO Number</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 font-bold">
                {initialData?.poNumber}
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Vendor Name</label>
            <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 truncate">
              {initialData?.vendorName}
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Project Name</label>
            <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] min-h-[32px] md:min-h-[38px] flex items-center font-semibold text-indigo-600 uppercase break-words py-2">
              {initialData?.projectName || 'General Project'}
            </div>
          </div>
        </div>

        {/* Product Details - ManagementForm Card Style */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest px-1">Product Details</label>
          <div className="space-y-2">
            {formData.items.map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-indigo-50 rounded-xl p-3 shadow-sm hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-2 py-0.5 rounded">ITEM #{idx+1}</span>
                    <h4 className="text-[12px] font-bold text-gray-800 uppercase break-words">{item.productName}</h4>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-50 pt-3">
                   <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Eff. Rate</span>
                      <p className="text-[11px] font-black text-indigo-600">₹{item.effRate?.toFixed(2)}</p>
                   </div>
                   <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Pending Qty</span>
                      <p className="text-[11px] font-black text-amber-600">{item.pendingQty} {item.unit}</p>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] text-indigo-400 uppercase font-bold block">Lift Qty</label>
                      <input 
                        type="text" 
                        inputMode="decimal"
                        value={item.liftQty}
                        onChange={(e) => handleItemChange(idx, 'liftQty', e.target.value)}
                        className="w-full h-8 bg-gray-50 border border-indigo-100 rounded-lg text-center text-xs font-black text-indigo-600 focus:border-indigo-500 outline-none"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] text-red-400 uppercase font-bold block">Cancel Qty</label>
                      <input 
                        type="text" 
                        inputMode="decimal"
                        value={item.cancelQty}
                        onChange={(e) => handleItemChange(idx, 'cancelQty', e.target.value)}
                        className="w-full h-8 bg-red-50/50 border border-red-100 rounded-lg text-center text-xs font-black text-red-500 focus:border-red-500 outline-none"
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl text-white shadow-lg mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Grand Total Amount</span>
            <span className="text-base font-black tracking-tight">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Billing & Transportation Sections - Consistent Management Style */}
        <div className="grid grid-cols-1 gap-4">
           {/* Billing */}
           <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Bill Status</label>
                <div className="flex gap-2">
                    {['Received', 'Not Received'].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({...formData, billStatus: s})}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                formData.billStatus === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-x-3 gap-y-3">
                  {formData.billStatus === 'Received' ? (
                      <>
                        <InputField label="Bill Number" required value={formData.billNumber} onChange={(v) => setFormData({...formData, billNumber: v})} placeholder="No." />
                        <InputField label="Bill Amount" inputMode="decimal" value={formData.billAmount} onChange={(v) => setFormData({...formData, billAmount: v})} placeholder="₹" />
                        <div className="col-span-2">
                          <InputField label="Bill Remarks" value={formData.billRemarks} onChange={(v) => setFormData({...formData, billRemarks: v})} placeholder="Notes..." />
                        </div>
                      </>
                  ) : (
                      <>
                        <InputField label="Challan Number" value={formData.challanNumber} onChange={(v) => setFormData({...formData, challanNumber: v})} placeholder="No." />
                        <InputField label="Bill Amount" inputMode="decimal" value={formData.billAmount} onChange={(v) => setFormData({...formData, billAmount: v})} placeholder="₹" />
                        <div className="col-span-2">
                          <InputField label="Bill Remarks" value={formData.billRemarks} onChange={(v) => setFormData({...formData, billRemarks: v})} placeholder="Notes..." />
                        </div>
                      </>
                  )}
              </div>
           </div>

           {/* Transportation */}
           <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Transportation</label>
                <div className="flex gap-2">
                    {['Yes', 'No'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setFormData({...formData, transportation: opt})}
                            className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                formData.transportation === opt ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
              </div>
              {formData.transportation === 'Yes' && (
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-x-3 gap-y-3">
                    <InputField label="Transporter Name" value={formData.transporterName} onChange={(v) => setFormData({...formData, transporterName: v})} placeholder="Name" />
                    <InputField label="Vehical No" value={formData.vehicleNo} onChange={(v) => setFormData({...formData, vehicleNo: v})} placeholder="No." />
                    <InputField label="Driver Name" value={formData.driverName} onChange={(v) => setFormData({...formData, driverName: v})} placeholder="Name" />
                    <InputField label="Driver Mobile" value={formData.driverMobile} onChange={(v) => setFormData({...formData, driverMobile: v})} placeholder="Phone" />
                    <div className="col-span-2">
                      <InputField label="Freight Amount" inputMode="decimal" value={formData.frightAmount} onChange={(v) => setFormData({...formData, frightAmount: v})} placeholder="₹" />
                    </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </ModalForm>
  );
}
