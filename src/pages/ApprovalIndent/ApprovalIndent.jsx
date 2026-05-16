import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, Filter, Calendar, RotateCcw, Save, Loader2
} from 'lucide-react';
import { 
  getIndents, saveIndents
} from '../../utils/storageManager';
import ApprovalPending from './ApprovalPending';
import ApprovalHistory from './ApprovalHistory';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ApprovalIndent() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowEdits, setRowEdits] = useState({}); // { id-itemCount: { status, remarks } }
  const [isSaving, setIsSaving] = useState(false);
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    fromDate: '',
    toDate: '',
    department: '',
    groupHead: ''
  });

  const [indents, setIndents] = useState([]);

  useEffect(() => {
    setIndents(getIndents());
  }, []);

  const refreshData = () => {
    setIndents(getIndents());
    setSelectedIds([]);
    setRowEdits({});
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

  const handleBulkSubmit = () => {
    if (selectedIds.length === 0) return;

    setIsSaving(true);
    try {
      const allIndents = getIndents();
      const updatedIndents = allIndents.map(indent => {
        const updatedItems = indent.items.map(item => {
          const key = `${indent.id}-${item.itemCount}`;
          if (selectedIds.includes(key)) {
            return {
              ...item,
              approvalStatus: rowEdits[key]?.status || 'APPROVED',
              approvalRemarks: rowEdits[key]?.remarks || '',
              itemQty: rowEdits[key]?.qty ? Number(rowEdits[key]?.qty) : item.itemQty,
              approvedAt: new Date().toISOString()
            };
          }
          return item;
        });
        return { ...indent, items: updatedItems };
      });

      saveIndents(updatedIndents);
      toast.success(`Successfully processed ${selectedIds.length} items`);
      refreshData();
    } catch (error) {
      toast.error('Error saving approvals');
    } finally {
      setIsSaving(false);
    }
  };

  // Flatten indents for row-level approval
  const flattenedData = useMemo(() => {
    return indents.flatMap(indent => 
      indent.items.map(item => ({
        ...indent,
        ...item,
        indentId: indent.id // Keep reference to parent indent
      }))
    ).reverse();
  }, [indents]);

  const pendingCount = flattenedData.filter(i => i.approvalStatus === 'PENDING').length;
  const historyCount = flattenedData.filter(i => i.approvalStatus !== 'PENDING').length;

  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-2 md:space-y-6 flex flex-col h-full min-h-0">
      {/* Header Row: Tabs + Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100">
        
        {/* Tabs Row */}
        <div className="flex gap-2 w-full lg:w-auto flex-shrink-0 border-b lg:border-none border-gray-100 pb-2 lg:pb-0 mb-1 lg:mb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-1.5 px-4 transition text-[11px] md:text-sm rounded-md whitespace-nowrap ${activeTab === 'pending'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-4 transition text-[11px] md:text-sm rounded-md whitespace-nowrap ${activeTab === 'history'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            History ({historyCount})
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
            {activeTab === 'pending' && (
              <button
                onClick={handleBulkSubmit}
                disabled={isSaving || selectedIds.length === 0}
                className="lg:hidden flex items-center justify-center bg-indigo-600 text-white rounded-lg h-[32px] px-2 flex-shrink-0 shadow-sm active:scale-95 disabled:opacity-50 text-[10px] font-bold uppercase"
              >
                {isSaving ? '...' : 'Save'}
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"
              title="Clear Filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[8] overflow-visible items-center`}>
            {/* Row 1: Dates */}
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

            {/* Row 2: Master Filters */}
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

            <div className="flex items-center gap-1.5">
              {activeTab === 'pending' && (
                <button
                  onClick={handleBulkSubmit}
                  disabled={isSaving || selectedIds.length === 0}
                  className="hidden lg:flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded lg:rounded w-[38px] h-[38px] transition shadow-sm active:scale-95 disabled:opacity-50"
                  title="Save Approvals"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                </button>
              )}
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending' ? (
          <ApprovalPending 
            data={flattenedData.filter(i => i.approvalStatus === 'PENDING')} 
            filters={filters} 
            refresh={refreshData}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            rowEdits={rowEdits}
            setRowEdits={setRowEdits}
          />
        ) : (
          <ApprovalHistory 
            data={flattenedData.filter(i => i.approvalStatus !== 'PENDING')} 
            filters={filters} 
          />
        )}
      </div>
    </div>
  );
}
