import React, { useState } from 'react';
import { Truck, Receipt, MapPin, Clipboard, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import ModalForm from '../../components/ModalForm';
import { getLiftingRecords, saveLiftingRecords } from '../../utils/storageManager';
import { toast } from 'sonner';

export default function FrightForm({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicleNumber: item.vehicleNo || '',
    biltyNumber: '',
    fromLocation: '',
    toLocation: '',
    rateType: 'Fixed',
    freightAmount: item.frightAmount || '',
    materialLoadDetails: '',
    biltyImage: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const records = getLiftingRecords();
      const index = records.findIndex(r => r.id === item.id);
      
      if (index !== -1) {
        records[index] = {
          ...records[index],
          freightPaymentStatus: 'Paid',
          freightPaidAt: new Date().toISOString(),
          freightData: { ...formData }
        };
        saveLiftingRecords(records);
        toast.success("Freight payment submitted successfully");
        onSuccess();
      }
    } catch (error) {
      toast.error("Error submitting freight payment");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-300";
  const labelClass = "block text-[11px] font-bold text-gray-500 mb-1 tracking-tight uppercase";

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex flex-col items-center py-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 text-indigo-600 border border-indigo-100 shadow-sm">
                <Truck size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Freight Payment Form</h2>
        </div>
      }
      onSubmit={handleSubmit}
      submitText={loading ? "Submitting..." : "Submit Payment"}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Row 1: Vehicle & Bilty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
                <label className={labelClass}>Vehicle Number</label>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Enter vehicle number"
                        className={inputClass}
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                        required
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className={labelClass}>Bilty Number</label>
                <input 
                    type="text" 
                    placeholder="Enter bilty number"
                    className={inputClass}
                    value={formData.biltyNumber}
                    onChange={(e) => setFormData({...formData, biltyNumber: e.target.value})}
                    required
                />
            </div>
        </div>

        {/* Row 2: From & To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
                <label className={labelClass}>From</label>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Enter source location"
                        className={inputClass}
                        value={formData.fromLocation}
                        onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                        required
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className={labelClass}>To</label>
                <input 
                    type="text" 
                    placeholder="Enter destination location"
                    className={inputClass}
                    value={formData.toLocation}
                    onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                    required
                />
            </div>
        </div>

        {/* Row 3: Rate Type & Freight Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
                <label className={labelClass}>Rate Type</label>
                <select 
                    className={inputClass}
                    value={formData.rateType}
                    onChange={(e) => setFormData({...formData, rateType: e.target.value})}
                >
                    <option value="Fixed">Fixed</option>
                    <option value="Per KM">Per KM</option>
                    <option value="Per Ton">Per Ton</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className={labelClass}>Freight Amount</label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 font-bold">₹</span>
                    <input 
                        type="number" 
                        placeholder="1234567890"
                        className={`${inputClass} pl-7`}
                        value={formData.freightAmount}
                        onChange={(e) => setFormData({...formData, freightAmount: e.target.value})}
                        required
                    />
                </div>
            </div>
        </div>

        {/* Row 4: Material Load Details */}
        <div className="space-y-1">
            <label className={labelClass}>Material Load Details</label>
            <textarea 
                placeholder="Enter material load details"
                className={`${inputClass} min-h-[100px] resize-none`}
                value={formData.materialLoadDetails}
                onChange={(e) => setFormData({...formData, materialLoadDetails: e.target.value})}
                required
            />
        </div>

        {/* Row 5: Bilty Image */}
        <div className="space-y-1">
            <label className={labelClass}>Bilty Image</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon size={24} className="text-gray-400 group-hover:text-indigo-500 mb-1" />
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Choose Bilty Image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                </label>
            </div>
        </div>
      </div>
    </ModalForm>
  );
}
