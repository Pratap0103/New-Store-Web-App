import React, { useState } from 'react';
import { Edit3, Image as ImageIcon } from 'lucide-react';
import DataTable from '../../components/DataTable';
import RejectGRNForm from './RejectGRNForm';

export default function RejectPending({ data, filters, refresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [editingItem, setEditingItem] = useState(null);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const tableHeaders = [
    'Action', 'Timestamp', 'Lift Number', 'Indent No.', 'Bill No.', 
    'Vendor Name', 'FIRM Name', 'Product Name', 'Qty', 'Type Of Bill', 
    'Bill Amount', 'Payment Type', 'Advance Amount If Any', 'Photo Of Bill', 
    'Transportation Include', 'Transporter Name', 'Amount', 'Physical Good ?', 
    'Qty Match?', 'Price Match?', 'Remark', 'Planned Date'
  ];

  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-2.5 text-center">
        <button
          onClick={() => setEditingItem(item)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm font-semibold text-[11px] whitespace-nowrap mx-auto"
          title="Take Action"
        >
          <Edit3 size={13} /> Take Action
        </button>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.timestamp?.split('T')[0] || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-medium whitespace-nowrap">{item.id || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.indentNo || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-800 font-medium whitespace-nowrap">{item.billNumber || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.vendorName || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.items?.[0]?.productName || '-'}</td>
      <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.items?.[0]?.liftQty || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">-</td>
      <td className="px-4 py-2.5 text-center text-xs text-gray-900 font-bold whitespace-nowrap">₹{Number(item.billAmount || 0).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">-</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">-</td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        <div className="flex justify-center text-gray-400">
           <ImageIcon size={14} />
        </div>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.transportation || 'No'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.transporterName || '-'}</td>
      <td className="px-4 py-2.5 text-center text-xs text-gray-900 font-bold whitespace-nowrap">₹{Number(item.totalAmount || 0).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-700 whitespace-nowrap">{item.physicalCheck || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-700 whitespace-nowrap">{item.qtyMatch || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-700 whitespace-nowrap">{item.priceMatch || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-red-600 font-semibold whitespace-nowrap">{item.hodRemark || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">-</td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-gray-900 break-words">{item.vendorName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-indigo-600 font-black uppercase">{item.id}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-tight bg-red-100 text-red-700">
          REJECTED BY HOD
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-[11px] py-3 border-t border-b border-gray-50">
        <div className="col-span-2"><span className="text-gray-400 block text-[9px] uppercase font-bold">Product</span><span className="font-semibold text-gray-800">{item.items?.[0]?.productName || '-'}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Amount</span><span className="text-gray-900 font-bold">₹{Number(item.billAmount || 0).toFixed(2)}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">HOD Remark</span><span className="text-red-600 font-medium truncate">{item.hodRemark || '-'}</span></div>
      </div>

      <div className="pt-1">
        <button
          onClick={() => setEditingItem(item)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-[11px] font-bold shadow-md active:scale-95 transition-all uppercase tracking-wider"
        >
          <Edit3 size={14} /> Take Action
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <DataTable
        headers={tableHeaders}
        data={paginatedData}
        renderRow={renderRow}
        renderCard={renderCard}
        minWidth="2200px"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={data.length}
      />

      {editingItem && (
        <RejectGRNForm 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSuccess={() => { setEditingItem(null); refresh(); }}
        />
      )}
    </div>
  );
}
