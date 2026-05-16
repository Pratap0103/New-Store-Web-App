import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, Filter, Calendar, RotateCcw, Save, Loader2, FileText
} from 'lucide-react';
import { 
  getIndents, saveIndents
} from '../../utils/storageManager';
import VendorRatePending from './VendorRatePending';
import VendorRateHistory from './VendorRateHistory';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function VendorRate() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [indents, setIndents] = useState([]);
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    fromDate: '',
    toDate: '',
    department: '',
    groupHead: ''
  });

  useEffect(() => {
    setIndents(getIndents());
  }, []);

  const refreshData = () => {
    setIndents(getIndents());
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      fromDate: '',
      toDate: '',
      department: '',
      groupHead: ''
    });
    toast.success('Filters cleared');
  };

  // Flatten indents for row-level rate update
  const flattenedData = useMemo(() => {
    return indents.flatMap(indent => 
      indent.items.map(item => ({
        ...indent,
        ...item,
        indentId: indent.id 
      }))
    ).reverse();
  }, [indents]);

  // Pending: only 'APPROVED' status items that don't have rateInfo yet
  const pendingItems = flattenedData.filter(i => 
    i.approvalStatus === 'APPROVED' && !i.vendorRateInfo
  );

  // History: items that have vendorRateInfo
  const historyItems = flattenedData.filter(i => i.vendorRateInfo);

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      {/* Header Row: Tabs + Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        
        {/* Tabs Row */}
        <div className="flex gap-2 w-full lg:w-auto flex-shrink-0 border-b lg:border-none border-gray-100 pb-2 lg:pb-0 mb-1 lg:mb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-1.5 px-4 transition text-[11px] md:text-sm rounded-md whitespace-nowrap ${activeTab === 'pending'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Pending ({pendingItems.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-4 transition text-[11px] md:text-sm rounded-md whitespace-nowrap ${activeTab === 'history'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            History ({historyItems.length})
          </button>
        </div>

        {/* Filters and Search Container */}
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
            <button
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={14} />
            </button>
            <button
              onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"
              title="Clear Filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[8] overflow-visible items-center`}>
            {/* Dates */}
            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
              <div className="flex-1 min-w-0 lg:min-w-[140px] relative">
                <Calendar className="absolute left-2.5 top-[9px] lg:top-[12px] text-gray-400 pointer-events-none" size={14} />
                <input
                  type="text"
                  placeholder="From Date"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px]"
                />
              </div>
              <div className="flex-1 min-w-0 lg:min-w-[140px] relative">
                <Calendar className="absolute left-2.5 top-[9px] lg:top-[12px] text-gray-400 pointer-events-none" size={14} />
                <input
                  type="text"
                  placeholder="To Date"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px]"
                />
              </div>
            </div>

            {/* Master Filters */}
            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
               <div className="flex-1 min-w-0 lg:min-w-[120px]">
                  <SearchableDropdown
                    options={Array.from(new Set(flattenedData.map(i => i.department)))
                      .filter(Boolean)
                      .sort()
                      .map(d => ({ value: d, label: d }))}
                    value={filters.department}
                    onChange={(val) => setFilters({ ...filters, department: val })}
                    placeholder="All Dept"
                    className="h-[32px] md:h-[38px]"
                  />
                </div>
                <div className="flex-1 min-w-0 lg:min-w-[110px]">
                  <SearchableDropdown
                    options={Array.from(new Set(flattenedData.map(i => i.groupHead)))
                      .filter(Boolean)
                      .sort()
                      .map(g => ({ value: g, label: g }))}
                    value={filters.groupHead}
                    onChange={(val) => setFilters({ ...filters, groupHead: val })}
                    placeholder="All GH"
                    className="h-[32px] md:h-[38px]"
                  />
                </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded lg:rounded w-[38px] h-[38px] hover:bg-gray-100 transition-colors shadow-sm"
              title="Clear Filters"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending' ? (
          <VendorRatePending 
            data={pendingItems} 
            filters={filters} 
            refresh={refreshData}
          />
        ) : (
          <VendorRateHistory 
            data={historyItems} 
            filters={filters} 
          />
        )}
      </div>
    </div>
  );
}
