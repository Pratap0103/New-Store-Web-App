import React, { useState, useMemo } from 'react';
import { Edit3, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '../../components/DataTable';
import TechnicalForm from './TechnicalForm';
import ModalView from '../../components/ModalView';

function VendorViewModal({ item, onClose }) {
  const vInfo    = item.vendorRateInfo || {};
  const details  = vInfo.vendorDetails || [];
  const isThree  = vInfo.vendorType === 'Three Party';

  return (
    <ModalView isOpen={true} onClose={onClose} title="Vendor Rate Details" maxWidth="max-w-md" zIndex="z-[110]">
      <div className="flex items-center gap-2 px-1">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isThree ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {vInfo.vendorType || 'Regular'}
        </span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight break-words">{item.itemName}</span>
      </div>

      {details.map((v, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <span className="h-5 w-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight break-words">{v.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              ['Quotation No',    v.quotationNo],
              ['Quotation Date',  v.quotationDate],
              ['Basic Rate',      `₹${v.basicRate}`],
              ['Payment Terms',   v.paymentTerms],
              ['Delivery (Days)', v.deliveryTime],
              ['Make / Brand',    v.make],
            ].map(([label, val]) => (
              <div key={label} className="space-y-0.5">
                <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">{label}</span>
                <span className="text-[10px] font-semibold text-gray-700 break-words block">{val || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </ModalView>
  );
}

export default function TechnicalPending({ data, filters, refresh }) {
  const [currentPage,    setCurrentPage]    = useState(1);
  const [itemsPerPage,   setItemsPerPage]   = useState(15);
  const [editingItem,    setEditingItem]    = useState(null);
  const [viewingItem,    setViewingItem]    = useState(null);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const [dStr] = item.timestamp.split(' ');
        const [d, m, y] = dStr.split('/');
        const itemDate = `${y}-${m}-${d}`;
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate   && itemDate > filters.toDate)   return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.serialNo.toLowerCase().includes(q)   ||
          item.firmName.toLowerCase().includes(q)   ||
          item.itemName.toLowerCase().includes(q)   ||
          item.department.toLowerCase().includes(q)
        );
      }
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead  && item.groupHead  !== filters.groupHead)  return false;
      return true;
    });
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);

  const tableHeaders = [
    'Action', 'Serial No', 'ItemCount', 'Firm Name',
    'Department', 'Group-Head', 'Item Name', 'UOM', 'Qty',
    'Vendor Type', 'View'
  ];

  const renderRow = (item) => {
    const vInfo   = item.vendorRateInfo || {};
    const isThree = vInfo.vendorType === 'Three Party';
    return (
      <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <button
            onClick={() => setEditingItem(item)}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-semibold text-[11px] whitespace-nowrap mx-auto"
            title="Rank Vendors"
          >
            <Edit3 size={13} />
            <span className="hidden lg:inline">Rank</span>
          </button>
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.itemQty}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isThree ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <button
            onClick={() => setViewingItem(item)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-[10px] font-semibold mx-auto"
          >
            <Eye size={12} /> View
          </button>
        </td>
      </tr>
    );
  };

  const renderCard = (item) => {
    const vInfo = item.vendorRateInfo || {};
    return (
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
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${vInfo.vendorType === 'Three Party' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-[11px] py-3 border-t border-b border-gray-50">
          <div className="col-span-2"><span className="text-gray-400 block text-[9px] uppercase font-bold">Firm Name</span><span className="font-semibold text-gray-800">{item.firmName}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Department</span><span className="text-gray-600">{item.department}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Group-Head</span><span className="text-gray-600">{item.groupHead}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Qty / UOM</span><span className="text-indigo-600 font-black">{item.itemQty} {item.uom}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Process</span><span className="text-gray-600">Technical Approval</span></div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={() => setViewingItem(item)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-[11px] font-bold active:scale-95 transition-all">
            <Eye size={14} /> View Details
          </button>
          <button onClick={() => setEditingItem(item)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-bold shadow-md active:scale-95 transition-all">
            <Edit3 size={14} /> Rank Vendors
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <DataTable
        headers={tableHeaders}
        data={paginatedData}
        renderRow={renderRow}
        renderCard={renderCard}
        minWidth="min-w-[1200px] 2xl:min-w-full"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={filteredData.length}
      />
      {viewingItem && <VendorViewModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {editingItem && (
        <TechnicalForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => { setEditingItem(null); refresh(); }}
        />
      )}
    </div>
  );
}
