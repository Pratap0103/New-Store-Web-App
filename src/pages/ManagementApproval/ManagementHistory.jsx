import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ModalView from '../../components/ModalView';

function VendorViewModal({ vendor, onClose }) {
  if (!vendor) return null;
  return (
    <ModalView isOpen={true} onClose={onClose} title="Approved Vendor Details" maxWidth="max-w-md" zIndex="z-[110]">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <span className="h-5 w-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">★</span>
          <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight break-words">{vendor.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            ['Quotation No',    vendor.quotationNo],
            ['Quotation Date',  vendor.quotationDate],
            ['Basic Rate',      `₹${vendor.basicRate}`],
            ['Payment Terms',   vendor.paymentTerms],
            ['Delivery (Days)', vendor.deliveryTime],
            ['Make / Brand',    vendor.make],
          ].map(([label, val]) => (
            <div key={label} className="space-y-0.5">
              <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">{label}</span>
              <span className="text-[10px] font-semibold text-gray-700 break-words block">{val || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    </ModalView>
  );
}

export default function ManagementHistory({ data, filters }) {
  const [currentPage,    setCurrentPage]    = useState(1);
  const [itemsPerPage,   setItemsPerPage]   = useState(15);
  const [viewingVendor,  setViewingVendor]  = useState(null);

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
      return true;
    });
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);

  const tableHeaders = [
    'Serial No', 'ItemCount', 'Firm Name',
    'Department', 'Group-Head', 'Item Name', 'UOM', 'Qty',
    'Vendor Type', 'Approved Vendor', 'Mgmt Remarks'
  ];

  const renderRow = (item) => {
    const ma = item.managementApproval || {};
    const vendor = ma.approvedVendor || {};
    const vInfo = item.vendorRateInfo || {};

    return (
      <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap">{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.itemQty}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${vInfo.vendorType === 'Three Party' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <div
            onClick={() => setViewingVendor(vendor)}
            className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-all bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm"
          >
            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight whitespace-nowrap">{vendor.name}</span>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-[10px] font-black text-emerald-600 whitespace-nowrap">₹{vendor.basicRate}</span>
            <Eye size={12} className="text-emerald-400 ml-1" />
          </div>
        </td>
        <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 italic max-w-[150px] break-words">
          {ma.remarks || '-'}
        </td>
      </tr>
    );
  };

  const renderCard = (item) => {
    const ma = item.managementApproval || {};
    const vendor = ma.approvedVendor || {};
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
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Status</span><span className="text-emerald-600 font-bold">Mgmt Approved</span></div>
        </div>

        {ma.remarks && (
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-1">Approval Remarks</span>
            <p className="text-[10px] text-gray-600 italic break-words">{ma.remarks}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => setViewingVendor(vendor)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[11px] font-black active:scale-95 transition-all shadow-sm"
          >
            <Eye size={14} /> View Approved: {vendor.name}
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
      {viewingVendor && <VendorViewModal vendor={viewingVendor} onClose={() => setViewingVendor(null)} />}
    </div>
  );
}
