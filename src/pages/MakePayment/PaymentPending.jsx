import React, { useState } from 'react';
import { Edit3, Info } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';
import PaymentForm from './PaymentForm';

export default function PaymentPending({ data, filters, refresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [editingItem, setEditingItem] = useState(null);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const tableHeaders = [
    'Action', 'Firm Name', 'Planned Date', 'Payment No.', 
    'PO Number', 'Party Name', 'Payment Terms', 'Indent No.', 
    'Product', 'Total Amount', 'Pendingprice', 'Remark'
  ];

  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-2.5 text-center">
        <button
          onClick={() => setEditingItem(item)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-semibold text-[11px] whitespace-nowrap mx-auto"
          title="Make Payment"
        >
          <Edit3 size={13} />
          <span className="hidden lg:inline">Make Pay</span>
        </button>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
      <td className="px-4 py-2.5 text-center text-xs text-gray-600 whitespace-nowrap">{item.plannedDate || '-'}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-400 whitespace-nowrap">-</td>
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
      <td className="px-4 py-2.5 text-center text-xs text-red-600 font-bold whitespace-nowrap">₹{Number(item.pendingPrice).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">
        {item.remarks || item.hodRemark || '-'}
      </td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-gray-900 break-words">{item.partyName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-indigo-600 font-black uppercase">{item.poNumber || item.indentNo || 'DIRECT'}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-tight bg-red-100 text-red-700">
          ₹{Number(item.pendingPrice).toFixed(2)} Pending
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-[11px] py-3 border-t border-b border-gray-50">
        <div className="col-span-2"><span className="text-gray-400 block text-[9px] uppercase font-bold">Product</span><span className="font-semibold text-gray-800">{item.product}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Total Amount</span><span className="text-gray-900 font-bold">₹{Number(item.totalAmount).toFixed(2)}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Firm Name</span><span className="text-gray-600">{item.firmName}</span></div>
      </div>

      <div className="pt-1">
        <button
          onClick={() => setEditingItem(item)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-bold shadow-md active:scale-95 transition-all uppercase tracking-wider"
        >
          <Edit3 size={14} /> Make Payment
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
        minWidth="1400px"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={data.length}
      />

      {editingItem && (
        <PaymentForm 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSuccess={() => { setEditingItem(null); refresh(); }}
        />
      )}
    </div>
  );
}
