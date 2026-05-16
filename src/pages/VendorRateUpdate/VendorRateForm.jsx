import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Upload, X, Eye, Plus, ChevronLeft, ChevronRight, Check, Calendar, 
  Building2, FileText, Save, File 
} from 'lucide-react';
import { getVendors, getIndents, saveIndents } from '../../utils/storageManager';
import { fileToBase64, formatCurrency, formatDate } from '../../utils/helpers';
import SearchableDropdown from '../../components/SearchableDropdown';
import ModalForm from '../../components/ModalForm';

export default function VendorRateForm({ item, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [vendorType, setVendorType] = useState('Regular'); // 'Regular' or 'Three Party'
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const fileInputRefs = useRef([]);
  
  const [formData, setFormData] = useState({
    vendors: [
      { name: '', quotationNo: '', quotationDate: '', basicRate: '', paymentTerms: '', deliveryTime: '', make: '', remarks: '', image: '' },
      { name: '', quotationNo: '', quotationDate: '', basicRate: '', paymentTerms: '', deliveryTime: '', make: '', remarks: '', image: '' },
      { name: '', quotationNo: '', quotationDate: '', basicRate: '', paymentTerms: '', deliveryTime: '', make: '', remarks: '', image: '' }
    ]
  });

  useEffect(() => {
    setVendors(getVendors());
  }, []);

  const handleVendorChange = (index, field, value) => {
    const newVendors = [...formData.vendors];
    newVendors[index] = { ...newVendors[index], [field]: value };
    setFormData({ ...formData, vendors: newVendors });
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (step === 1) setStep(2);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const count = vendorType === 'Regular' ? 1 : 3;
    for (let i = 0; i < count; i++) {
      const v = formData.vendors[i];
      if (!v.name.trim()) {
        toast.error(`Please select Vendor ${i + 1}`);
        return;
      }
      if (!v.quotationNo.trim()) {
        toast.error(`Please enter Quotation No for Vendor ${i + 1}`);
        return;
      }
      if (!v.basicRate || parseFloat(v.basicRate) <= 0) {
        toast.error(`Please enter valid Basic Rate for Vendor ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);

      const allIndents = getIndents();
      const updatedIndents = allIndents.map(indent => {
        if (indent.id === item.indentId) {
          const updatedItems = indent.items.map(it => {
            if (it.itemCount === item.itemCount) {
              return {
                ...it,
                vendorRateInfo: {
                  vendorType,
                  vendorDetails: formData.vendors.slice(0, count),
                  updatedAt: new Date().toISOString()
                }
              };
            }
            return it;
          });
          return { ...indent, items: updatedItems };
        }
        return indent;
      });

      saveIndents(updatedIndents);
      toast.success('Vendor rates updated successfully!');

      setTimeout(() => {
        onSuccess();
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error(error);
      toast.error('Error saving vendor rates');
      setLoading(false);
    }
  };

  const vendorOptions = vendors.map(v => ({ value: v.name, label: v.name }));

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      title="Vendor Rate Update Form"
      onSubmit={step === 1 ? handleNext : handleSubmit}
      submitText={
        loading
          ? <><span className="md:hidden">Saving...</span><span className="hidden md:inline">Saving Changes...</span></>
          : step === 1
            ? 'Next Step'
            : <><span className="md:hidden">Save</span><span className="hidden md:inline">Update Rate</span></>
      }
      maxWidth={step === 2 && vendorType === 'Three Party' ? "max-w-[80vw]" : "max-w-sm"}
      extraFooterAction={
        step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )
      }
    >
      <div className="space-y-4">
        {step === 1 ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 gap-y-3">
              <div className="grid grid-cols-2 gap-x-2">
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Serial No</label>
                  <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-medium text-indigo-600">
                    {item.serialNo}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Item Count</label>
                  <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                    {item.itemCount}
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Firm Name</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                  {item.firmName}
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Department</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                  {item.department}
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Group-Head</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                  {item.groupHead}
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Item Name</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-semibold text-indigo-600 uppercase">
                  {item.itemName}
                </div>
              </div>
            </div>

            <div className="py-3 border-t border-gray-100">
              <label className="block text-center text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">Vendor Type Selection</label>
              <div className="flex gap-3">
                {['Regular', 'Three Party'].map((type) => (
                  <label
                    key={type}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all select-none
                      ${vendorType === type
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name="vendorType"
                      value={type}
                      checked={vendorType === type}
                      onChange={() => setVendorType(type)}
                      className="accent-indigo-600 w-3.5 h-3.5"
                    />
                    <span className={`text-[12px] font-semibold ${vendorType === type ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className={`animate-in fade-in slide-in-from-right-4 duration-300 ${vendorType === 'Three Party' ? 'flex flex-col md:flex-row gap-3 md:overflow-x-auto pb-2 items-stretch' : 'space-y-2'}`}>
            {[...Array(vendorType === 'Regular' ? 1 : 3)].map((_, idx) => (
              <div key={idx} className={`relative p-3 bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:border-indigo-100 ${vendorType === 'Three Party' ? 'w-full md:min-w-[300px] flex-1 flex flex-col' : 'w-full'}`}>
                <div className="flex justify-between items-center border-b border-gray-50 pb-1 mb-1.5">
                   <div className="flex items-center gap-2">
                     <span className="h-5 w-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-medium">{idx + 1}</span>
                     <span className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Proposal Details</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-y-1.5">
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Vendor Name *</label>
                    <SearchableDropdown
                      options={vendorOptions}
                      value={formData.vendors[idx].name}
                      onChange={(val) => {
                        const v = vendors.find(ven => ven.name === val);
                        handleVendorChange(idx, 'name', val);
                        if (v && v.paymentTerms?.length > 0) {
                          handleVendorChange(idx, 'paymentTerms', v.paymentTerms[0]);
                        }
                      }}
                      placeholder="Select vendor"
                      className="h-[32px] md:h-[38px]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Quotation No *</label>
                    <input
                      type="text"
                      value={formData.vendors[idx].quotationNo}
                      onChange={(e) => handleVendorChange(idx, 'quotationNo', e.target.value)}
                      placeholder="Enter Number"
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-[13px] h-[32px] md:h-[38px]"
                      required
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Quotation Date</label>
                    <input
                      type="date"
                      value={formData.vendors[idx].quotationDate}
                      onChange={(e) => handleVendorChange(idx, 'quotationDate', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-[13px] h-[32px] md:h-[38px] bg-white"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Basic Rate (₹) *</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm">₹</span>
                       <input
                        type="number"
                        step="0.01"
                        value={formData.vendors[idx].basicRate}
                        onChange={(e) => handleVendorChange(idx, 'basicRate', e.target.value)}
                        placeholder="0.00"
                        className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-[13px] h-[32px] md:h-[38px] font-medium text-indigo-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Payment Terms</label>
                    <select
                      value={formData.vendors[idx].paymentTerms}
                      onChange={(e) => handleVendorChange(idx, 'paymentTerms', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-[13px] h-[32px] md:h-[38px] bg-white"
                    >
                      <option value="">Select Terms</option>
                      {vendors.find(v => v.name === formData.vendors[idx].name)?.paymentTerms?.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Delivery Time (Days)</label>
                    <input
                      type="number"
                      value={formData.vendors[idx].deliveryTime}
                      onChange={(e) => handleVendorChange(idx, 'deliveryTime', e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-[13px] h-[32px] md:h-[38px]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Make / Brand</label>
                    <input
                      type="text"
                      value={formData.vendors[idx].make}
                      onChange={(e) => handleVendorChange(idx, 'make', e.target.value)}
                      placeholder="e.g. Samsung"
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-[13px] h-[32px] md:h-[38px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalForm>
  );
}
