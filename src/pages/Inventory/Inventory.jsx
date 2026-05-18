import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RotateCcw, ShieldCheck, AlertTriangle, Coins, Blocks } from 'lucide-react';
import { getInventory } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';

export default function Inventory() {
  const [records, setRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ searchQuery: '', groupHead: '', firmName: '' });

  useEffect(() => {
    setRecords(getInventory());
  }, []);

  const refreshData = () => {
    setRecords(getInventory());
  };

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', groupHead: '', firmName: '' });

  // Get filter lists
  const groupHeads = useMemo(() => {
    const list = records.map(r => r.groupHead).filter(Boolean);
    return Array.from(new Set(list));
  }, [records]);

  const firmNames = useMemo(() => {
    const list = records.map(r => r.firmName).filter(Boolean);
    return Array.from(new Set(list));
  }, [records]);

  // Filters
  const filteredData = useMemo(() => {
    return records.filter(item => {
      if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
      if (filters.firmName && item.firmName !== filters.firmName) return false;

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.item || '').toLowerCase().includes(q) ||
          (item.department || '').toLowerCase().includes(q) ||
          (item.firmName || '').toLowerCase().includes(q) ||
          (item.groupHead || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [records, filters]);

  // Aggregate metrics
  const aggregates = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      acc.totalItems++;
      acc.totalStockValue += parseFloat(row.totalPrice) || 0;
      if (row.status === 'Critical') {
        acc.warnings++;
      }
      return acc;
    }, { totalItems: 0, totalStockValue: 0, warnings: 0 });
  }, [filteredData]);

  const headers = [
    'Item', 'FIRM Name', 'Department', 'Group Head', 'UOM', 'Status',
    'Indented', 'Approved', 'Purchase Return', 'Lifting Quantity',
    'In Transit', 'Issue Return', 'Issued', 'S.T. To', 'S.T. From',
    'Quantity', 'Total Price'
  ];

  const renderRow = (item, index) => {
    return (
      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-3 py-2.5 text-xs font-black text-slate-800 whitespace-nowrap">{item.item}</td>
        <td className="px-3 py-2.5 text-xs font-bold text-gray-700 max-w-[140px] truncate" title={item.firmName}>{item.firmName}</td>
        <td className="px-3 py-2.5 text-xs font-semibold text-slate-500 whitespace-nowrap">{item.department}</td>
        <td className="px-3 py-2.5 text-xs font-bold text-indigo-600 whitespace-nowrap">{item.groupHead}</td>
        <td className="px-3 py-2.5 text-xs font-semibold text-slate-500 text-center whitespace-nowrap">{item.uom}</td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'}`}>
            {item.status}
          </span>
        </td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.indented}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.approved}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-rose-500 whitespace-nowrap">{item.purchaseReturn}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.liftingQty}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-amber-600 whitespace-nowrap">{item.inTransit}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-green-600 whitespace-nowrap">{item.issueReturn}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.issued}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-rose-500 whitespace-nowrap">{item.stTo}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-green-600 whitespace-nowrap">{item.stFrom}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.quantity}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    );
  };

  const renderCard = (item, index) => {
    return (
      <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">{item.groupHead}</span>
            <span className="text-xs font-extrabold text-slate-800">{item.item}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
            {item.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Firm Name</span>
            <span className="font-bold text-gray-700 block truncate">{item.firmName}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Department</span>
            <span className="font-bold text-gray-700 block truncate">{item.department}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Closing Stock</span>
            <span className="font-black text-indigo-600">{item.quantity} {item.uom}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Total Valuation</span>
            <span className="font-black text-emerald-600">₹{Number(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-3 flex flex-col h-full min-h-0">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-2 md:px-0">
        
        {/* Metric 1: Total Valuation */}
        <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Coins size={22} />
          </div>
          <div>
            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest block">Active Inventory Valuation</span>
            <span className="text-xl md:text-2xl font-black text-slate-800">
              ₹{aggregates.totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Perpetual closing balance</span>
          </div>
        </div>

        {/* Metric 2: Warning counters */}
        <div className="bg-white p-4 rounded-xl border border-rose-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle size={22} className={aggregates.warnings > 0 ? 'animate-bounce' : ''} />
          </div>
          <div>
            <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest block">Low Stock Alarms</span>
            <span className="text-xl md:text-2xl font-black text-slate-800">{aggregates.warnings}</span>
            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Items below threshold safety</span>
          </div>
        </div>

        {/* Metric 3: Total ledger items */}
        <div className="bg-white p-4 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Blocks size={22} />
          </div>
          <div>
            <span className="text-[9px] text-green-500 font-black uppercase tracking-widest block">Monitored Ledger Items</span>
            <span className="text-xl md:text-2xl font-black text-slate-800">{aggregates.totalItems}</span>
            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">SKUs tracked in real-time</span>
          </div>
        </div>

      </div>

      {/* Header and filters toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        
        {/* Search */}
        <div className="flex flex-col lg:flex-row w-full gap-2 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by SKU Item, Department, Group..."
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

          {/* Dynamic Dropdowns */}
          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto lg:flex-[8] items-center`}>
            
            <div className="flex-1 w-full">
              <select
                value={filters.groupHead}
                onChange={(e) => setFilters({ ...filters, groupHead: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs h-[38px] shadow-sm font-semibold text-gray-700"
              >
                <option value="">All Group Heads</option>
                {groupHeads.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full">
              <select
                value={filters.firmName}
                onChange={(e) => setFilters({ ...filters, firmName: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs h-[38px] shadow-sm font-semibold text-gray-700"
              >
                <option value="">All FIRM Names</option>
                {firmNames.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded w-[38px] h-[38px] hover:bg-gray-100 shadow-sm"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main perpetual inventory table */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          headers={headers}
          data={filteredData}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1900px"
          currentPage={1}
          totalPages={1}
          itemsPerPage={50}
          onPageChange={() => {}}
          onItemsPerPageChange={() => {}}
          totalResults={filteredData.length}
        />
      </div>

    </div>
  );
}
