import React, { useState } from 'react';
import { 
  X, Camera, Plus, Package, Truck, Receipt, User, Briefcase, FileText
} from 'lucide-react';
import ModalForm from '../../components/ModalForm';
import { getVendors, getMasterItems } from '../../utils/storageManager';

export default function DirectStoreIn({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    projectName: 'GOAT MARKET',
    receiverName: '',
    vendorName: '',
    productName: '',
    billStatus: 'Received',
    billNo: '',
    challanNo: '',
    billAmount: '',
    receivingQty: '',
    transportingType: 'Yes',
    freightAmount: '',
    transporterName: '',
    vehicleNo: '',
    billImage: null,
    challanImage: null,
    productImage: null
  });

  const vendors = getVendors();
  const products = getMasterItems();

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSave({
      ...formData,
      timestamp: new Date().toISOString(),
      id: `DIR-${Date.now()}`
    });
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text", required }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label} {required && '*'}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-medium text-gray-700 focus:border-indigo-500 outline-none"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options, required }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label} {required && '*'}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="py-2">
            <h2 className="text-lg font-black text-gray-800 tracking-tight">Direct Material Entry</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enter material details manually without an existing PO/Indent</p>
        </div>
      }
      onSubmit={handleSubmit}
      submitText="Submit Direct Entry"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField 
                label="Project Name" 
                value={formData.projectName} 
                onChange={(v) => setFormData({...formData, projectName: v})}
                options={[{value: 'GOAT MARKET', label: 'GOAT MARKET'}, {value: 'OFFICE', label: 'OFFICE'}]}
            />
            <InputField 
                label="Receiver Name" 
                value={formData.receiverName} 
                onChange={(v) => setFormData({...formData, receiverName: v})}
                placeholder="Name of person receiving"
            />
            <SelectField 
                label="Vendor Name" 
                value={formData.vendorName} 
                onChange={(v) => setFormData({...formData, vendorName: v})}
                options={vendors.map(v => ({value: v.name, label: v.name}))}
            />
            <SelectField 
                label="Product Name" 
                value={formData.productName} 
                onChange={(v) => setFormData({...formData, productName: v})}
                options={products.map(p => ({value: p.name, label: p.name}))}
            />

            <SelectField 
                label="Bill Status" 
                value={formData.billStatus} 
                onChange={(v) => setFormData({...formData, billStatus: v})}
                options={[{value: 'Received', label: 'Received'}, {value: 'Not Received', label: 'Not Received'}]}
            />

            {formData.billStatus === 'Received' ? (
                <InputField 
                    label="Bill No" 
                    value={formData.billNo} 
                    onChange={(v) => setFormData({...formData, billNo: v})}
                    placeholder="Enter bill number"
                />
            ) : (
                <InputField 
                    label="Challan Number" 
                    value={formData.challanNo} 
                    onChange={(v) => setFormData({...formData, challanNo: v})}
                    placeholder="Enter challan number"
                />
            )}

            <InputField 
                label="Bill Amount" 
                value={formData.billAmount} 
                onChange={(v) => setFormData({...formData, billAmount: v})}
                placeholder="Enter amount"
            />
            <InputField 
                label="Receiving Qty" 
                value={formData.receivingQty} 
                onChange={(v) => setFormData({...formData, receivingQty: v})}
                placeholder="Enter quantity"
            />

            <SelectField 
                label="Transporting Type" 
                value={formData.transportingType} 
                onChange={(v) => setFormData({...formData, transportingType: v})}
                options={[{value: 'Yes', label: 'Yes'}, {value: 'No', label: 'No'}]}
            />
        </div>

        {formData.transportingType === 'Yes' && (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-4 grid grid-cols-3 gap-3">
                <InputField label="Freight Amount" value={formData.freightAmount} onChange={(v) => setFormData({...formData, freightAmount: v})} placeholder="Amt" />
                <InputField label="Transporter Name" value={formData.transporterName} onChange={(v) => setFormData({...formData, transporterName: v})} placeholder="Name" />
                <InputField label="Vehicle No" value={formData.vehicleNo} onChange={(v) => setFormData({...formData, vehicleNo: v})} placeholder="No" />
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formData.billStatus === 'Received' ? 'Bill Image' : 'Challan Image'}</label>
                <div className="border-2 border-dashed border-gray-100 rounded-xl p-2 flex items-center justify-between hover:border-indigo-200 cursor-pointer">
                    <span className="text-[10px] text-gray-400 font-bold truncate px-2">No file chosen</span>
                    <button type="button" className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Choose File</button>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Image</label>
                <div className="border-2 border-dashed border-gray-100 rounded-xl p-2 flex items-center justify-between hover:border-indigo-200 cursor-pointer">
                    <span className="text-[10px] text-gray-400 font-bold truncate px-2">No file chosen</span>
                    <button type="button" className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Choose File</button>
                </div>
            </div>
        </div>
      </div>
    </ModalForm>
  );
}
