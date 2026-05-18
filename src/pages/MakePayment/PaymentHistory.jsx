import React, { useState } from 'react';
import { Eye, Check } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function PaymentHistory({ data, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const tableHeaders = [
    'Firm Name', 'Planned Date', 'Payment No.', 'Payment Count',
    'PO Number', 'Party Name', 'Payment Terms', 'Indent No.',
    'Product', 'Total Amount', 'Pay Amount', 'Pendingprice',
    'Payment Status', 'Attachment', 'Remarks'
  ];

  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
      <td className="px-4 py-2.5 text-center text-xs text-gray-600 whitespace-nowrap">{item.plannedDate || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-bold whitespace-nowrap">{item.paymentNo || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 font-bold whitespace-nowrap">{item.paymentCount || 1}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-medium whitespace-nowrap">{item.poNumber || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.partyName}</td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        <InfoPopover items={[item.paymentTerms]} title="Payment Terms">
          <span className="text-[10px] text-indigo-600 cursor-help underline decoration-dotted">View Terms</span>
        </InfoPopover>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.indentNo || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-800 font-medium whitespace-nowrap">{item.product}</td>
      <td className="px-4 py-2.5 text-center text-xs text-gray-900 font-bold whitespace-nowrap">₹{Number(item.totalAmount).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-center text-xs text-emerald-600 font-bold whitespace-nowrap">₹{Number(item.paidAmount).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-center text-xs text-red-600 font-bold whitespace-nowrap">₹{Number(item.pendingPrice).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tight bg-emerald-100 text-emerald-700">
          {item.paymentStatus || 'PAID'}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        {item.attachment ? <Check size={14} className="text-emerald-500 mx-auto" /> : <span className="text-gray-300">-</span>}
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap max-w-[150px] truncate">
        {item.remarks || '-'}
      </td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-gray-900 break-words">{item.partyName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-indigo-600 font-black uppercase">{item.paymentNo || 'PAID'}</span>
            <span className="text-[9px] text-gray-400">|</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">{item.poNumber || item.indentNo || 'DIRECT'}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-tight bg-emerald-100 text-emerald-700">
          {item.paymentStatus || 'PAID'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-[11px] py-3 border-t border-b border-gray-50">
        <div className="col-span-2"><span className="text-gray-400 block text-[9px] uppercase font-bold">Product</span><span className="font-semibold text-gray-800">{item.product}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Pay Amount</span><span className="text-emerald-600 font-bold">₹{Number(item.paidAmount).toFixed(2)}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Pending Price</span><span className="text-red-600 font-bold">₹{Number(item.pendingPrice).toFixed(2)}</span></div>
      </div>
      
      {item.remarks && (
        <div className="pt-1">
          <span className="text-gray-400 block text-[9px] uppercase font-bold">Remarks</span>
          <p className="text-[10px] text-gray-600 italic break-words">{item.remarks}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <DataTable
        headers={tableHeaders}
        data={paginatedData}
        renderRow={renderRow}
        renderCard={renderCard}
        minWidth="1600px"
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
