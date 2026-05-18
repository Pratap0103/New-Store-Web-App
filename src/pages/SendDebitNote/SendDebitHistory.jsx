import React, { useState } from 'react';
import { Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/DataTable';

export default function SendDebitHistory({ data, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const tableHeaders = [
    'Timestamp', 'Lift Number', 'Project Name', 'Indent No.', 'Bill No.', 
    'Vendor Name', 'Product Name', 'Qty', 'Type Of Bill', 'Bill Amount', 
    'Payment Type', 'Advance Amount If Any', 'Photo Of Bill', 'Transportation Include', 
    'Status', 'Reason', 'Bill Number', 'Status Purchaser', 'Debit Note Copy', 
    'Bill Copy', 'Return Copy'
  ];

  const renderRow = (item, idx) => {
    const timestampStr = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('en-GB')
      : '-';

    return (
      <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors text-center">
        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{timestampStr}</td>
        <td className="px-4 py-2.5 text-xs text-indigo-600 font-bold whitespace-nowrap">{item.liftNumber || '-'}</td>
        <td className="px-4 py-2.5 text-xs text-gray-600 font-medium whitespace-nowrap uppercase">{item.projectName || item.firmName || 'Botivate'}</td>
        <td className="px-4 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap uppercase">{item.indentNo || '-'}</td>
        <td className="px-4 py-2.5 text-xs text-gray-700 font-medium whitespace-nowrap">{item.billNo || item.billNumber || '-'}</td>
        <td className="px-4 py-2.5 text-xs text-gray-900 font-bold whitespace-nowrap uppercase">{item.vendorName || '-'}</td>
        <td className="px-4 py-2.5 text-xs text-gray-800 font-semibold whitespace-nowrap uppercase truncate max-w-[180px]" title={item.productName}>
          {item.productName || '-'}
        </td>
        <td className="px-4 py-2.5 text-xs text-indigo-600 font-bold whitespace-nowrap">{item.qty || 0}</td>
        <td className="px-4 py-2.5 text-[11px] text-gray-500 whitespace-nowrap">{item.typeOfBill || 'Tax Invoice'}</td>
        <td className="px-4 py-2.5 text-xs text-gray-900 font-black whitespace-nowrap">
          ₹{parseFloat(item.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="px-4 py-2.5 text-[11px] text-gray-500 whitespace-nowrap">{item.paymentType || '30 Days Credit'}</td>
        <td className="px-4 py-2.5 text-[11px] text-gray-500 whitespace-nowrap">{item.advanceAmount || '₹0.00'}</td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          <div className="flex justify-center text-gray-400 hover:text-indigo-600 cursor-pointer">
            <ImageIcon size={14} />
          </div>
        </td>
        <td className="px-4 py-2.5 text-[11px] text-gray-600 whitespace-nowrap">{item.transportation || 'Yes'}</td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-700">
            {item.status || 'Sent'}
          </span>
        </td>
        <td className="px-4 py-2.5 text-[11px] text-gray-500 italic max-w-[150px] truncate" title={item.reason}>
          {item.reason || '-'}
        </td>
        <td className="px-4 py-2.5 text-xs text-gray-700 font-medium whitespace-nowrap">{item.billNo || item.billNumber || '-'}</td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-700">
            {item.statusPurchaser || 'Approved'}
          </span>
        </td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          {item.debitNoteCopy ? (
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors mx-auto flex items-center justify-center gap-1 text-[10px] font-bold" title={item.debitNoteCopy}>
              <FileText size={14} />
              <span className="max-w-[70px] truncate">{item.debitNoteCopy}</span>
            </button>
          ) : <span className="text-gray-300">-</span>}
        </td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          {item.billCopy ? (
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors mx-auto flex items-center justify-center gap-1 text-[10px] font-bold" title={item.billCopy}>
              <FileText size={14} />
              <span className="max-w-[70px] truncate">{item.billCopy}</span>
            </button>
          ) : <span className="text-gray-300">-</span>}
        </td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          {item.returnCopy ? (
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors mx-auto flex items-center justify-center gap-1 text-[10px] font-bold" title={item.returnCopy}>
              <FileText size={14} />
              <span className="max-w-[70px] truncate">{item.returnCopy}</span>
            </button>
          ) : <span className="text-gray-300">-</span>}
        </td>
      </tr>
    );
  };

  const renderCard = (item, idx) => (
    <div key={item.id || idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm text-left">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">DEBIT NOTE: {item.debitNoteNo || '-'}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight mt-0.5">{item.vendorName || '-'}</h4>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Indent: {item.indentNo || '-'}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg flex items-center justify-center">
          <CheckCircle2 size={16} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2.5 text-[11px] py-2.5 border-t border-b border-gray-50">
        <div className="col-span-2">
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Product</span>
          <span className="font-semibold text-gray-800 uppercase">{item.productName || '-'}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Qty</span>
          <span className="font-bold text-indigo-600">{item.qty || 0}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Bill Amount</span>
          <span className="font-black text-gray-900">₹{parseFloat(item.billAmount || 0).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Status</span>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded uppercase">
            {item.status || 'Sent'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Purchaser</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded uppercase">
            {item.statusPurchaser || 'Approved'}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Debit Note Copy</span>
          <span className="font-semibold text-indigo-600 truncate block">{item.debitNoteCopy || '-'}</span>
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
        minWidth="min-w-[2400px]"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={data.length}
      />
    </div>
  );
}
