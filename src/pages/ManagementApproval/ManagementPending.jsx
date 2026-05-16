import React, { useState, useMemo } from 'react';
import { Edit3, Eye, Check } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ManagementForm from './ManagementForm';

const RANK_COLORS = {
  t1: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', badge: 'bg-amber-400' },
  t2: { bg: 'bg-slate-50',  border: 'border-slate-400',  text: 'text-slate-700',  badge: 'bg-slate-400'  },
  t3: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-300' },
};

function VendorViewModal({ vendor, rank, onClose }) {
  if (!vendor) return null;
  const c = RANK_COLORS[rank];
  return (
    <div className="fixed inset-0 lg:left-56 2xl:left-60 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[110] p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[550px] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${c.badge} text-white`}>{rank.toUpperCase()}</span>
            <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Vendor Details</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <span className="h-5 w-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
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
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition font-black uppercase tracking-widest">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ManagementPending({ data, filters, refresh }) {
  const [currentPage,    setCurrentPage]    = useState(1);
  const [itemsPerPage,   setItemsPerPage]   = useState(15);
  const [editingItem,    setEditingItem]    = useState(null);
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

  const RankCell = ({ vendor, rank }) => {
    const c = RANK_COLORS[rank];
    if (!vendor) return <td className="px-3 py-2.5 text-center text-gray-300 text-xs">-</td>;
    return (
      <td className="px-3 py-2.5 text-center whitespace-nowrap">
        <div
          onClick={() => setViewingVendor({ vendor, rank })}
          className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-all"
        >
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight whitespace-nowrap">{vendor.name}</span>
          <span className="text-[10px] text-gray-400">|</span>
          <span className={`text-[10px] font-black ${c.text} whitespace-nowrap`}>₹{vendor.basicRate}</span>
        </div>
      </td>
    );
  };

  const tableHeaders = [
    'Action', 'Serial No', 'ItemCount', 'Firm Name',
    'Department', 'Group-Head', 'Item Name', 'UOM', 'Qty',
    'Vendor Type', 'T1', 'T2', 'T3'
  ];

  const renderRow = (item) => {
    const ta = item.technicalApproval || {};
    const vInfo = item.vendorRateInfo || {};
    return (
      <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <button
            onClick={() => setEditingItem(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-bold text-[11px] whitespace-nowrap mx-auto"
          >
            <Edit3 size={13} /> Approve
          </button>
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap break-words">{item.department}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap break-words">{item.groupHead}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-bold whitespace-nowrap break-words">{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.itemQty}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${vInfo.vendorType === 'Three Party' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </td>
        <RankCell vendor={ta.t1} rank="t1" />
        <RankCell vendor={ta.t2} rank="t2" />
        <RankCell vendor={ta.t3} rank="t3" />
      </tr>
    );
  };

  const renderCard = (item) => {
    const vInfo = item.vendorRateInfo    || {};
    const ta    = item.technicalApproval || {};
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
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Process</span><span className="text-gray-600">Mgmt Approval</span></div>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block px-1">Ranked Vendors (Click to View)</span>
          <div className="flex gap-2">
            {['t1','t2','t3'].map(rank => {
              const v = ta[rank];
              const c = RANK_COLORS[rank];
              if (!v) return null;
              return (
                <button key={rank} onClick={() => setViewingVendor({ vendor: v, rank })}
                  className={`flex-1 flex flex-col items-center px-1 py-1.5 rounded-lg border ${c.bg} ${c.border} active:scale-95 transition-all shadow-sm`}>
                  <span className={`text-[8px] font-black uppercase ${c.text}`}>{rank.toUpperCase()}</span>
                  <span className="text-[9px] font-bold text-gray-800 break-words text-center line-clamp-1">{v.name}</span>
                  <span className={`text-[9px] font-black ${c.text}`}>₹{v.basicRate}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <button onClick={() => setEditingItem(item)} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold shadow-md active:scale-95 transition-all">
            <Edit3 size={14} /> Approve Indent
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
      {viewingVendor && (
        <VendorViewModal 
          vendor={viewingVendor.vendor} 
          rank={viewingVendor.rank} 
          onClose={() => setViewingVendor(null)} 
        />
      )}
      {editingItem && (
        <ManagementForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => { setEditingItem(null); refresh(); }}
        />
      )}
    </div>
  );
}
