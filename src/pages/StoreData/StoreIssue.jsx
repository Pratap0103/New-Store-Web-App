import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw, Plus, Printer, FileText } from 'lucide-react';
import { getStoreIssues, addStoreIssue } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import toast from 'react-hot-toast';

export default function StoreIssue() {
  const [records, setRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '' });

  const [formData, setFormData] = useState({
    issuedTo: '',
    department: 'Civil Works',
    projectName: '',
    itemName: 'OPC 53 Cement',
    qty: '',
    uom: 'Bags',
    authorizedBy: '',
    remarks: ''
  });

  useEffect(() => {
    setRecords(getStoreIssues());
  }, []);

  const refreshData = () => {
    setRecords(getStoreIssues());
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
          (item.issuedTo || '').toLowerCase().includes(q) ||
          (item.department || '').toLowerCase().includes(q) ||
          (item.projectName || '').toLowerCase().includes(q) ||
          (item.itemName || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [records, filters]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.issuedTo.trim() || !formData.projectName.trim() || !formData.qty || !formData.authorizedBy.trim()) {
      toast.error('Please enter all required fields.');
      return;
    }

    try {
      const newIssue = {
        date: new Date().toISOString().substring(0, 10),
        issuedTo: formData.issuedTo,
        department: formData.department,
        projectName: formData.projectName,
        itemName: formData.itemName,
        qty: Number(formData.qty),
        uom: formData.uom,
        authorizedBy: formData.authorizedBy,
        remarks: formData.remarks
      };

      addStoreIssue(newIssue);
      toast.success('Material Issue Slip created successfully!');
      setIsFormOpen(false);
      setFormData({
        issuedTo: '',
        department: 'Civil Works',
        projectName: '',
        itemName: 'OPC 53 Cement',
        qty: '',
        uom: 'Bags',
        authorizedBy: '',
        remarks: ''
      });
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create Issue Slip.');
    }
  };

  const handlePrint = (item) => {
    toast.success(`Printing Issue Slip ${item.id}...`);
  };

  const headers = [
    'Action', 'Slip No.', 'Date', 'Issued To', 'Department', 'Project Name',
    'Item Name', 'Quantity Issued', 'Unit', 'Authorized By', 'Remarks'
  ];

  const renderRow = (item, index) => {
    const formattedDate = item.date ? new Date(item.date).toLocaleDateString('en-GB') : '-';

    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <button
              onClick={() => handlePrint(item)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 rounded border hover:bg-slate-100 transition-all font-semibold text-[10px]"
            >
              <Printer size={12} />
              <span>Print</span>
            </button>
            <a
              href={`/store-issue-details?id=${item.id}`}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all font-semibold text-[10px]"
            >
              <FileText size={12} />
              <span>Details</span>
            </a>
          </div>
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.id}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 whitespace-nowrap">{formattedDate}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 whitespace-nowrap">{item.issuedTo}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">{item.department}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-600 max-w-[130px] truncate" title={item.projectName}>{item.projectName}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[150px] truncate" title={item.itemName}>{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-slate-800 whitespace-nowrap">{item.qty}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 whitespace-nowrap">{item.authorizedBy}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 max-w-[150px] truncate" title={item.remarks}>{item.remarks || '-'}</td>
      </tr>
    );
  };

  const renderCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Slip Number</span>
            <span className="text-xs font-extrabold text-indigo-600">{item.id}</span>
          </div>
          <button
            onClick={() => handlePrint(item)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition"
          >
            <Printer size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Issued To</span>
            <span className="font-bold text-gray-700 block truncate">{item.issuedTo}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Item Name</span>
            <span className="font-bold text-gray-700 block truncate">{item.itemName}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Quantity</span>
            <span className="font-black text-gray-800">{item.qty} {item.uom}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Authorized By</span>
            <span className="font-bold text-gray-700 block truncate">{item.authorizedBy}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <a
            href={`/store-issue-details?id=${item.id}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition font-semibold text-[10px]"
          >
            <FileText size={12} />
            <span>Details Log</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      
      {/* Header and filters toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        
        {/* Create Issue Slip Button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-black text-xs h-[38px] shadow-sm flex-shrink-0"
        >
          <Plus size={16} />
          <span>New Issue Slip</span>
        </button>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row w-full gap-2 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search Issue Slips..."
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
          minWidth="1400px"
          currentPage={1}
          totalPages={1}
          itemsPerPage={50}
          onPageChange={() => {}}
          onItemsPerPageChange={() => {}}
          totalResults={filteredData.length}
        />
      </div>

      {/* Log Issue Slip Modal Form */}
      {isFormOpen && (
        <ModalForm
          isOpen={true}
          onClose={() => setIsFormOpen(false)}
          title="Create Material Issue Slip"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Input: Item Selection */}
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

            {/* Input: Issued To */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Issued To (Person) *</label>
              <input
                type="text"
                placeholder="Ramesh Kumar (Supervisor)..."
                value={formData.issuedTo}
                onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Department */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Civil Works">Civil Works</option>
                <option value="Structure & Steel">Structure & Steel</option>
                <option value="Finishing & Paint">Finishing & Paint</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Masonry">Masonry</option>
              </select>
            </div>

            {/* Input: Project Name */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Project / Site Name *</label>
              <input
                type="text"
                placeholder="Pratap Site A..."
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Quantity Issued ({formData.uom}) *</label>
              <input
                type="number"
                placeholder="Enter numerical amount..."
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Authorized By */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Authorized By *</label>
              <input
                type="text"
                placeholder="S. P. Singh (Project Manager)..."
                value={formData.authorizedBy}
                onChange={(e) => setFormData({ ...formData, authorizedBy: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Input: Remarks */}
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase block">Remarks</label>
              <input
                type="text"
                placeholder="Details of material purpose or specific location info..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

          </div>
        </ModalForm>
      )}

    </div>
  );
}
