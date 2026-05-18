import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw, FileText } from 'lucide-react';
import { getBillNotReceived, updateBillNotReceived } from '../../utils/storageManager';
import BillnotreceviedPending from './BillnotreceviedPending';
import BillnotreceviedHistory from './BillnotreceviedHistory';
import Billnotreceviedform from './Billnotreceviedform';
import ModalView from '../../components/ModalView';
import { TabSwitcher } from '../../components/StandardButtons';
import toast from 'react-hot-toast';

export default function BillnotRecevied() {
  const [activeTab, setActiveTab] = useState('pending');
  const [records, setRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Dialog controls
  const [processingItem, setProcessingItem] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '' });

  useEffect(() => {
    setRecords(getBillNotReceived());
  }, []);

  const refreshData = () => {
    setRecords(getBillNotReceived());
  };

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', fromDate: '', toDate: '' });

  // Filter records
  const pendingData = useMemo(() => {
    return records.filter(item => {
      // Pending: billStatus !== 'Received'
      if (item.billStatus === 'Received') return false;

      // Date filtering (by planned date)
      if (filters.fromDate || filters.toDate) {
        const itemDate = item.plannedDate || '';
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }

      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.id || '').toLowerCase().includes(q) ||
          (item.indentNumber || '').toLowerCase().includes(q) ||
          (item.poNumber || '').toLowerCase().includes(q) ||
          (item.vendorName || '').toLowerCase().includes(q) ||
          (item.projectName || '').toLowerCase().includes(q) ||
          (item.productName || '').toLowerCase().includes(q) ||
          (item.challanNo || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [records, filters]);

  const historyData = useMemo(() => {
    return records.filter(item => {
      // History: billStatus === 'Received'
      if (item.billStatus !== 'Received') return false;

      // Date filtering (by received date or planned date)
      if (filters.fromDate || filters.toDate) {
        const itemDate = item.receivedDate ? item.receivedDate.substring(0, 10) : (item.plannedDate || '');
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }

      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.id || '').toLowerCase().includes(q) ||
          (item.indentNumber || '').toLowerCase().includes(q) ||
          (item.poNumber || '').toLowerCase().includes(q) ||
          (item.vendorName || '').toLowerCase().includes(q) ||
          (item.projectName || '').toLowerCase().includes(q) ||
          (item.productName || '').toLowerCase().includes(q) ||
          (item.billNo || '').toLowerCase().includes(q) ||
          (item.challanNo || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [records, filters]);

  const handleSaveBill = (updatedFields) => {
    if (!processingItem) return;
    try {
      updateBillNotReceived(processingItem.id, updatedFields);
      toast.success(`Bill logged successfully for Lift No: ${processingItem.id}`);
      setProcessingItem(null);
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to log bill. Please try again.');
    }
  };

  const handleOpenImageView = (url, title) => {
    setViewingImage({ url, title });
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      {/* Header Tabs switcher and Filter controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'pending', label: 'Pending Bills', count: pendingData.length },
            { id: 'history', label: 'Received Bills History', count: historyData.length }
          ]}
        />

        {/* Search and Filters toolbar */}
        <div className="flex flex-col lg:flex-row w-full gap-2 items-center flex-1">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by Lift No, Indent, PO, Vendor..."
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

      {/* Main Grid View */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'pending' ? (
          <BillnotreceviedPending
            data={pendingData}
            onProcess={setProcessingItem}
            onViewImage={handleOpenImageView}
          />
        ) : (
          <BillnotreceviedHistory
            data={historyData}
            onViewImage={handleOpenImageView}
          />
        )}
      </div>

      {/* Process Dialog Modal */}
      {processingItem && (
        <Billnotreceviedform
          record={processingItem}
          isOpen={true}
          onClose={() => setProcessingItem(null)}
          onSave={handleSaveBill}
        />
      )}

      {/* Fullscreen Document Viewer drawer */}
      {viewingImage && (
        <ModalView
          isOpen={true}
          onClose={() => setViewingImage(null)}
          title={viewingImage.title}
          maxWidth="max-w-xl"
        >
          <div className="p-2 space-y-2 flex flex-col items-center">
            <div className="w-full relative border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <img
                src={viewingImage.url}
                alt={viewingImage.title}
                className="w-full max-h-[420px] object-contain mx-auto"
              />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Verified Document Log</span>
          </div>
        </ModalView>
      )}
    </div>
  );
}
