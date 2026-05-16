import React, { useState, useMemo } from 'react';
import { CheckCircle2, Image as ImageIcon, Calendar, User, FileText } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function StoreInHistory({ data, filters }) {
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
    "Date", "Time", "Lift Number", "Indent No.", "PO Number", "Firm Name", 
    "Vendor Name", "Product Name", "Bill Status", "Bill No.", "Qty", 
    "Lead Time", "Type Of Bill", "Bill Amount", "Discount", "Payment Type", 
    "Advance", "Photo Of Bill", "Trans. Include", "Transporter", "Freight", 
    "Rec. Status", "Rec. Qty", "HOD Status", "HOD Remark", "Product Photo", 
    "Physical Check", "Qty Match?", "Price Match?", "Remark", "Planned Date"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-green-50/30 transition-all">
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-800">{new Date(item.timestamp).toLocaleDateString()}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] font-medium text-gray-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-indigo-600 uppercase">{item.liftNumber || item.id.slice(-6)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 uppercase">{item.indentNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-indigo-700 uppercase">{item.poNumber}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-black text-indigo-600 uppercase">
        <InfoPopover items={[item.firmName || item.projectName]} title="Firm Name">
           <div className="max-w-[150px] truncate">{item.firmName || item.projectName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 uppercase">
        <InfoPopover items={[item.vendorName]} title="Vendor Name">
           <div className="max-w-[150px] truncate">{item.vendorName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 uppercase">
        <InfoPopover items={[item.items?.[0]?.productName]} title="Product Name">
           <div className="max-w-[150px] truncate">{item.items?.[0]?.productName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.billStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.billStatus}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-bold text-gray-700">{item.billNumber || '-'}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap text-[11px] font-black">{item.items?.[0]?.liftQty}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold uppercase">2 Days</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold uppercase">Tax Invoice</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹{parseFloat(item.billAmount || 0).toLocaleString()}</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹0.00</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold uppercase">30 Days Credit</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹0.00</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
         <ImageIcon size={14} className="mx-auto text-gray-300 hover:text-indigo-500 cursor-pointer" />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold uppercase">Yes</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-medium text-gray-600 uppercase">
        <InfoPopover items={[item.transporterName || 'Self']} title="Transporter">
           <div className="max-w-[120px] truncate">{item.transporterName || 'Self'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹1,500.00</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
         <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">Received</span>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap text-[11px] font-black text-green-600">{item.items?.[0]?.recQty}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
         <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase">Pending</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 italic">-</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
         <ImageIcon size={14} className="mx-auto text-gray-300 hover:text-indigo-500 cursor-pointer" />
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap text-[10px] font-black uppercase text-green-600">{item.physicalCheck}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap text-[10px] font-black uppercase text-indigo-600">{item.qtyMatch}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap text-[10px] font-black uppercase text-blue-600">{item.priceMatch}</td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 italic">
        <InfoPopover items={[item.remark || '-']} title="Remark">
           <div className="max-w-[150px] truncate">{item.remark || '-'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center text-[11px] font-medium text-gray-500">22/05/2026</td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.poNumber}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight">{item.vendorName}</h4>
        </div>
        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${item.billStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {item.billStatus}
        </span>
      </div>

      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 uppercase font-black tracking-tight">Firm</span>
            <span className="text-gray-700 font-bold uppercase text-right">{item.firmName || item.projectName}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 uppercase font-black tracking-tight">Product</span>
            <span className="text-gray-700 font-bold uppercase text-right truncate max-w-[150px]">{item.items?.[0]?.productName}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 uppercase font-black tracking-tight">Bill No</span>
            <span className="text-gray-700 font-bold uppercase">{item.billNumber || '-'}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 uppercase font-black tracking-tight">Rec. Qty</span>
            <span className="text-green-600 font-black">{item.items?.[0]?.recQty}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 uppercase font-black tracking-tight">Bill Amount</span>
            <span className="font-black text-gray-900">₹{parseFloat(item.billAmount || 0).toLocaleString()}</span>
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
      minWidth="min-w-[3000px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredData.length}
    />
  );
}
