import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';
import { getStoreInRecords, getRejectGRNRecords } from '../../utils/storageManager';
import RejectPending from './RejectPending';
import RejectHistory from './RejectHistory';
import SearchableDropdown from '../../components/SearchableDropdown';
import { TabSwitcher } from '../../components/StandardButtons';

export default function RejectGRN() {
  const [activeTab, setActiveTab] = useState('pending');
  const [storeInRecords, setStoreInRecords] = useState([]);
  const [grnRecords, setGrnRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '' });

  const refreshData = () => {
    setStoreInRecords(getStoreInRecords());
    setGrnRecords(getRejectGRNRecords());
  };

  useEffect(() => { refreshData(); }, []);

  const handleClearFilters = () => setFilters({ searchQuery: '', fromDate: '', toDate: '' });

  // Filter Store In records for HOD Status = Rejected
  const rejectedStoreIn = useMemo(() => {
    return storeInRecords.filter(r => r.hodStatus === 'Rejected');
  }, [storeInRecords]);

  // Split into Pending and History based on GRN action records
  const pendingItems = useMemo(() => {
    return rejectedStoreIn.filter(item => {
      // If there's no GRN record for this rejected Store In, it's pending
      return !grnRecords.some(g => g.referenceId === item.id);
    });
  }, [rejectedStoreIn, grnRecords]);

  const historyItems = useMemo(() => {
    return grnRecords.map(g => {
      const relatedItem = rejectedStoreIn.find(item => item.id === g.referenceId) || {};
      return {
        ...relatedItem,
        ...g,
        actionDate: g.timestamp
      };
    }).reverse();
  }, [rejectedStoreIn, grnRecords]);

  const filteredPending = useMemo(() => {
    return pendingItems.filter(item => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.firmName?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.billNo?.toLowerCase().includes(q) ||
          item.indentNo?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pendingItems, filters]);

  const filteredHistory = useMemo(() => {
    return historyItems.filter(item => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.firmName?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.billNo?.toLowerCase().includes(q) ||
          item.indentNo?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [historyItems, filters]);

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'pending', label: 'Pending', count: pendingItems.length },
            { id: 'history', label: 'History', count: historyItems.length }
          ]}
        />

        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input type="text" placeholder="Search..." value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending'
          ? <RejectPending data={filteredPending} filters={filters} refresh={refreshData} />
          : <RejectHistory data={filteredHistory} filters={filters} />
        }
      </div>
    </div>
  );
}
