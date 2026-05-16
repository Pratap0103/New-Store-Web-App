import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Clock, CheckCircle2, Search, Filter, Calendar, RotateCcw, PlusCircle, History as HistoryIcon
} from 'lucide-react';
import { 
  getLiftingRecords, getStoreInRecords, saveStoreInRecord, getDirectStoreInRecords, saveDirectStoreInRecord,
  getDepartments, getGroupHeads
} from '../../utils/storageManager';
import StoreInPending from './StoreInPending';
import StoreInHistory from './StoreInHistory';
import DirectStoreInHistory from './DirectStoreInHistory';
import StoreInForm from './StoreInForm';
import DirectStoreIn from './DirectStoreIn';
import SearchableDropdown from '../../components/SearchableDropdown';
import { TabSwitcher } from '../../components/StandardButtons';
import { toast } from 'sonner';

export default function StoreIn() {
  const [activeTab, setActiveTab] = useState('pending');
  const [liftingRecords, setLiftingRecords] = useState([]);
  const [storeInRecords, setStoreInRecords] = useState([]);
  const [directRecords, setDirectRecords] = useState([]);
  
  const [selectedLift, setSelectedLift] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDirectOpen, setIsDirectOpen] = useState(false);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    searchQuery: '', fromDate: '', toDate: '', department: '', groupHead: '' 
  });

  const refreshData = () => {
    setLiftingRecords(getLiftingRecords());
    setStoreInRecords(getStoreInRecords());
    setDirectRecords(getDirectStoreInRecords());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearFilters = () => {
    setFilters({ searchQuery: '', fromDate: '', toDate: '', department: '', groupHead: '' });
  };

  const handleStoreInAction = (lift) => {
    setSelectedLift(lift);
    setIsFormOpen(true);
  };

  const handleSaveStoreIn = (data) => {
    saveStoreInRecord(data);
    setIsFormOpen(false);
    setSelectedLift(null);
    refreshData();
    toast.success("Store In entry saved successfully");
  };

  const handleSaveDirect = (data) => {
    saveDirectStoreInRecord(data);
    setIsDirectOpen(false);
    refreshData();
    toast.success("Direct Material Entry saved");
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0 bg-gray-50/30">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        
        {/* Standardized Tabs */}
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'pending', label: 'Pending', icon: Clock, count: liftingRecords.length },
            { id: 'history', label: 'History', icon: CheckCircle2, count: storeInRecords.length },
            { id: 'direct-history', label: 'Direct History', icon: HistoryIcon, count: directRecords.length }
          ]}
        />

        {/* Filter Bar - Standardized */}
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search Indent, PO, Vendor..." 
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>

            {/* Direct Entry Icon - Mobile Position */}
            <button 
              onClick={() => setIsDirectOpen(true)}
              className="lg:hidden flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 active:scale-95 transition-all"
            >
              <PlusCircle size={16} />
            </button>

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
            <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
              <div className="flex-1 min-w-0 lg:min-w-[120px]">
                <SearchableDropdown 
                  options={getDepartments().map(d => ({ value: d.name, label: d.name }))} 
                  value={filters.department}
                  onChange={(val) => setFilters({ ...filters, department: val })}
                  placeholder="All Dept" 
                  className="h-[32px] md:h-[38px]" 
                />
              </div>
              <div className="flex-1 min-w-0 lg:min-w-[110px]">
                <SearchableDropdown 
                  options={getGroupHeads().map(gh => ({ value: gh.name, label: gh.name }))} 
                  value={filters.groupHead}
                  onChange={(val) => setFilters({ ...filters, groupHead: val })}
                  placeholder="All GH" 
                  className="h-[32px] md:h-[38px]" 
                />
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
                {/* Direct Entry Icon - Desktop Position */}
                <button 
                  onClick={() => setIsDirectOpen(true)}
                  className="flex items-center justify-center bg-indigo-600 text-white rounded shadow-sm h-[38px] w-[38px] flex-shrink-0 active:scale-95 transition-all hover:bg-indigo-700"
                  title="Direct Material Entry"
                >
                  <PlusCircle size={18} />
                </button>

                <button 
                  onClick={handleClearFilters}
                  className="flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded w-[38px] h-[38px] hover:bg-gray-100 shadow-sm"
                  title="Clear Filters"
                >
                  <RotateCcw size={16} />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending' && (
          <StoreInPending 
            data={liftingRecords} 
            onAction={handleStoreInAction}
            filters={filters}
          />
        )}
        {activeTab === 'history' && (
          <StoreInHistory 
            data={storeInRecords} 
            filters={filters}
          />
        )}
        {activeTab === 'direct-history' && (
          <DirectStoreInHistory 
            data={directRecords} 
            filters={filters}
          />
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <StoreInForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={selectedLift}
          onSave={handleSaveStoreIn}
        />
      )}

      {isDirectOpen && (
        <DirectStoreIn 
          isOpen={isDirectOpen}
          onClose={() => setIsDirectOpen(false)}
          onSave={handleSaveDirect}
        />
      )}
    </div>
  );
}
