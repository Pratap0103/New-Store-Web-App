import React, { useState, useMemo } from 'react';
import { FileText, Eye, CheckCircle2, Paperclip } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function LiftingHistory({ liftingRecords = [], filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const filteredRecords = useMemo(() => {
    return liftingRecords.filter(record => {
      // Date filtering
      if (filters.fromDate || filters.toDate) {
        const itemDate = new Date(record.timestamp).toISOString().split('T')[0];
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      // Search filtering
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          record.poNumber.toLowerCase().includes(q) ||
          record.vendorName.toLowerCase().includes(q) ||
          record.indentNo.toLowerCase().includes(q) ||
          (record.billNumber && record.billNumber.toLowerCase().includes(q)) ||
          (record.challanNumber && record.challanNumber.toLowerCase().includes(q))
        );
      }
      // Dropdown filtering (using poData context if available, otherwise fallback)
      if (filters.department && record.department !== filters.department) return false;
      if (filters.groupHead && record.groupHead !== filters.groupHead) return false;

      return true;
    }).reverse();
  }, [liftingRecords, filters]);

  const paginatedData = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const tableHeaders = [
    "Timestamp", "Indent No.", "Firm Name", "Approved Vendor Name", 
    "Photo Of Bill", "PO Number", "PO Date", "Delivery Date", 
    "Lifting Qty", "Pending Qty", "Bill Number", "Bill Amount", 
    "Bill Remarks", "Challan Number", "Attachment", "Transporter Name", 
    "Vehicle No", "Driver Name", "Driver Mobile No", "Freight Amount"
  ];

  const renderRow = (record) => {
    const totalLiftQty = record.items.reduce((sum, i) => sum + i.liftQty, 0);
    const totalPendingQty = record.items.reduce((sum, i) => sum + (i.pendingQty || 0) - i.liftQty - i.cancelQty, 0);

    return (
      <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
          {new Date(record.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 whitespace-nowrap uppercase">
          {record.indentNo}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap uppercase">
          <InfoPopover items={[record.firmName || record.projectName || 'Botivate']} title="Firm Name">
            <div className="max-w-[150px] truncate">{record.firmName || record.projectName || 'Botivate'}</div>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 font-bold whitespace-nowrap uppercase">
          <InfoPopover items={[record.vendorName]} title="Vendor Name">
            <div className="max-w-[150px] truncate">{record.vendorName}</div>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          {record.billAttachment ? (
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors" title="View Bill">
              <FileText size={15} />
            </button>
          ) : <span className="text-gray-300 text-[9px] uppercase font-bold tracking-tighter">N/A</span>}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-indigo-600 uppercase whitespace-nowrap">
          {record.poNumber}
        </td>
        <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
          {new Date(record.timestamp).toLocaleDateString('en-GB')} 
        </td>
        <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
          {new Date(record.timestamp).toLocaleDateString('en-GB')}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-900 whitespace-nowrap">
          {totalLiftQty}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-red-500 whitespace-nowrap">
          {totalPendingQty}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 whitespace-nowrap uppercase">
          {record.billNumber || '---'}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-900 whitespace-nowrap">
          ₹{parseFloat(record.billAmount || 0).toLocaleString('en-IN')}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-500 whitespace-nowrap">
          <InfoPopover items={[record.billRemarks || '---']} title="Bill Remarks">
            <div className="max-w-[150px] truncate">{record.billRemarks || '---'}</div>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 whitespace-nowrap uppercase">
          {record.challanNumber || '---'}
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          {record.challanImage ? (
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors" title="View Attachment">
              <Paperclip size={15} />
            </button>
          ) : <span className="text-gray-300 text-[9px] uppercase font-bold tracking-tighter">N/A</span>}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap uppercase">
          <InfoPopover items={[record.transporterName || '---']} title="Transporter">
            <div className="max-w-[150px] truncate">{record.transporterName || '---'}</div>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 whitespace-nowrap uppercase">
          {record.vehicleNo || '---'}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap uppercase">
          {record.driverName || '---'}
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">
          {record.driverMobile || '---'}
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-900 whitespace-nowrap">
          ₹{parseFloat(record.frightAmount || 0).toLocaleString('en-IN')}
        </td>
      </tr>
    );
  };

  const renderCard = (record) => (
    <div key={record.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
       <div className="flex justify-between items-start">
          <div className="space-y-1">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{record.poNumber}</span>
             <h4 className="text-sm font-bold text-gray-900 uppercase">LIFTING RECORD</h4>
             <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(record.timestamp).toLocaleString('en-GB')}</p>
          </div>
          <div className="bg-green-50 text-green-600 p-2 rounded-xl">
             <CheckCircle2 size={20} />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
          <div className="flex flex-col">
             <span className="text-[8px] text-gray-400 uppercase font-black">Indent No.</span>
             <span className="text-[11px] font-bold text-gray-700 uppercase">{record.indentNo}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] text-gray-400 uppercase font-black">Vendor</span>
             <span className="text-[11px] font-bold text-gray-700 uppercase truncate">{record.vendorName}</span>
          </div>
       </div>

       <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
             <span className="text-gray-400 uppercase font-bold">Bill/Challan</span>
             <span className="font-black text-gray-900 uppercase">{record.billNumber || record.challanNumber || '---'}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
             <span className="text-gray-400 uppercase font-bold">Lifting Qty</span>
             <span className="font-black text-indigo-600">{record.items.reduce((sum, i) => sum + i.liftQty, 0)} Items</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
             <span className="text-gray-400 uppercase font-bold">Bill Amount</span>
             <span className="font-black text-gray-900">₹{parseFloat(record.billAmount || 0).toLocaleString('en-IN')}</span>
          </div>
       </div>

       <button className="w-full py-2.5 bg-gray-50 text-indigo-600 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
          <Eye size={14} /> View Details
       </button>
    </div>
  );

  return (
    <DataTable
      headers={tableHeaders}
      data={paginatedData}
      renderRow={renderRow}
      renderCard={renderCard}
      minWidth="min-w-[2200px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredRecords.length}
    />
  );
}
