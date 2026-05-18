import React, { useState, useEffect, useMemo } from 'react';
import { FilePlus2, Plus, Pencil, Save, X } from 'lucide-react';
import { getIndents, getVendors, getCompanies, getQuotationHistory, insertQuotationHistory } from '../../utils/storageManager';
import toast from 'react-hot-toast';

export default function Enquiry() {
  const [indents, setIndents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [quotationHistory, setQuotationHistory] = useState([]);
  
  // Form states
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState([
    "Payment within 30 days of invoice date.",
    "Delivery within 2 weeks of purchase order."
  ]);
  const [newTerm, setNewTerm] = useState('');

  // Address states
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('');

  useEffect(() => {
    setIndents(getIndents());
    setVendors(getVendors());
    
    const comps = getCompanies();
    setCompanies(comps);
    
    const h = getQuotationHistory();
    setQuotationHistory(h);

    if (comps && comps.length > 0) {
      setBillingAddress(comps[0].billingAddress || comps[0].address || '');
      setDestinationAddress(comps[0].destinationAddress || comps[0].address || '');
    }
  }, []);

  const refreshData = () => {
    setIndents(getIndents());
    setQuotationHistory(getQuotationHistory());
  };

  const details = companies[0] || {
    name: 'Botivate Services',
    address: 'Mumbai, HQ',
    gst: '27ABCDE1234A1Z5',
    pan: 'ABCDE1234A',
    phone: '919820012345'
  };

  // Convert vendors list for select dropdown
  const masterSuppliers = useMemo(() => {
    return vendors.map(v => ({
      supplierName: v.name,
      vendorGstin: v.gstin || '27XXXXX1234A1Z0',
      vendorAddress: v.address || 'Vendor HQ Address',
      email: v.email || 'supplier@example.com'
    }));
  }, [vendors]);

  // Eligible indents: Flattened indent items that are APPROVED and do not have quotation history
  const eligibleItems = useMemo(() => {
    const flattened = indents.flatMap(indent =>
      (indent.items || []).map(item => ({
        ...indent,
        ...item,
        indentNumber: indent.id,
        firmNameMatch: indent.firmName || indent.projectName || 'Botivate Services'
      }))
    );

    // Filter items that have status APPROVED (Stage 1 approved) and do NOT have quotation history
    return flattened.filter(item => {
      const isApproved = item.approvalStatus === 'APPROVED';
      const alreadyHasEnquiry = quotationHistory.some(h => h.indentNo === item.indentNumber && h.product === item.productName);
      return isApproved && !alreadyHasEnquiry;
    }).reverse();
  }, [indents, quotationHistory]);

  const handleSupplierSelect = (e) => {
    const supplierName = e.target.value;
    if (!supplierName) return;

    if (selectedSuppliers.includes(supplierName)) {
      setSelectedSuppliers(selectedSuppliers.filter(s => s !== supplierName));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplierName]);
    }
    e.target.value = '';
  };

  const removeSupplier = (name) => {
    setSelectedSuppliers(selectedSuppliers.filter(s => s !== name));
  };

  const handleItemSelection = (indentNum, productName, checked) => {
    const key = `${indentNum}-${productName}`;
    if (checked) {
      setSelectedItems([...selectedItems, key]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== key));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const keys = eligibleItems.map(item => `${item.indentNumber}-${item.productName}`);
      setSelectedItems(keys);
    } else {
      setSelectedItems([]);
    }
  };

  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setTerms([...terms, newTerm.trim()]);
      setNewTerm('');
    }
  };

  const handleRemoveTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedItems([]);
    setSelectedSuppliers([]);
    setDescription('');
    setTerms([
      "Payment within 30 days of invoice date.",
      "Delivery within 2 weeks of purchase order."
    ]);
    toast.success('Form cleared');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('Please select at least one indent item');
      return;
    }

    if (selectedSuppliers.length === 0) {
      toast.error('Please select at least one supplier');
      return;
    }

    try {
      // Find selected items details
      const selectedItemsData = eligibleItems.filter(item =>
        selectedItems.includes(`${item.indentNumber}-${item.productName}`)
      );

      // Generate Enquiry No
      const existingQuotations = getQuotationHistory();
      const uniqueNos = Array.from(new Set(existingQuotations.map(q => q.quatationNo)));
      
      let maxNumber = 0;
      uniqueNos.forEach(num => {
        const match = String(num || '').trim().match(/^QT-(\d+)$/i);
        if (match) {
          const val = parseInt(match[1], 10);
          if (val > maxNumber) maxNumber = val;
        }
      });
      
      const newQuotationNo = `QT-${String(maxNumber + 1).padStart(3, '0')}`;
      const allQuotationRows = [];

      selectedSuppliers.forEach(supplierName => {
        const masterSupplier = masterSuppliers.find(s => s.supplierName === supplierName) || {
          vendorAddress: 'Supplier Corporate Office',
          vendorGstin: '27XXXXX1234A1Z1',
          email: 'supplier@example.com'
        };

        const sessionToken = crypto.randomUUID();

        selectedItemsData.forEach(item => {
          allQuotationRows.push({
            timestamp: new Date().toISOString(),
            quatationNo: newQuotationNo,
            supplierName: supplierName,
            adreess: masterSupplier.vendorAddress,
            gst: masterSupplier.vendorGstin,
            indentNo: item.indentNumber,
            product: item.productName,
            description: item.specifications || item.remarks || '',
            qty: String(item.itemQty || item.quantity || 1),
            unit: item.uom || 'Bags',
            pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            firm: item.firmNameMatch,
            firm_id: item.firmId || 'FIRM-101',
            token: sessionToken,
            responded_at: null,
            vendor_rate: null
          });
        });
      });

      insertQuotationHistory(allQuotationRows);
      toast.success(`Enquiry ${newQuotationNo} generated and sent to ${selectedSuppliers.length} supplier(s)!`);
      
      // Clear Form state
      setSelectedItems([]);
      setSelectedSuppliers([]);
      setDescription('');
      
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create Enquiry');
    }
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0 overflow-hidden">
      
      {/* Fixed Header Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 pb-2 border-b border-gray-100 px-2 md:px-0 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <FilePlus2 size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">Create Enquiry</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Generate RFQ / Enquiry Requests ({eligibleItems.length} Eligible)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-50 rounded flex items-center justify-center text-indigo-600">
            <FilePlus2 size={14} />
          </div>
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">RFQ Module</span>
        </div>
      </div>

      {/* Main Form Box with FIXED HEIGHT Scrollable Inner Body to prevent viewport scrolling */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 space-y-3 max-w-6xl w-full mx-auto">
        
        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0 py-1">
          
          {/* 1. Corporate Identity Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-50">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                B
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-base font-black text-slate-800 uppercase tracking-tight">{details.name}</h1>
                <p className="text-[10px] text-gray-500 font-medium">{details.address}</p>
                <p className="text-[9px] text-gray-400 font-bold">Contact Hotline: +{details.phone || '919820012345'}</p>
              </div>
            </div>
            
            <hr className="border-gray-100" />
            <h2 className="text-center font-black text-slate-600 text-xs tracking-widest uppercase">Generate New Material RFQ / Enquiry</h2>
            <hr className="border-gray-100" />

            {/* Supplier Selection Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase block">Suppliers (Select multiple from Master Vendor list) *</label>
              <select
                onChange={handleSupplierSelect}
                value=""
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none h-[36px]"
              >
                <option value="">-- Choose Supplier from Master list --</option>
                {masterSuppliers.map((supplier, k) => (
                  <option key={k} value={supplier.supplierName}>{supplier.supplierName}</option>
                ))}
              </select>

              {/* Selected suppliers badges */}
              {selectedSuppliers.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {selectedSuppliers.map((supplier, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      <span>{supplier}</span>
                      <button
                        type="button"
                        onClick={() => removeSupplier(supplier)}
                        className="hover:bg-indigo-100 rounded-full p-0.5"
                      >
                        <X size={8} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Address cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Card 1: Commercial info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 space-y-1.5">
              <div className="bg-slate-50 px-2.5 py-1 rounded border border-gray-100 text-center font-black text-[10px] text-slate-700 uppercase">
                Our Commercial Details
              </div>
              <div className="text-xs space-y-1 font-semibold text-gray-600">
                <p><span className="text-[9px] text-gray-400 font-bold block uppercase">GSTIN Registration</span> {details.gst}</p>
                <p><span className="text-[9px] text-gray-400 font-bold block uppercase">PAN card No</span> {details.pan}</p>
              </div>
            </div>

            {/* Card 2: Billing Address */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 space-y-1.5">
              <div className="bg-slate-50 px-2.5 py-1 rounded border border-gray-100 flex items-center justify-between font-black text-[10px] text-slate-700 uppercase">
                <span>Billing Address</span>
                <button
                  type="button"
                  onClick={() => setIsEditingBilling(!isEditingBilling)}
                  className="p-0.5 hover:bg-gray-100 rounded transition text-indigo-600"
                >
                  {isEditingBilling ? <Save size={10} /> : <Pencil size={10} />}
                </button>
              </div>
              <div className="text-xs font-semibold text-gray-600">
                <p className="font-bold text-slate-800">M/S {details.name}</p>
                {isEditingBilling ? (
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full mt-1 border border-indigo-200 px-2 py-0.5 rounded text-xs focus:outline-none focus:border-indigo-600"
                  />
                ) : (
                  <p className="text-gray-500 mt-0.5 truncate" title={billingAddress}>{billingAddress}</p>
                )}
              </div>
            </div>

            {/* Card 3: Destination Address */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 space-y-1.5">
              <div className="bg-slate-50 px-2.5 py-1 rounded border border-gray-100 flex items-center justify-between font-black text-[10px] text-slate-700 uppercase">
                <span>Destination Address</span>
                <button
                  type="button"
                  onClick={() => setIsEditingDestination(!isEditingDestination)}
                  className="p-0.5 hover:bg-gray-100 rounded transition text-indigo-600"
                >
                  {isEditingDestination ? <Save size={10} /> : <Pencil size={10} />}
                </button>
              </div>
              <div className="text-xs font-semibold text-gray-600">
                <p className="font-bold text-slate-800">M/S {details.name}</p>
                {isEditingDestination ? (
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="w-full mt-1 border border-indigo-200 px-2 py-0.5 rounded text-xs focus:outline-none focus:border-indigo-600"
                  />
                ) : (
                  <p className="text-gray-500 mt-0.5 truncate" title={destinationAddress}>{destinationAddress}</p>
                )}
              </div>
            </div>

          </div>

          {/* Description note */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase block">Description / Letter Note</label>
            <textarea
              placeholder="Enter enquiry specific message details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 shadow-sm min-h-[45px] max-h-[70px] resize-y"
            />
          </div>

          {/* 3. Eligible Indent Items Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-3 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase block">Approved Indent Items (Ready for Enquiry Request)</span>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[170px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="px-3 py-1.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === eligibleItems.length && eligibleItems.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="px-2 py-1.5 text-center">SR.</th>
                    <th className="px-2 py-1.5 text-center">INDENT NO</th>
                    <th className="px-2 py-1.5 text-center">FIRM NAME</th>
                    <th className="px-2 py-1.5 text-center">PRODUCT NAME</th>
                    <th className="px-2 py-1.5 text-center">QTY</th>
                    <th className="px-2 py-1.5 text-center">UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-xs font-bold text-gray-400">
                        No pending approved indent items eligible for Enquiry.
                      </td>
                    </tr>
                  ) : (
                    eligibleItems.map((item, index) => {
                      const key = `${item.indentNumber}-${item.productName}`;
                      const isSelected = selectedItems.includes(key);
                      
                      return (
                        <tr key={index} className="hover:bg-slate-50/50 border-b border-gray-100 transition-colors">
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleItemSelection(item.indentNumber, item.productName, e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="px-2 py-2 text-center text-xs font-bold text-gray-400">{index + 1}</td>
                          <td className="px-2 py-2 text-center text-xs font-black text-indigo-600">{item.indentNumber}</td>
                          <td className="px-2 py-2 text-center text-xs font-bold text-gray-700">{item.firmNameMatch}</td>
                          <td className="px-2 py-2 text-center text-xs font-black text-slate-800">{item.productName}</td>
                          <td className="px-2 py-2 text-center text-xs font-black text-gray-700">{item.itemQty || item.quantity || 1}</td>
                          <td className="px-2 py-2 text-center text-xs font-bold text-slate-500 uppercase">{item.uom || 'Bags'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Terms and conditions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <span className="text-[10px] font-black text-slate-700 uppercase">Terms & Conditions</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add custom term..."
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="border border-gray-300 px-2 py-0.5 rounded text-xs focus:outline-none focus:border-indigo-600 font-semibold h-[26px] w-[180px]"
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
              {terms.map((term, index) => (
                <div key={index} className="flex items-start justify-between gap-3 text-xs font-semibold text-gray-600 bg-slate-50 p-2 rounded-lg border border-gray-100">
                  <p className="flex-1"><span className="text-[9px] text-gray-400 font-bold mr-1">{index + 1}.</span> {term}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(index)}
                    className="text-red-500 hover:text-red-700 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {terms.length === 0 && (
                <p className="text-center py-1.5 text-xs font-bold text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  No custom terms added. Click "+" to register terms.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Fixed Footer Actions Panel */}
        <div className="bg-slate-50 border-t border-gray-200 p-3 flex-shrink-0 flex items-center justify-between rounded-xl">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
            {selectedItems.length} items selected for RFQ
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition text-xs font-black uppercase tracking-wider shadow-sm h-[36px]"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-xs font-black uppercase tracking-wider shadow-sm h-[36px]"
            >
              Save And Send Enquiry
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
