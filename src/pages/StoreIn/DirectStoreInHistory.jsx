import React, { useState, useMemo } from 'react';
import { Package, Truck, Receipt, Image as ImageIcon, Calendar, User, History as HistoryIcon } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function DirectStoreInHistory({ data, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Date filtering
      if (filters.fromDate || filters.toDate) {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.productName.toLowerCase().includes(q) ||
          item.vendorName.toLowerCase().includes(q) ||
          item.receiverName.toLowerCase().includes(q)
        );
      }
      // Dropdown filtering
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
      
      return true;
    }).reverse();
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const headers = [
    "Date", "Time", "Indent No", "Firm Name", "Receiver", "Vendor", "Product", 
    "Bill Status", "Bill No", "Bill Amount", "Qty", "Transporter", 
    "Freight", "Vehicle No"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-blue-50/30 transition-all">
      <td className="px-4 py-3 text-[11px] font-bold text-gray-800 whitespace-nowrap text-center">{new Date(item.timestamp).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-[10px] font-medium text-gray-400 whitespace-nowrap text-center">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      <td className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase whitespace-nowrap text-center">DIR-{item.id.slice(-4)}</td>
      <td className="px-4 py-3 text-[11px] font-black text-indigo-600 uppercase whitespace-nowrap text-center">
        <InfoPopover items={[item.firmName || 'Botivate Services']} title="Firm Name">
           <div className="max-w-[150px] truncate">{item.firmName || 'Botivate Services'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 text-[11px] font-black text-gray-800 uppercase whitespace-nowrap text-center">
        <InfoPopover items={[item.receiverName]} title="Receiver Name">
           <div className="max-w-[150px] truncate">{item.receiverName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase whitespace-nowrap text-center">
        <InfoPopover items={[item.vendorName]} title="Vendor Name">
           <div className="max-w-[150px] truncate">{item.vendorName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 text-[11px] font-black text-indigo-600 uppercase whitespace-nowrap text-center">
        <InfoPopover items={[item.productName]} title="Product Name">
           <div className="max-w-[200px] truncate">{item.productName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
         <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">{item.billStatus || 'Received'}</span>
      </td>
      <td className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase whitespace-nowrap text-center">{item.billNo || item.challanNo || '-'}</td>
      <td className="px-4 py-3 text-[11px] font-black text-gray-800 text-right whitespace-nowrap">₹{parseFloat(item.billAmount || 0).toLocaleString()}</td>
      <td className="px-4 py-3 text-[11px] font-black text-indigo-700 text-center whitespace-nowrap">{item.receivingQty}</td>
      <td className="px-4 py-3 text-[11px] font-medium text-gray-600 uppercase whitespace-nowrap text-center">
        <InfoPopover items={[item.transporterName || 'Self']} title="Transporter">
           <div className="max-w-[120px] truncate">{item.transporterName || 'Self'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 text-[11px] font-black text-gray-800 text-right whitespace-nowrap">₹{parseFloat(item.freightAmount || 0).toLocaleString()}</td>
      <td className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase whitespace-nowrap text-center">{item.vehicleNo || '-'}</td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">DIR-{item.id.slice(-4)}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase">{item.productName}</h4>
        </div>
        <HistoryIcon size={16} className="text-blue-200" />
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-50">
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-400 uppercase font-black">Vendor</span>
            <span className="text-[10px] text-gray-700 font-bold uppercase">{item.vendorName}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-400 uppercase font-black">Receiver</span>
            <span className="text-[10px] text-gray-800 font-black uppercase">{item.receiverName}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-400 uppercase font-black">Quantity</span>
            <span className="text-xs font-black text-indigo-600">{item.receivingQty}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-400 uppercase font-black">Amount</span>
            <span className="text-xs font-black text-gray-900">₹{parseFloat(item.billAmount || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-400 uppercase font-black">Date</span>
            <span className="text-[10px] text-gray-500 font-medium">{new Date(item.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <DataTable 
      headers={headers}
      data={paginatedData}
      renderRow={renderRow}
      renderCard={renderCard}
      minWidth="min-w-[1400px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredData.length}
    />
  );
}
