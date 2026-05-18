import React, { useState } from 'react';
import { Edit3, Image as ImageIcon } from 'lucide-react';
import DataTable from '../../components/DataTable';
import SendDebitForm from './SendDebitForm';

export default function SendDebitPending({ data, filters, refresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [editingItem, setEditingItem] = useState(null);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const tableHeaders = [
    'Action', 'Timestamp', 'Lift Number', 'Indent No.', 'FIRM Name', 
    'Bill No.', 'Vendor Name', 'Product Name', 'Qty', 'Type Of Bill', 
    'Bill Amount', 'Payment Type', 'Advance Amount If Any', 'Photo Of Bill', 
    'Transportation Include', 'Transporter Name', 'Amount', 'Reason', 'Planned Date'
  ];

  const renderRow = (item, idx) => {
    const timestampStr = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('en-GB')
      : '-';

    return (
      <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <button
            onClick={() => setEditingItem(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-bold text-[11px] whitespace-nowrap mx-auto uppercase tracking-wider"
            title="Send Debit Note"
          >
            <Edit3 size={13} /> Send
          </button>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">{timestampStr}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-bold whitespace-nowrap">{item.id || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 font-semibold whitespace-nowrap uppercase">{item.indentNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap uppercase">{item.firmName || item.projectName || 'Botivate'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 font-medium whitespace-nowrap">{item.billNumber || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap uppercase">{item.vendorName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-800 font-semibold whitespace-nowrap uppercase max-w-[180px] truncate" title={item.items?.[0]?.productName || item.productName}>
          {item.items?.[0]?.productName || item.productName || '-'}
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.items?.[0]?.liftQty || item.qty || 0}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">{item.typeOfBill || 'Tax Invoice'}</td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-900 font-black whitespace-nowrap">
          ₹{parseFloat(item.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">{item.paymentType || '30 Days Credit'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">{item.advanceAmount || '₹0.00'}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <div className="flex justify-center text-gray-300 hover:text-indigo-600 cursor-pointer">
            <ImageIcon size={14} />
          </div>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.transportation || 'Yes'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap uppercase truncate max-w-[120px]" title={item.transporterName}>
          {item.transporterName || 'Self'}
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-700 font-black whitespace-nowrap">
          ₹{parseFloat(item.totalAmount || item.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 italic max-w-[150px] truncate" title={item.reason || item.billRemarks}>
          {item.reason || item.billRemarks || 'Material rejected due to check failure'}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">{item.plannedDate || '22/05/2026'}</td>
      </tr>
    );
  };

  const renderCard = (item, idx) => (
    <div key={item.id || idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm text-left">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.id || '-'}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight mt-0.5">{item.vendorName || '-'}</h4>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Indent: {item.indentNo || '-'}</p>
        </div>
        <button
          onClick={() => setEditingItem(item)}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all"
        >
          Send Note
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-2.5 text-[11px] py-2.5 border-t border-b border-gray-50">
        <div className="col-span-2">
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Product</span>
          <span className="font-semibold text-gray-800 uppercase">{item.items?.[0]?.productName || item.productName || '-'}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Qty</span>
          <span className="font-bold text-indigo-600">{item.items?.[0]?.liftQty || item.qty || 0}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Bill Amount</span>
          <span className="font-black text-gray-900">₹{parseFloat(item.billAmount || 0).toLocaleString()}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Reason</span>
          <span className="text-gray-600 italic block text-[10px] break-words truncate max-w-full">
            {item.reason || item.billRemarks || 'Physical check fail'}
          </span>
        </div>
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
        minWidth="min-w-[2100px]"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={data.length}
      />

      {editingItem && (
        <SendDebitForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            if (refresh) refresh();
          }}
        />
      )}
    </div>
  );
}
