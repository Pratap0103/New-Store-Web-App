import React from 'react';
import DataTable from '../../components/DataTable';
import { Eye, FileText } from 'lucide-react';

export default function BillnotreceviedPending({ data, onProcess, onViewImage }) {
  const headers = [
    'Action', 'Lift Number', 'Indent No.', 'PO Number', 'Vendor Name', 'Project Name',
    'Product Name', 'Bill Status', 'Planned Date', 'Bill No.', 'Qty', 'Lead Time To Lift Material',
    'Type Of Bill', 'Bill Amount', 'Discount Amount', 'Payment Type', 'Advance Amount If Any',
    'Photo Of Bill', 'Transportation Include', 'Transporter Name', 'Amount', 'Challan No.', 'Challan Image'
  ];

  const renderRow = (item, index) => {
    const plannedStr = item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('en-GB') : '-';
    
    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-3 py-2.5 text-center">
          <button
            onClick={() => onProcess(item)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-semibold text-[10px] whitespace-nowrap mx-auto"
          >
            <FileText size={12} />
            <span>Receive Bill</span>
          </button>
        </td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-slate-800 whitespace-nowrap">{item.id}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-600 whitespace-nowrap">{item.indentNumber}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.poNumber}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[140px] truncate" title={item.vendorName}>{item.vendorName}</td>
        <td className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 max-w-[130px] truncate" title={item.projectName}>{item.projectName}</td>
        <td className="px-3 py-2.5 text-center text-xs font-medium text-gray-700 max-w-[150px] truncate" title={item.productName}>{item.productName}</td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap">
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
            {item.billStatus}
          </span>
        </td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-700 whitespace-nowrap">{plannedStr}</td>
        <td className="px-3 py-2.5 text-center text-xs font-semibold text-gray-400 whitespace-nowrap">{item.billNo || 'TBD'}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-gray-800 whitespace-nowrap">{item.qty}</td>
        <td className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 whitespace-nowrap">{item.leadTime}</td>
        <td className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 max-w-[120px] truncate" title={item.typeOfBill}>{item.typeOfBill}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-rose-500 whitespace-nowrap">₹{Number(item.discountAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 max-w-[120px] truncate" title={item.paymentType}>{item.paymentType}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.advanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap">
          <span className="text-[10px] text-gray-400 font-semibold italic">No Image</span>
        </td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-600 whitespace-nowrap">{item.transportationInclude}</td>
        <td className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 max-w-[130px] truncate" title={item.transporterName}>{item.transporterName || '-'}</td>
        <td className="px-3 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-700 whitespace-nowrap">{item.challanNo || '-'}</td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap">
          <button
            onClick={() => onViewImage(item.challanImage || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500', 'Challan Slip')}
            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg mx-auto flex items-center justify-center"
            title="View Challan Copy"
          >
            <Eye size={14} />
          </button>
        </td>
      </tr>
    );
  };

  const renderCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Lift Number</span>
            <span className="text-xs font-extrabold text-slate-800">{item.id}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
            {item.billStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Vendor Name</span>
            <span className="font-bold text-gray-700 truncate block max-w-[150px]">{item.vendorName}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Product Name</span>
            <span className="font-bold text-gray-700 truncate block max-w-[150px]">{item.productName}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Bill Amount</span>
            <span className="font-black text-emerald-600">₹{Number(item.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Quantity</span>
            <span className="font-black text-gray-800">{item.qty}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => onProcess(item)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-semibold text-[10px]"
          >
            <FileText size={12} />
            <span>Receive Bill</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <DataTable
      headers={headers}
      data={data}
      renderRow={renderRow}
      renderCard={renderCard}
      minWidth="2200px"
      currentPage={1}
      totalPages={1}
      itemsPerPage={50}
      onPageChange={() => {}}
      onItemsPerPageChange={() => {}}
      totalResults={data.length}
    />
  );
}
