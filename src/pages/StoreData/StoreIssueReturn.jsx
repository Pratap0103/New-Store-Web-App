import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw, Plus } from 'lucide-react';
import { getStoreReturns, addStoreReturn } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import toast from 'react-hot-toast';

export default function StoreIssueReturn() {
  const [records, setRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '' });

  const [formData, setFormData] = useState({
    originalSlipNo: '',
    returnedBy: '',
    itemName: 'OPC 53 Cement',
    qty: '',
    uom: 'Bags',
    reason: '',
    condition: 'Good - Resellable / Reissuable'
  });

  useEffect(() => {
    setRecords(getStoreReturns());
  }, []);

  const refreshData = () => {
    setRecords(getStoreReturns());
  };

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', fromDate: '', toDate: '' });

  const filteredData = useMemo(() => {
    return records.filter(item => {
      // Date filtering
      if (filters.fromDate || filters.toDate) {
        const itemDate = item.date || '';
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }

      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.id || '').toLowerCase().includes(q) ||
          (item.originalSlipNo || '').toLowerCase().includes(q) ||
          (item.returnedBy || '').toLowerCase().includes(q) ||
          (item.itemName || '').toLowerCase().includes(q) ||
          (item.reason || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [records, filters]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.originalSlipNo.trim() || !formData.returnedBy.trim() || !formData.qty || !formData.reason.trim()) {
      toast.error('Please enter all required fields.');
      return;
    }

    try {
      const newReturn = {
        date: new Date().toISOString().substring(0, 10),
        originalSlipNo: formData.originalSlipNo,
        returnedBy: formData.returnedBy,
        itemName: formData.itemName,
        qty: Number(formData.qty),
        uom: formData.uom,
        reason: formData.reason,
        condition: formData.condition
      };

      addStoreReturn(newReturn);
      toast.success('Material Return Slip created successfully!');
      setIsFormOpen(false);
      setFormData({
        originalSlipNo: '',
        returnedBy: '',
        itemName: 'OPC 53 Cement',
        qty: '',
        uom: 'Bags',
        reason: '',
        condition: 'Good - Resellable / Reissuable'
      });
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create Return Slip.');
    }
  };

  const headers = [
    'Return Slip No.', 'Date', 'Original Issue Slip No.', 'Returned By',
    'Item Name', 'Quantity Returned', 'Unit', 'Reason', 'Condition'
  ];

  const renderRow = (item, index) => {
    const formattedDate = item.date ? new Date(item.date).toLocaleDateString('en-GB') : '-';

    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center text-xs font-black text-rose-600 whitespace-nowrap">{item.id}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 whitespace-nowrap">{formattedDate}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.originalSlipNo}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 whitespace-nowrap">{item.returnedBy}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[150px] truncate" title={item.itemName}>{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-slate-800 whitespace-nowrap">{item.qty}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-600 max-w-[160px] truncate" title={item.reason}>{item.reason}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.condition.includes('Good') || item.condition.includes('Perfect') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {item.condition}
          </span>
        </td>
      </tr>
    );
  };

  const renderCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Return Slip</span>
            <span className="text-xs font-extrabold text-rose-600">{item.id}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.condition.includes('Good') || item.condition.includes('Perfect') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {item.condition.split(' - ')[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Returned By</span>
            <span className="font-bold text-gray-700 block truncate">{item.returnedBy}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Original Issue Slip</span>
            <span className="font-black text-indigo-600 block">{item.originalSlipNo}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Quantity</span>
            <span className="font-black text-gray-800">{item.qty} {item.uom}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Reason</span>
            <span className="font-bold text-gray-500 block truncate" title={item.reason}>{item.reason}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      
      {/* Header toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        
        {/* Log Return slip button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-black text-xs h-[38px] shadow-sm flex-shrink-0"
        >
          <Plus size={16} />
          <span>New Return Slip</span>
        </button>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row w-full gap-2 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search Return Slips..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[38px] shadow-sm font-medium"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[38px] w-[38px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-300 text-gray-600'}`}
            >
              <Filter size={14} />
            </button>
            <button
              onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[38px] w-[38px] flex-shrink-0"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto lg:flex-[8] items-center`}>
            {['From Date', 'To Date'].map((ph, idx) => (
              <div key={ph} className="flex-1 w-full relative">
                <Calendar className="absolute left-2.5 top-[12px] text-gray-400 pointer-events-none" size={14} />
                <input
                  type="text"
                  placeholder={ph}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                  value={idx === 0 ? filters.fromDate : filters.toDate}
                  onChange={(e) => setFilters({ ...filters, [idx === 0 ? 'fromDate' : 'toDate']: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[38px] shadow-sm font-medium"
                />
              </div>
            ))}
            <button
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded w-[38px] h-[38px] hover:bg-gray-100 shadow-sm"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Datatable */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          headers={headers}
          data={filteredData}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1300px"
          currentPage={1}
          totalPages={1}
          itemsPerPage={50}
          onPageChange={() => {}}
          onItemsPerPageChange={() => {}}
          totalResults={filteredData.length}
        />
      </div>

      {/* Log Return Slip Modal Form */}
      {isFormOpen && (
        <ModalForm
          isOpen={true}
          onClose={() => setIsFormOpen(false)}
          title="Create Material Return Slip"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Input: Original Issue Slip */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Original Issue Slip No. *</label>
              <input
                type="text"
                placeholder="e.g. ISS-2026-901..."
                value={formData.originalSlipNo}
                onChange={(e) => setFormData({ ...formData, originalSlipNo: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Returned By */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Returned By *</label>
              <input
                type="text"
                placeholder="Ramesh Kumar (Supervisor)..."
                value={formData.returnedBy}
                onChange={(e) => setFormData({ ...formData, returnedBy: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Item Name Selection */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Material Item *</label>
              <select
                value={formData.itemName}
                onChange={(e) => {
                  const uomMap = {
                    'OPC 53 Cement': 'Bags',
                    'TMT Fe 550 Rebars 12mm': 'MT',
                    'Easy Clean Emulsion White': 'Liters',
                    '3-Core Copper Flexible Cable': 'Meters',
                    '10HP Submersible Pump': 'Nos',
                    '1200mm Premium Ceiling Fan': 'Nos',
                    '3 Phase AC Contractor': 'Nos',
                    'Rapid Hardening Cement': 'Bags'
                  };
                  setFormData({
                    ...formData,
                    itemName: e.target.value,
                    uom: uomMap[e.target.value] || 'Bags'
                  });
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="OPC 53 Cement">OPC 53 Cement (Bags)</option>
                <option value="TMT Fe 550 Rebars 12mm">TMT Fe 550 Rebars 12mm (MT)</option>
                <option value="Easy Clean Emulsion White">Easy Clean Emulsion White (Liters)</option>
                <option value="3-Core Copper Flexible Cable">3-Core Copper Flexible Cable (Meters)</option>
                <option value="10HP Submersible Pump">10HP Submersible Pump (Nos)</option>
                <option value="1200mm Premium Ceiling Fan">1200mm Premium Ceiling Fan (Nos)</option>
                <option value="3 Phase AC Contractor">3 Phase AC Contractor (Nos)</option>
                <option value="Rapid Hardening Cement">Rapid Hardening Cement (Bags)</option>
              </select>
            </div>

            {/* Input: Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Quantity Returned ({formData.uom}) *</label>
              <input
                type="number"
                placeholder="Enter returned numerical amount..."
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Condition */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Condition of Returned Material *</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Good - Resellable / Reissuable">Good - Resellable / Reissuable</option>
                <option value="Perfect - Unopened">Perfect - Unopened</option>
                <option value="Damaged - Defective / Scrap">Damaged - Defective / Scrap</option>
              </select>
            </div>

            {/* Input: Reason */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Reason for Return *</label>
              <input
                type="text"
                placeholder="Unused excess, project layout change..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

          </div>
        </ModalForm>
      )}

    </div>
  );
}
