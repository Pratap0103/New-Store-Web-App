import React, { useState } from 'react';
import ModalForm from '../../components/ModalForm';
import { Camera, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Billnotreceviedform({ record, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    billNo: '',
    statusOfBill: 'Ok',
    billImage: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  if (!record) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, billImage: reader.result });
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockUpload = () => {
    // Premium placeholder invoice mock
    const mockUrls = [
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600',
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600'
    ];
    const chosen = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setFormData({ ...formData, billImage: chosen });
    setPreviewImage(chosen);
    toast.success('Mock invoice uploaded successfully!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.billNo.trim()) {
      toast.error('Please enter the received Bill Number.');
      return;
    }

    if (!formData.billImage) {
      toast.error('Please upload or generate a Bill Image/Document.');
      return;
    }

    onSave({
      billNo: formData.billNo,
      statusOfBill: formData.statusOfBill,
      billImage: formData.billImage,
      billStatus: 'Received',
      receivedDate: new Date().toISOString()
    });
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Bill Document"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* Pre-filled read-only parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
          {[
            ['Lift Number', record.id],
            ['Indent No.', record.indentNumber],
            ['PO Number', record.poNumber],
            ['Vendor Name', record.vendorName],
            ['Project Name', record.projectName],
            ['Product Name', record.productName],
            ['Quantity', record.qty],
            ['Bill Amount', `₹${Number(record.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
            ['Type Of Bill', record.typeOfBill],
            ['Payment Type', record.paymentType],
            ['Transporter', record.transporterName || 'N/A'],
            ['Challan Number', record.challanNo || 'N/A']
          ].map(([lbl, val]) => (
            <div key={lbl} className="space-y-0.5">
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">{lbl}</span>
              <span className="font-bold text-gray-700 block break-words">{val || '-'}</span>
            </div>
          ))}
        </div>

        {/* Input: Bill Number */}
        <div className="space-y-1">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wide block">Bill Number *</label>
          <input
            type="text"
            placeholder="Enter physical bill number..."
            value={formData.billNo}
            onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Input: Status (Ok or Not Ok) */}
        <div className="space-y-1">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wide block">Status of Bill *</label>
          <select
            value={formData.statusOfBill}
            onChange={(e) => setFormData({ ...formData, statusOfBill: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="Ok">Ok (Cleared / Quantity & Rate matched)</option>
            <option value="Not Ok">Not Ok (Discrepancy in Qty, Rate, or Quality)</option>
          </select>
        </div>

        {/* File upload: Bill Image */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wide block">Upload Bill Copy (Image/Document) *</label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 relative border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-1 text-center pointer-events-none">
                <Camera className="text-gray-400 h-6 w-6" />
                <span className="text-[10px] font-bold text-gray-500">Click to capture / browse file</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMockUpload}
              className="flex items-center justify-center gap-1.5 px-3 py-2 border border-indigo-200 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-xs font-bold whitespace-nowrap"
            >
              <FileText size={14} />
              <span>Generate Mock Copy</span>
            </button>
          </div>
        </div>

        {/* Selected Image preview */}
        {previewImage && (
          <div className="mt-2 p-2 bg-slate-50 border border-gray-200 rounded-xl relative group overflow-hidden">
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block mb-1">Document Preview</span>
            <img
              src={previewImage}
              alt="Uploaded Invoice preview"
              className="w-full max-h-[140px] object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </ModalForm>
  );
}
