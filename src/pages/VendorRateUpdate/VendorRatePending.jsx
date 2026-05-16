import React, { useState, useMemo } from 'react';
import { 
  Check, Info, Edit3, ChevronLeft, ChevronRight 
} from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';
import VendorRateForm from './VendorRateForm';

export default function VendorRatePending({ data, filters, refresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [editingItem, setEditingItem] = useState(null);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const [dStr] = item.timestamp.split(' ');
        const [d, m, y] = dStr.split('/');
        const itemDate = `${y}-${m}-${d}`;
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.serialNo.toLowerCase().includes(q) ||
          item.firmName.toLowerCase().includes(q) ||
          item.itemName.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
        );
      }
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
      return true;
    });
  }, [data, filters]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const tableHeaders = [
    "Action",
    "Serial No",
    "ItemCount",
    "Firm Name",
    "Status",
    "Department",
    "Group-Head",
    "Item Name",
    "UOM",
    "Qty",
    "Area Of Use",
    "Attachment",
    "Specification"
  ];

  const renderRow = (item) => (
    <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-2.5 text-center">
        <button
          onClick={() => setEditingItem(item)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-semibold text-[11px] whitespace-nowrap mx-auto"
          title="Update Rates"
        >
          <Edit3 size={13} />
          <span className="hidden lg:inline">Update Rate</span>
        </button>
      </td>
      <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
      <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tight bg-emerald-100 text-emerald-700">
          {item.approvalStatus || 'APPROVED'}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.itemName}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
      <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.itemQty}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.areaOfUse}</td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        {item.attachment ? <Check size={14} className="text-emerald-500 mx-auto" /> : <span className="text-gray-300">-</span>}
      </td>
      <td className="px-4 py-2.5 text-center whitespace-nowrap">
        <InfoPopover items={[item.specification]} title="Item Specification">
          <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1 cursor-help hover:text-indigo-600">
            <Info size={12} /> Info
          </span>
        </InfoPopover>
      </td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={`${item.id}-${item.itemCount}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-gray-900 break-words">{item.itemName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-indigo-600 font-black uppercase">{item.serialNo}</span>
            <span className="text-[9px] text-gray-400">|</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase"># {item.itemCount}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-tight bg-emerald-100 text-emerald-700">
          {item.approvalStatus || 'APPROVED'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-[11px] py-3 border-t border-b border-gray-50">
        <div className="col-span-2"><span className="text-gray-400 block text-[9px] uppercase font-bold">Firm Name</span><span className="font-semibold text-gray-800">{item.firmName}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Department</span><span className="text-gray-600">{item.department}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Group-Head</span><span className="text-gray-600">{item.groupHead}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Qty / UOM</span><span className="text-indigo-600 font-black">{item.itemQty} {item.uom}</span></div>
        <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Area of Use</span><span className="text-gray-600">{item.areaOfUse || '-'}</span></div>
      </div>

      <div className="pt-1">
        <button
          onClick={() => setEditingItem(item)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-bold shadow-md active:scale-95 transition-all uppercase tracking-wider"
        >
          <Edit3 size={14} /> Update Rate
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
        minWidth="1300px"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={filteredData.length}
      />

      {editingItem && (
        <VendorRateForm 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSuccess={() => { setEditingItem(null); refresh(); }}
        />
      )}
    </div>
  );
}
