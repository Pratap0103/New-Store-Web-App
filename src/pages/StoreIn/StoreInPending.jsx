import React, { useState, useMemo } from 'react';
import { Package, Truck, Receipt, Image as ImageIcon, Play, Calendar, User } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function StoreInPending({ data, onAction, filters }) {
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
          item.poNumber.toLowerCase().includes(q) ||
          item.vendorName.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.indentNo.toLowerCase().includes(q)
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
    "Action", "Date", "Time", "Indent No.", "Firm Name", "Vendor Name", 
    "PO Number", "Bill Status", "Bill No.", "Lifting Qty", "Pending Qty", "Transporter", "Vehicle No"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-indigo-50/30 transition-all group">
      <td className="px-4 py-3 text-center">
        <button 
          onClick={() => onAction(item)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-sm active:scale-95 transition-all whitespace-nowrap"
        >
          Store In
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-800">
        {new Date(item.timestamp).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 font-medium">
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 uppercase">{item.indentNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-indigo-600 uppercase tracking-tight">
        <InfoPopover items={[item.firmName || item.projectName]} title="Firm Name">
           <div className="max-w-[150px] truncate">{item.firmName || item.projectName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 uppercase">
        <InfoPopover items={[item.vendorName]} title="Vendor Name">
           <div className="max-w-[150px] truncate">{item.vendorName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-indigo-700 uppercase">{item.poNumber}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.billStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {item.billStatus}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-800">
        {item.billNumber || item.challanNumber || '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-gray-800">
        {item.items?.reduce((sum, i) => sum + (i.liftQty || 0), 0)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-amber-600">
        {item.items?.reduce((sum, i) => sum + (i.pendingQty || 0), 0)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700">
        <InfoPopover items={[item.transporterName || 'Self']} title="Transporter">
           <div className="max-w-[120px] truncate">{item.transporterName || 'Self'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[9px] text-gray-400 font-black uppercase tracking-widest">
        {item.vehicleNo || 'No Vehicle'}
      </td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.poNumber}</span>
          <h4 className="text-sm font-black text-gray-800 uppercase leading-tight">{item.vendorName}</h4>
        </div>
        <button 
          onClick={() => onAction(item)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap"
        >
          Store In
        </button>
      </div>
      
      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Firm</span>
          <span className="text-gray-700 font-bold uppercase text-right">{item.firmName || item.projectName}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Indent No</span>
          <span className="text-gray-700 font-bold uppercase text-right">{item.indentNo}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Bill Status</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.billStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {item.billStatus}
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Lifting Qty</span>
          <span className="font-black text-gray-900">{item.items?.reduce((sum, i) => sum + (i.liftQty || 0), 0)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Pending Qty</span>
          <span className="font-black text-amber-600">{item.items?.reduce((sum, i) => sum + (i.pendingQty || 0), 0)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Transporter</span>
          <span className="font-bold text-gray-700 uppercase">{item.transporterName || 'Self'}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Vehicle No</span>
          <span className="font-bold text-gray-700 uppercase tracking-tighter">{item.vehicleNo || 'No Vehicle'}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400 uppercase font-black tracking-tight">Date & Time</span>
          <div className="flex gap-2">
            <span className="text-indigo-600 font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
            <span className="text-gray-400 font-medium">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
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
      minWidth="min-w-[1200px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredData.length}
    />
  );
}
