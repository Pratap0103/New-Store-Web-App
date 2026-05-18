import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';
import { getLiftingRecords, getDebitNotes } from '../../utils/storageManager';
import SendDebitPending from './SendDebitPending';
import SendDebitHistory from './SendDebitHistory';
import SearchableDropdown from '../../components/SearchableDropdown';
import { TabSwitcher } from '../../components/StandardButtons';

export default function SendDebit() {
  const [activeTab, setActiveTab] = useState('pending');
  const [liftingRecords, setLiftingRecords] = useState([]);
  const [debitNotes, setDebitNotes] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    fromDate: '',
    toDate: '',
    department: '',
    groupHead: ''
  });

  const refreshData = () => {
    setLiftingRecords(getLiftingRecords() || []);
    setDebitNotes(getDebitNotes() || []);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      fromDate: '',
      toDate: '',
      department: '',
      groupHead: ''
    });
  };

  // Determine Pending: Lift records that do NOT have a debit note recorded yet
  const pendingItems = useMemo(() => {
    return liftingRecords.filter(lift => {
      // Check if this lift's ID already has a recorded debit note
      return !debitNotes.some(dn => dn.liftNumber === lift.id);
    });
  }, [liftingRecords, debitNotes]);

  // Determine History: The actual debit notes
  const historyItems = useMemo(() => {
    return [...debitNotes].reverse();
  }, [debitNotes]);

  // Unique Departments and Group Heads for dropdown filters
  const deptOptions = useMemo(() => {
    const depts = liftingRecords
      .map(r => r.department || r.items?.[0]?.department)
      .filter(Boolean);
    return Array.from(new Set(depts))
      .sort()
      .map(d => ({ value: d, label: d }));
  }, [liftingRecords]);

  const ghOptions = useMemo(() => {
    const ghs = liftingRecords
      .map(r => r.groupHead || r.items?.[0]?.groupHead)
      .filter(Boolean);
    return Array.from(new Set(ghs))
      .sort()
      .map(g => ({ value: g, label: g }));
  }, [liftingRecords]);

  // Filtered data for Pending
  const filteredPending = useMemo(() => {
    return pendingItems.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const prodName = item.items?.[0]?.productName || item.productName || '';
        return (
          item.id?.toLowerCase().includes(q) ||
          item.indentNo?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.billNumber?.toLowerCase().includes(q) ||
          prodName.toLowerCase().includes(q)
        );
      }
      const dept = item.department || item.items?.[0]?.department;
      if (filters.department && dept !== filters.department) return false;

      const gh = item.groupHead || item.items?.[0]?.groupHead;
      if (filters.groupHead && gh !== filters.groupHead) return false;

      return true;
    });
  }, [pendingItems, filters]);

  // Filtered data for History
  const filteredHistory = useMemo(() => {
    return historyItems.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.liftNumber?.toLowerCase().includes(q) ||
          item.indentNo?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.debitNoteNo?.toLowerCase().includes(q) ||
          item.productName?.toLowerCase().includes(q)
        );
      }
      const dept = item.department || item.items?.[0]?.department;
      if (filters.department && dept !== filters.department) return false;

      const gh = item.groupHead || item.items?.[0]?.groupHead;
      if (filters.groupHead && gh !== filters.groupHead) return false;

      return true;
    });
  }, [historyItems, filters]);

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0 text-left">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        
        {/* Standardized Tabs */}
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'pending', label: 'Pending', count: pendingItems.length },
            { id: 'history', label: 'History', count: historyItems.length }
          ]}
        />

        {/* Filters Panel */}
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px] text-gray-800"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${
                showMobileFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-300 text-gray-600'
              }`}
            >
              <Filter size={14} />
            </button>
            <button
              onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[8] items-center`}>
            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
              {['From Date', 'To Date'].map((ph, idx) => (
                <div key={ph} className="flex-1 min-w-0 lg:min-w-[140px] relative">
                  <Calendar className="absolute left-2.5 top-[9px] lg:top-[12px] text-gray-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder={ph}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    value={idx === 0 ? filters.fromDate : filters.toDate}
                    onChange={(e) =>
                      setFilters({ ...filters, [idx === 0 ? 'fromDate' : 'toDate']: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px] text-gray-800"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
              <div className="flex-1 min-w-0 lg:min-w-[120px]">
                <SearchableDropdown
                  options={deptOptions}
                  value={filters.department}
                  onChange={(val) => setFilters({ ...filters, department: val })}
                  placeholder="All Dept"
                  className="h-[32px] md:h-[38px]"
                />
              </div>
              <div className="flex-1 min-w-0 lg:min-w-[110px]">
                <SearchableDropdown
                  options={ghOptions}
                  value={filters.groupHead}
                  onChange={(val) => setFilters({ ...filters, groupHead: val })}
                  placeholder="All GH"
                  className="h-[32px] md:h-[38px]"
                />
              </div>
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

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending' ? (
          <SendDebitPending data={filteredPending} filters={filters} refresh={refreshData} />
        ) : (
          <SendDebitHistory data={filteredHistory} filters={filters} />
        )}
      </div>
    </div>
  );
}
