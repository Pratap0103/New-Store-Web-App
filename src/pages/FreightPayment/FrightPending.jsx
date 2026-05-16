import React, { useState, useMemo } from 'react';
import { CreditCard, Eye, Clock } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';
import FrightForm from './FrightForm';

export default function FrightPending({ data, filters, refresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [payingItem, setPayingItem] = useState(null);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.indentNo?.toLowerCase().includes(q) ||
          item.projectName?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.items?.[0]?.productName?.toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const headers = [
    "Action", "Timestamp", "Indent Number", "Firm Name", "Vendor Name", 
    "Product Name", "Qty", "Bill No.", "Planned Date", 
    "Transportation Include", "Transporter Name", "Amount"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-indigo-50/30 transition-all text-center">
      <td className="px-4 py-3 whitespace-nowrap">
        <button 
          onClick={() => setPayingItem(item)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-wider mx-auto"
        >
          <CreditCard size={12} />
          <span>Pay Freight</span>
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-medium text-gray-500">
        {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase">{item.indentNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-indigo-600 uppercase">
        <InfoPopover items={[item.firmName || item.projectName]} title="Firm Name">
           <div className="max-w-[150px] truncate">{item.firmName || item.projectName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase">
        <InfoPopover items={[item.vendorName]} title="Vendor Name">
           <div className="max-w-[150px] truncate">{item.vendorName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase">
        <InfoPopover items={[item.items?.[0]?.productName]} title="Product Name">
           <div className="max-w-[150px] truncate">{item.items?.[0]?.productName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-indigo-600">{item.items?.[0]?.liftQty}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700">{item.billNumber || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-500">22/05/2026</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-green-600 font-black uppercase">{item.transportation}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-600 uppercase">
        <InfoPopover items={[item.transporterName]} title="Transporter">
           <div className="max-w-[120px] truncate">{item.transporterName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-indigo-700">₹{parseFloat(item.frightAmount || 0).toLocaleString()}</td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.indentNo}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight">{item.projectName}</h4>
        </div>
        <button 
          onClick={() => setPayingItem(item)}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
        >
          Pay
        </button>
      </div>
      <div className="space-y-2 pt-2 border-t border-gray-100 text-[10px]">
        <div className="flex justify-between">
            <span className="text-gray-400 font-bold uppercase">Transporter</span>
            <span className="font-bold text-gray-700">{item.transporterName}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-400 font-bold uppercase">Amount</span>
            <span className="font-black text-indigo-700">₹{parseFloat(item.frightAmount || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <DataTable 
        headers={headers}
        data={paginatedData}
        renderRow={renderRow}
        renderCard={renderCard}
        minWidth="min-w-[1600px]"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={filteredData.length}
      />
      {payingItem && (
        <FrightForm 
          item={payingItem} 
          onClose={() => setPayingItem(null)} 
          onSuccess={() => { setPayingItem(null); refresh(); }} 
        />
      )}
    </div>
  );
}
