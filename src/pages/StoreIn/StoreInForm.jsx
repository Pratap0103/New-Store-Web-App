import React, { useState, useEffect } from 'react';
import { 
  X, Truck, Receipt, IndianRupee, FileText, Camera, CheckCircle2, AlertCircle, Box, User
} from 'lucide-react';
import { toast } from 'sonner';
import ModalForm from '../../components/ModalForm';

export default function StoreInForm({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState({
    billStatus: 'Received',
    location: '',
    physicalCheck: 'Pass',
    qtyMatch: 'Yes',
    priceMatch: 'Yes',
    remark: '',
    items: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        items: initialData.items.map(item => ({
          ...item,
          recQty: item.liftQty, // Default received qty to lift qty
          liftNo: initialData.id?.slice(-6) || 'LN-15'
        }))
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSave({
      ...formData,
      timestamp: new Date().toISOString(),
      vendorName: initialData.vendorName,
      billNumber: initialData.billNumber,
      billAmount: initialData.billAmount,
      poNumber: initialData.poNumber,
      indentNo: initialData.indentNo,
      projectName: initialData.projectName,
      transporterName: initialData.transporterName,
      vehicleNo: initialData.vehicleNo
    });
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-1 text-indigo-600">
                <Truck size={24} />
            </div>
            <h2 className="text-lg font-black text-gray-800 tracking-tight">Store In Processing</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Process reception and verify quality</p>
        </div>
      }
      onSubmit={handleSubmit}
      submitText="Store In"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Standardized Prefill Section - Matching TechnicalForm.jsx */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-x-3">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-tight">Vendor Name</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-bold text-gray-800 truncate uppercase">
                {initialData?.vendorName}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-tight">Bill Number</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-bold text-gray-800 uppercase">
                {initialData?.billNumber || initialData?.challanNumber}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-3">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-tight">PO Number</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-black text-indigo-600">
                {initialData?.poNumber}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-tight">Indent No</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 font-bold uppercase">
                {initialData?.indentNo}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-tight">Bill Amount</label>
              <div className="w-full bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-black text-indigo-700">
                ₹{parseFloat(initialData?.billAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table - MATCHING IMAGE 1 */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Products in this shipment ({formData.items.length})</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">S.No.</th>
                        <th className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Lift No.</th>
                        <th className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Indent No.</th>
                        <th className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Lift Qty</th>
                        <th className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Received Qty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {formData.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="px-4 py-3 text-[11px] font-bold text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-[11px] font-black text-indigo-600">{item.liftNo}</td>
                            <td className="px-4 py-3 text-[11px] font-black text-gray-800 uppercase">{item.productName}</td>
                            <td className="px-4 py-3 text-[11px] font-bold text-gray-600 uppercase">{initialData?.indentNo}</td>
                            <td className="px-4 py-3 text-center text-[11px] font-black text-gray-800">{item.liftQty}</td>
                            <td className="px-4 py-2 text-center">
                                <input 
                                    type="text" 
                                    inputMode="decimal"
                                    value={item.recQty}
                                    onChange={(e) => handleItemChange(idx, 'recQty', e.target.value)}
                                    className="w-20 h-9 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs font-black text-indigo-600 focus:border-indigo-500 outline-none"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Inputs Grid - MATCHING IMAGE 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bill Status</label>
                <select 
                    value={formData.billStatus}
                    onChange={(e) => setFormData({...formData, billStatus: e.target.value})}
                    className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 focus:border-indigo-500 outline-none"
                >
                    <option value="Received">Received</option>
                    <option value="Not Received">Not Received</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location (optional)</label>
                <input 
                    type="text"
                    placeholder="Enter storage location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-medium text-gray-700 focus:border-indigo-500 outline-none"
                />
            </div>

            <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Photo of Product <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-100 rounded-xl p-3 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                            <Camera size={18} />
                        </div>
                        <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600">No file chosen</span>
                    </div>
                    <button type="button" className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Choose File</button>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Physical Check</label>
                <select 
                    value={formData.physicalCheck}
                    onChange={(e) => setFormData({...formData, physicalCheck: e.target.value})}
                    className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 focus:border-indigo-500 outline-none"
                >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantity As Per Bill</label>
                <select 
                    value={formData.qtyMatch}
                    onChange={(e) => setFormData({...formData, qtyMatch: e.target.value})}
                    className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 focus:border-indigo-500 outline-none"
                >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Price as per PO?</label>
                <select 
                    value={formData.priceMatch}
                    onChange={(e) => setFormData({...formData, priceMatch: e.target.value})}
                    className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 focus:border-indigo-500 outline-none"
                >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Remark</label>
                <textarea 
                    rows={1}
                    placeholder="Enter remark"
                    value={formData.remark}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    className="w-full min-h-[44px] bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 focus:border-indigo-500 outline-none resize-none"
                />
            </div>
        </div>
      </div>
    </ModalForm>
  );
}
