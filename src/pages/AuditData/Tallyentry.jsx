import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw, Calculator, CheckSquare } from 'lucide-react';
import { getTallyEntries, updateTallyEntry } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import { TabSwitcher } from '../../components/StandardButtons';
import toast from 'react-hot-toast';

export default function Tallyentry() {
  const [activeTab, setActiveTab] = useState('pending');
  const [records, setRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);
  const [formData, setFormData] = useState({ status: 'Done', remarks: '' });
  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '' });

  useEffect(() => {
    setRecords(getTallyEntries());
  }, []);

  const refreshData = () => {
    setRecords(getTallyEntries());
  };

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', fromDate: '', toDate: '' });

  // Filter records
  const pendingData = useMemo(() => {
    return records.filter(item => {
      // Stage 4 pending: has planned4 but no actual4
      if (!item.planned4 || item.actual4) return false;

      // Date filtering
      if (filters.fromDate || filters.toDate) {
        const itemDate = item.planned4 ? item.planned4.substring(0, 10) : '';
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }

      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.indentNumber || '').toLowerCase().includes(q) ||
          (item.poNumber || '').toLowerCase().includes(q) ||
          (item.productName || '').toLowerCase().includes(q) ||
          (item.partyName || '').toLowerCase().includes(q) ||
          (item.billNo || '').toLowerCase().includes(q) ||
          (item.firmNameMatch || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [records, filters]);

  const historyData = useMemo(() => {
    return records.filter(item => {
      // Stage 4 history: has planned4 and actual4
      if (!item.planned4 || !item.actual4) return false;

      // Date filtering
      if (filters.fromDate || filters.toDate) {
        const itemDate = item.actual4 ? item.actual4.substring(0, 10) : '';
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }

      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.indentNumber || '').toLowerCase().includes(q) ||
          (item.poNumber || '').toLowerCase().includes(q) ||
          (item.productName || '').toLowerCase().includes(q) ||
          (item.partyName || '').toLowerCase().includes(q) ||
          (item.billNo || '').toLowerCase().includes(q) ||
          (item.firmNameMatch || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [records, filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!processingItem) return;

    if (!formData.remarks.trim()) {
      toast.error('Please enter Tally ERP voucher number or remarks.');
      return;
    }

    try {
      const currentDateTime = new Date().toISOString();
      const updates = {
        actual4: currentDateTime,
        status4: formData.status,
        remarks4: formData.remarks
      };

      updateTallyEntry(processingItem.id, updates);
      toast.success(`Successfully registered Tally ERP log for Indent ${processingItem.indentNumber}`);
      setProcessingItem(null);
      setFormData({ status: 'Done', remarks: '' });
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save. Please try again.');
    }
  };

  const pendingHeaders = [
    'Action', 'Timestamp', 'PO Number', 'Indent No.', 'Project Name', 'Material In Date',
    'Planned Date', 'Product Name', 'Bill No.', 'Qty', 'Party Name', 'Bill Amt', 'Location'
  ];

  const historyHeaders = [
    'Timestamp', 'PO Number', 'Indent No.', 'Project Name', 'Material In Date', 'Product Name',
    'Bill No.', 'Qty', 'Party Name', 'Bill Amt', 'Tally Status', 'Voucher / Remarks', 'Location'
  ];

  const renderPendingRow = (item, index) => {
    const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-GB') : '-';
    const plannedDateStr = item.planned4 ? new Date(item.planned4).toLocaleDateString('en-GB') : '-';
    const materialInStr = item.materialInDate ? new Date(item.materialInDate).toLocaleDateString('en-GB') : '-';

    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <button
            onClick={() => setProcessingItem(item)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-semibold text-[11px] whitespace-nowrap mx-auto"
          >
            <CheckSquare size={13} />
            <span>Process</span>
          </button>
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 whitespace-nowrap">{formattedDate}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.poNumber || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-600 whitespace-nowrap">{item.indentNumber || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 max-w-[150px] truncate" title={item.firmNameMatch}>{item.firmNameMatch || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">{materialInStr}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 whitespace-nowrap">{plannedDateStr}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 max-w-[160px] truncate" title={item.productName}>{item.productName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.billNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-gray-800 whitespace-nowrap">{item.qty}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[150px] truncate" title={item.partyName}>{item.partyName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 max-w-[120px] truncate" title={item.location}>{item.location || '-'}</td>
      </tr>
    );
  };

  const renderHistoryRow = (item, index) => {
    const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-GB') : '-';
    const materialInStr = item.materialInDate ? new Date(item.materialInDate).toLocaleDateString('en-GB') : '-';

    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 whitespace-nowrap">{formattedDate}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.poNumber || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-600 whitespace-nowrap">{item.indentNumber || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 max-w-[150px] truncate" title={item.firmNameMatch}>{item.firmNameMatch || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">{materialInStr}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 max-w-[160px] truncate" title={item.productName}>{item.productName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.billNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-gray-800 whitespace-nowrap">{item.qty}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[150px] truncate" title={item.partyName}>{item.partyName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.status4 === 'Done' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {item.status4 || 'Done'}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-600 max-w-[180px] truncate" title={item.remarks4}>{item.remarks4 || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 max-w-[120px] truncate" title={item.location}>{item.location || '-'}</td>
      </tr>
    );
  };

  const renderPendingCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">PO Number</span>
            <span className="text-xs font-extrabold text-indigo-600">{item.poNumber || '-'}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-100 text-cyan-700">
            Tally Pending
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Product Name</span>
            <span className="font-bold text-gray-700 truncate block max-w-[150px]">{item.productName || '-'}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Total Amount</span>
            <span className="font-black text-emerald-600">₹{Number(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => setProcessingItem(item)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-semibold text-[10px]"
          >
            <CheckSquare size={12} />
            <span>Process Tally Log</span>
          </button>
        </div>
      </div>
    );
  };

  const renderHistoryCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">PO Number</span>
            <span className="text-xs font-extrabold text-indigo-600">{item.poNumber || '-'}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.status4 === 'Done' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {item.status4 || 'Done'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Product Name</span>
            <span className="font-bold text-gray-700 truncate block max-w-[150px]">{item.productName || '-'}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Voucher Number</span>
            <span className="font-bold text-gray-600 truncate block max-w-[150px]">{item.remarks4 || '-'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'pending', label: 'Pending Tally Log', count: pendingData.length },
            { id: 'history', label: 'Tally History', count: historyData.length }
          ]}
        />

        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row w-full gap-2 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
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

      {/* Main Table Card */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending' ? (
          <DataTable
            headers={pendingHeaders}
            data={pendingData}
            renderRow={renderPendingRow}
            renderCard={renderPendingCard}
            minWidth="1400px"
            currentPage={1}
            totalPages={1}
            itemsPerPage={50}
            onPageChange={() => {}}
            onItemsPerPageChange={() => {}}
            totalResults={pendingData.length}
          />
        ) : (
          <DataTable
            headers={historyHeaders}
            data={historyData}
            renderRow={renderHistoryRow}
            renderCard={renderHistoryCard}
            minWidth="1500px"
            currentPage={1}
            totalPages={1}
            itemsPerPage={50}
            onPageChange={() => {}}
            onItemsPerPageChange={() => {}}
            totalResults={historyData.length}
          />
        )}
      </div>

      {/* Action popover Form Modal */}
      {processingItem && (
        <ModalForm
          isOpen={true}
          onClose={() => {
            setProcessingItem(null);
            setFormData({ status: 'Done', remarks: '' });
          }}
          title="Tally ERP Journal Entry"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Pre-filled fields */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {[
                ['PO Number', processingItem.poNumber],
                ['Indent Number', processingItem.indentNumber],
                ['Project Name', processingItem.firmNameMatch],
                ['Product Name', processingItem.productName],
                ['Party Name', processingItem.partyName],
                ['Bill Number', processingItem.billNo],
                ['Quantity', processingItem.qty],
                ['Bill Amount', `₹${Number(processingItem.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
              ].map(([lbl, val]) => (
                <div key={lbl} className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">{lbl}</span>
                  <span className="text-xs font-bold text-gray-700 block break-words">{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Tally Entry Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Done">Done (Voucher Entered in Tally ERP)</option>
                <option value="Not Done">Not Done (On Hold)</option>
              </select>
            </div>

            {/* ERP Voucher ID input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block">Tally Voucher Number / Remarks *</label>
              <input
                type="text"
                placeholder="Enter Tally ERP Journal Voucher ID (e.g. V-199283)..."
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
