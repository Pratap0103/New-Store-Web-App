import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw, Eye, FileText } from 'lucide-react';
import { getIndents } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';

function VendorViewModal({ vendor, onClose }) {
  if (!vendor) return null;
  return (
    <div className="fixed inset-0 lg:left-64 2xl:left-72 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[110] p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[550px] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-center flex-shrink-0">
          <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Approved Vendor Details</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <span className="h-5 w-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">★</span>
              <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight break-words">{vendor.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ['Quotation No',    vendor.quotationNo],
                ['Quotation Date',  vendor.quotationDate],
                ['Basic Rate',      `₹${vendor.basicRate}`],
                ['Payment Terms',   vendor.paymentTerms],
                ['Delivery (Days)', vendor.deliveryTime],
                ['Make / Brand',    vendor.make],
              ].map(([label, val]) => (
                <div key={label} className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">{label}</span>
                  <span className="text-[10px] font-semibold text-gray-700 break-words block">{val || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition font-black uppercase tracking-widest">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function PendingPO() {
  const [indents,           setIndents]           = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage,       setCurrentPage]       = useState(1);
  const [itemsPerPage,      setItemsPerPage]      = useState(15);
  const [viewingVendor,     setViewingVendor]     = useState(null);
  const [filters, setFilters] = useState({ 
    searchQuery: '', fromDate: '', toDate: '', department: '', groupHead: '' 
  });

  const refreshData = () => setIndents(getIndents());
  useEffect(() => { refreshData(); }, []);

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', fromDate: '', toDate: '', department: '', groupHead: '' });

  const flattenedData = useMemo(() => {
    const items = [];
    indents.forEach(indent => {
      indent.items.forEach(item => {
        if (item.managementApproval) {
          items.push({
            ...indent, ...item,
            indentId: indent.id,
            timestamp: indent.timestamp,
            firmName: indent.firmName
          });
        }
      });
    });
    return items.reverse();
  }, [indents]);

  const filteredData = useMemo(() => {
    return flattenedData.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const [dStr] = item.timestamp.split(' ');
        const [d, m, y] = dStr.split('/');
        const itemDate = `${y}-${m}-${d}`;
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate   && itemDate > filters.toDate)   return false;
      }
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead  && item.groupHead  !== filters.groupHead)  return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.serialNo.toLowerCase().includes(q)   ||
          item.firmName.toLowerCase().includes(q)   ||
          item.itemName.toLowerCase().includes(q)   ||
          item.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [flattenedData, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);

  const deptOptions = useMemo(() =>
    Array.from(new Set(flattenedData.map(i => i.department))).filter(Boolean).sort().map(d => ({ value: d, label: d }))
  , [flattenedData]);

  const ghOptions = useMemo(() =>
    Array.from(new Set(flattenedData.map(i => i.groupHead))).filter(Boolean).sort().map(g => ({ value: g, label: g }))
  , [flattenedData]);

  const tableHeaders = [
    'Serial No', 'ItemCount', 'Firm Name',
    'Department', 'Group-Head', 'Item Name', 'UOM', 'Qty',
    'Vendor Type', 'Approved Vendor'
  ];

  const renderRow = (item) => {
    const ma = item.managementApproval || {};
    const vendor = ma.approvedVendor || {};
    const vInfo = item.vendorRateInfo || {};
    return (
      <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.itemQty}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${vInfo.vendorType === 'Three Party' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <div onClick={() => setViewingVendor(vendor)} className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-all bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight whitespace-nowrap">{vendor.name}</span>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-[10px] font-black text-emerald-600 whitespace-nowrap">₹{vendor.basicRate}</span>
            <Eye size={12} className="text-emerald-400 ml-1" />
          </div>
        </td>
      </tr>
    );
  };

  const renderCard = (item) => {
    const ma = item.managementApproval || {};
    const vendor = ma.approvedVendor || {};
    const vInfo = item.vendorRateInfo || {};
    return (
      <div key={`${item.id}-${item.itemCount}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-bold text-gray-900 break-words">{item.itemName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-indigo-600 font-black uppercase">{item.serialNo}</span>
              <span className="text-[9px] text-gray-400">|</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase"># {item.itemCount}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${vInfo.vendorType === 'Three Party' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-[11px] py-3 border-t border-b border-gray-50">
          <div className="col-span-2"><span className="text-gray-400 block text-[9px] uppercase font-bold">Firm Name</span><span className="font-semibold text-gray-800">{item.firmName}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Department</span><span className="text-gray-600">{item.department}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Group-Head</span><span className="text-gray-600">{item.groupHead}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Qty / UOM</span><span className="text-indigo-600 font-black">{item.itemQty} {item.uom}</span></div>
        </div>

        <div className="pt-2">
          <button onClick={() => setViewingVendor(vendor)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[11px] font-black active:scale-95 transition-all shadow-sm">
            <Eye size={14} /> View Approved: {vendor.name}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input type="text" placeholder="Search..." value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-300 text-gray-600'}`}>
              <Filter size={14} />
            </button>
            <button onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0">
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[8] items-center`}>
            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
              {['From Date', 'To Date'].map((ph, idx) => (
                <div key={ph} className="flex-1 min-w-0 lg:min-w-[140px] relative">
                  <Calendar className="absolute left-2.5 top-[9px] lg:top-[12px] text-gray-400 pointer-events-none" size={14} />
                  <input type="text" placeholder={ph}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    value={idx === 0 ? filters.fromDate : filters.toDate}
                    onChange={(e) => setFilters({ ...filters, [idx === 0 ? 'fromDate' : 'toDate']: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px]"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
              <div className="flex-1 min-w-0 lg:min-w-[120px]">
                <SearchableDropdown options={deptOptions} value={filters.department}
                  onChange={(val) => setFilters({ ...filters, department: val })}
                  placeholder="All Dept" className="h-[32px] md:h-[38px]" />
              </div>
              <div className="flex-1 min-w-0 lg:min-w-[110px]">
                <SearchableDropdown options={ghOptions} value={filters.groupHead}
                  onChange={(val) => setFilters({ ...filters, groupHead: val })}
                  placeholder="All GH" className="h-[32px] md:h-[38px]" />
              </div>
            </div>
            <button onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded w-[38px] h-[38px] hover:bg-gray-100 shadow-sm">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          headers={tableHeaders}
          data={paginatedData}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="min-w-[1400px] 2xl:min-w-full"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalResults={filteredData.length}
        />
      </div>
      {viewingVendor && <VendorViewModal vendor={viewingVendor} onClose={() => setViewingVendor(null)} />}
    </div>
  );
}
