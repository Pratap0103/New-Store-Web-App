import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';
import { getStoreInRecords, getDirectStoreInRecords, getPayments, getPOs } from '../../utils/storageManager';
import PaymentPending from './PaymentPending';
import PaymentHistory from './PaymentHistory';
import SearchableDropdown from '../../components/SearchableDropdown';
import { TabSwitcher } from '../../components/StandardButtons';

export default function MakePayment() {
  const [activeTab, setActiveTab] = useState('pending');
  const [storeInRecords, setStoreInRecords] = useState([]);
  const [directRecords, setDirectRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pos, setPos] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '', firmName: '' });

  const refreshData = () => {
    setStoreInRecords(getStoreInRecords());
    setDirectRecords(getDirectStoreInRecords());
    setPayments(getPayments());
    setPos(getPOs());
  };

  useEffect(() => { refreshData(); }, []);

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', fromDate: '', toDate: '', firmName: '' });

  // Map and unify the data structure for the table
  const unifiedData = useMemo(() => {
    const data = [];

    // Process Store In (HOD Approved)
    const approvedStoreIn = storeInRecords.filter(r => r.hodStatus === 'Approved');
    approvedStoreIn.forEach(r => {
      // Find PO to extract payment terms if possible
      const po = pos.find(p => p.poNumber === r.poNumber);
      const paymentTerm = po?.items?.[0]?.paymentTerm || 'Net 30';
      const totalAmount = r.totalAmount || r.items?.[0]?.amount || 0;

      data.push({
        ...r,
        recordType: 'STORE_IN',
        partyName: r.vendorName || po?.supplierName || 'Unknown Vendor',
        paymentTerms: paymentTerm,
        product: r.items?.[0]?.productName || 'Multiple Products',
        totalAmount: totalAmount,
        plannedDate: r.timestamp.split('T')[0] // Dummy planned date
      });
    });

    // Process Direct Store In
    directRecords.forEach(r => {
      data.push({
        ...r,
        recordType: 'DIRECT_STORE_IN',
        partyName: r.vendorName || 'Unknown Vendor',
        poNumber: 'N/A', // Direct Store In typically doesn't have PO
        indentNo: 'N/A',
        paymentTerms: 'Immediate', // Default for Direct
        product: r.productName || 'Direct Items',
        totalAmount: parseFloat(r.billAmount) || 0,
        plannedDate: r.timestamp.split('T')[0]
      });
    });

    return data.reverse();
  }, [storeInRecords, directRecords, pos]);

  // Split into Pending and History based on payments
  const pendingItems = useMemo(() => {
    return unifiedData.filter(item => {
      const relatedPayments = payments.filter(p => p.referenceId === item.id);
      const totalPaid = relatedPayments.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
      return totalPaid < item.totalAmount;
    }).map(item => {
      const relatedPayments = payments.filter(p => p.referenceId === item.id);
      const totalPaid = relatedPayments.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
      const paymentCount = relatedPayments.length;
      return {
        ...item,
        payAmount: 0, // For form
        pendingPrice: item.totalAmount - totalPaid,
        paymentCount,
        totalPaid
      };
    });
  }, [unifiedData, payments]);

  const historyItems = useMemo(() => {
    return payments.map(p => {
      const relatedItem = unifiedData.find(item => item.id === p.referenceId) || {};
      return {
        ...relatedItem,
        ...p, // Merge payment details (paidAmount, paymentNo, etc.)
        pendingPrice: (relatedItem.totalAmount || 0) - (parseFloat(p.paidAmount) || 0),
        payementStatus: p.paymentStatus,
        paymentDate: p.timestamp
      };
    }).reverse();
  }, [unifiedData, payments]);

  const filteredPending = useMemo(() => {
    return pendingItems.filter(item => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.firmName?.toLowerCase().includes(q) ||
          item.partyName?.toLowerCase().includes(q) ||
          item.poNumber?.toLowerCase().includes(q) ||
          item.product?.toLowerCase().includes(q)
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
          item.partyName?.toLowerCase().includes(q) ||
          item.poNumber?.toLowerCase().includes(q) ||
          item.paymentNo?.toLowerCase().includes(q)
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
          ? <PaymentPending data={filteredPending} filters={filters} refresh={refreshData} />
          : <PaymentHistory data={filteredHistory} filters={filters} />
        }
      </div>
    </div>
  );
}
