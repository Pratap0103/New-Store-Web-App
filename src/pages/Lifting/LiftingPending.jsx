import React, { useState, useMemo } from 'react';
import { Play, Calendar, ArrowRight } from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function LiftingPending({ pos = [], liftingRecords = [], onLiftingAction, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const pendingItems = useMemo(() => {
    const items = [];
    pos.forEach(po => {
      po.items.forEach((item, itemIdx) => {
        const liftedForThisItem = liftingRecords
          .filter(r => r.poNumber === po.poNumber)
          .reduce((sum, record) => {
            const recordItem = record.items.find(ri => ri.productName === item.productName);
            return sum + (recordItem ? (recordItem.liftQty + recordItem.cancelQty) : 0);
          }, 0);

        const poQty = parseFloat(item.quantity);
        const pendingQty = poQty - liftedForThisItem;

        if (pendingQty > 0) {
          items.push({
            id: `${po.poNumber}-${itemIdx}`,
            timestamp: po.timestamp,
            poNumber: po.poNumber,
            firmName: po.firmName || po.companyName || 'Botivate',
            projectName: po.projectName || 'Botivate Project',
            vendorName: po.supplierName,
            products: item.productName,
            poDate: po.poDate,
            deliveryDate: po.deliveryDate,
            poQty: poQty,
            liftedQty: liftedForThisItem,
            pendingQty: pendingQty,
            expectedDate: po.deliveryDate,
            plannedDate: po.deliveryDate,
            department: po.department || 'General',
            groupHead: po.groupHead || 'General',
            originalItem: item,
            poData: po
          });
        }
      });
    });
    return items.reverse();
  }, [pos, liftingRecords]);

  const filteredItems = useMemo(() => {
    return pendingItems.filter(item => {
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
          item.products.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q)
        );
      }
      // Dropdown filtering
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
      
      return true;
    });
  }, [pendingItems, filters]);

  const paginatedData = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const tableHeaders = [
    "Action", "Timestamp", "PO Number", "Firm Name", "Approved Vendor Name", 
    "Products", "PO Date", "Delivery Date", "PO Qty", "Lifting Qty", 
    "Pending Qty", "Expected Date", "Planned Date"
  ];

  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-2.5 text-center">
        <button
          onClick={() => onLiftingAction(item)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-semibold text-[11px] whitespace-nowrap mx-auto"
          title="Start Lifting"
        >
          <Play size={13} fill="currentColor" />
          <span>Lifting</span>
        </button>
      </td>
      <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
        {new Date(item.timestamp).toLocaleDateString('en-GB')}
      </td>
      <td className="px-4 py-2.5 text-center text-xs font-bold text-indigo-600 uppercase whitespace-nowrap">
        {item.poNumber}
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 uppercase whitespace-nowrap">
        <InfoPopover items={[item.firmName]} title="Firm Name">
           <div className="max-w-[150px] truncate">{item.firmName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 uppercase whitespace-nowrap">
        <InfoPopover items={[item.vendorName]} title="Vendor Name">
           <div className="max-w-[150px] truncate">{item.vendorName}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 font-bold whitespace-nowrap uppercase">
        <InfoPopover items={[item.products]} title="Product Name">
           <div className="max-w-[150px] truncate">{item.products}</div>
        </InfoPopover>
      </td>
      <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
        {new Date(item.poDate).toLocaleDateString('en-GB')}
      </td>
      <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap font-medium text-orange-600">
        {new Date(item.deliveryDate).toLocaleDateString('en-GB')}
      </td>
      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-900 whitespace-nowrap">
        {item.poQty}
      </td>
      <td className="px-4 py-2.5 text-center text-xs font-bold text-indigo-600 whitespace-nowrap">
        {item.liftedQty}
      </td>
      <td className="px-4 py-2.5 text-center text-xs font-bold text-red-600 whitespace-nowrap bg-red-50/30">
        {item.pendingQty}
      </td>
      <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
        {new Date(item.expectedDate).toLocaleDateString('en-GB')}
      </td>
      <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 whitespace-nowrap">
        {new Date(item.plannedDate).toLocaleDateString('en-GB')}
      </td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.poNumber}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase break-words">{item.products}</h4>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
             <Calendar size={10} />
             <span>Del: {new Date(item.deliveryDate).toLocaleDateString('en-GB')}</span>
          </div>
        </div>
        {/* Placeholder for status or other info if needed */}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
         <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 uppercase font-black">Firm</span>
            <span className="text-[10px] text-gray-700 font-bold truncate uppercase">{item.firmName}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 uppercase font-black">Vendor</span>
            <span className="text-[10px] text-gray-700 font-bold truncate uppercase">{item.vendorName}</span>
         </div>
      </div>

      <div className="flex items-center justify-between bg-indigo-50/50 p-2 rounded-lg">
         <div className="text-center px-2">
            <p className="text-[7px] text-gray-400 uppercase font-black mb-0.5 tracking-tighter">PO Qty</p>
            <p className="text-xs font-black text-gray-900">{item.poQty}</p>
         </div>
         <ArrowRight size={12} className="text-indigo-200" />
         <div className="text-center px-2">
            <p className="text-[7px] text-gray-400 uppercase font-black mb-0.5 tracking-tighter">Lifted</p>
            <p className="text-xs font-black text-indigo-600">{item.liftedQty}</p>
         </div>
         <ArrowRight size={12} className="text-indigo-200" />
         <div className="text-center px-2">
            <p className="text-[7px] text-gray-400 uppercase font-black mb-0.5 tracking-tighter">Pending</p>
            <p className="text-xs font-black text-red-600">{item.pendingQty}</p>
         </div>
      </div>

      <button
        onClick={() => onLiftingAction(item)}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
      >
        <Play size={16} fill="currentColor" />
        Lifting
      </button>
    </div>
  );

  return (
    <DataTable
      headers={tableHeaders}
      data={paginatedData}
      renderRow={renderRow}
      renderCard={renderCard}
      minWidth="min-w-[1400px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredItems.length}
    />
  );
}
