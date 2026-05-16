import React, { useState, useMemo } from 'react';
import { Edit3, Eye, Image as ImageIcon } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';
import HODCheckForm from './HODCheckForm';

export default function HODCheckPending({ data, filters, refresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [editingItem, setEditingItem] = useState(null);

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
          item.poNumber?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.indentNo?.toLowerCase().includes(q) ||
          item.items?.[0]?.productName?.toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const headers = [
    "Action", "Lift Number", "Indent No.", "PO Number", "Firm Name", "Vendor Name", 
    "Product Name", "Bill Status", "Bill No.", "Qty", "Lead Time To Lift", 
    "Type Of Bill", "Bill Amount", "Discount", "Payment Type", "Advance", 
    "Photo Of Bill", "Trans. Include", "Transporter", "Freight Amount", 
    "Rec. Status", "Rec. Qty", "HOD Status", "HOD Remark", "Product Photo", 
    "Physical Check", "Qty Match?", "Price Match?", "Remark", "Planned Date"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-indigo-50/30 transition-all text-center">
      <td className="px-4 py-3 whitespace-nowrap">
        <button 
          onClick={() => setEditingItem(item)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-wider mx-auto"
        >
          <Edit3 size={12} />
          <span>Check</span>
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-indigo-600 uppercase">{item.liftNumber || item.id?.slice(-6)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase">{item.indentNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-indigo-700 uppercase">{item.poNumber}</td>
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
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.billStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.billStatus}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700">{item.billNumber || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black">{item.items?.[0]?.liftQty}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-400 font-bold uppercase">2 Days</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-400 font-bold uppercase">Tax Invoice</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹{parseFloat(item.billAmount || 0).toLocaleString()}</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹0.00</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-400 font-bold uppercase">30 Days Credit</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹0.00</td>
      <td className="px-4 py-3 whitespace-nowrap">
         <ImageIcon size={14} className="mx-auto text-gray-300 hover:text-indigo-500 cursor-pointer" />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-400 font-bold uppercase">Yes</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-600 uppercase">
        <InfoPopover items={[item.transporterName || 'Self']} title="Transporter">
           <div className="max-w-[120px] truncate">{item.transporterName || 'Self'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-gray-800">₹1,500.00</td>
      <td className="px-4 py-3 whitespace-nowrap">
         <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">Received</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-green-600">{item.items?.[0]?.recQty}</td>
      <td className="px-4 py-3 whitespace-nowrap">
         <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.hodStatus === 'Approved' ? 'bg-green-100 text-green-700' : (item.hodStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}`}>
           {item.hodStatus || 'Pending'}
         </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-400 italic">
        <InfoPopover items={[item.hodRemark || '-']} title="HOD Remark">
           <div className="max-w-[150px] truncate">{item.hodRemark || '-'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
         <ImageIcon size={14} className="mx-auto text-gray-300 hover:text-indigo-500 cursor-pointer" />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-black uppercase text-green-600">{item.physicalCheck || 'Pass'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-black uppercase text-indigo-600">{item.qtyMatch || 'Yes'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-black uppercase text-blue-600">{item.priceMatch || 'Yes'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-400 italic">
        <InfoPopover items={[item.remark || '-']} title="Remark">
           <div className="max-w-[150px] truncate">{item.remark || '-'}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-500">22/05/2026</td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.poNumber}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight">{item.vendorName}</h4>
        </div>
        <button 
          onClick={() => setEditingItem(item)}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
        >
          Check
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[10px]">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase font-bold">Indent No</span>
          <span className="font-bold text-gray-700">{item.indentNo}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 uppercase font-bold">Product</span>
          <span className="font-bold text-gray-700 truncate">{item.items?.[0]?.productName}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase font-bold">Qty</span>
          <span className="font-black text-indigo-600">{item.items?.[0]?.liftQty}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 uppercase font-bold">Amount</span>
          <span className="font-black text-gray-900">₹{parseFloat(item.billAmount || 0).toLocaleString()}</span>
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
        minWidth="min-w-[3200px]"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={filteredData.length}
      />
      {editingItem && (
        <HODCheckForm 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSuccess={() => { setEditingItem(null); refresh(); }} 
        />
      )}
    </div>
  );
}
