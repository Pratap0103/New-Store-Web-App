import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';
import { getLiftingRecords } from '../../utils/storageManager';
import FrightPending from './FrightPending';
import FrightHistory from './FrightHistory';
import SearchableDropdown from '../../components/SearchableDropdown';
import { TabSwitcher } from '../../components/StandardButtons';

export default function FrightPayment() {
  const [activeTab, setActiveTab] = useState('pending');
  const [liftingRecords, setLiftingRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    searchQuery: '', 
    fromDate: '', 
    toDate: '', 
    department: '', 
    groupHead: '' 
  });

  const refreshData = () => {
    setLiftingRecords(getLiftingRecords());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearFilters = () => {
    setFilters({ searchQuery: '', fromDate: '', toDate: '', department: '', groupHead: '' });
  };

  // Filter records that had transportation = Yes
  const freightRecords = useMemo(() => 
    liftingRecords.filter(item => item.transportation === 'Yes')
  , [liftingRecords]);

  const pendingItems = useMemo(() => 
    freightRecords.filter(item => !item.freightPaymentStatus || item.freightPaymentStatus === 'Pending')
  , [freightRecords]);

  const historyItems = useMemo(() => 
    freightRecords.filter(item => item.freightPaymentStatus === 'Paid')
  , [freightRecords]);

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0 bg-gray-50/30">
      {/* Header & Filters */}
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

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search Indent, Project, Vendor..." 
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>

            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-300 text-gray-600'}`}
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
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    value={idx === 0 ? filters.fromDate : filters.toDate}
                    onChange={(e) => setFilters({ ...filters, [idx === 0 ? 'fromDate' : 'toDate']: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px]"
                  />
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded w-[38px] h-[38px] hover:bg-gray-100 shadow-sm"
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
          <FrightPending 
            data={pendingItems} 
            filters={filters}
            refresh={refreshData}
          />
        ) : (
          <FrightHistory 
            data={historyItems} 
            filters={filters}
          />
        )}
      </div>
    </div>
  );
}
