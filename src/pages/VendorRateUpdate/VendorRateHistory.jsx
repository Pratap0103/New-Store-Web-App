import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, Info, ChevronLeft, ChevronRight, Download, Eye
} from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

function VendorViewModal({ item, onClose }) {
  const vInfo    = item.vendorRateInfo || {};
  const details  = vInfo.vendorDetails || [];
  const isThree  = vInfo.vendorType === 'Three Party';

  return (
    <div className="fixed inset-0 lg:left-64 2xl:left-72 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[110] p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[450px] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-center flex-shrink-0">
          <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Vendor Rate Details</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
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
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">Quotation No</span>
                  <span className="text-[10px] font-semibold text-gray-700 break-words block">{v.quotationNo || '-'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">Quotation Date</span>
                  <span className="text-[10px] font-semibold text-gray-700 break-words block">{v.quotationDate || '-'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">Basic Rate</span>
                  <span className="text-[10px] font-semibold text-gray-700 break-words block">{v.basicRate ? `₹${v.basicRate}` : '-'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">Payment Terms</span>
                  <InfoPopover items={[v.paymentTerms]} title="Payment Terms">
                    <span className="text-[10px] font-semibold text-indigo-600 break-words block cursor-help underline decoration-dotted">View Terms</span>
                  </InfoPopover>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">Delivery (Days)</span>
                  <span className="text-[10px] font-semibold text-gray-700 break-words block">{v.deliveryTime || '-'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 uppercase font-bold block tracking-wider">Make / Brand</span>
                  <span className="text-[10px] font-semibold text-gray-700 break-words block">{v.make || '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition font-black uppercase tracking-widest">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function VendorRateHistory({ data, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [viewingItem, setViewingItem] = useState(null);

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
    "View",
    "Serial No",
    "ItemCount",
    "Firm Name",
    "Department",
    "Group-Head",
    "Item Name",
    "UOM",
    "Qty",
    "Spec.",
    "Vendor Type",
    "Vendor Name 1",
    "Quotation No 1",
    "Quotation Date 1",
    "Basic Rate 1",
    "Payment Terms 1",
    "Delivery Time(Days) 1",
    "Make 1",
    "Vendor Name 2",
    "Quotation No 2",
    "Quotation Date 2",
    "Basic Rate 2",
    "Payment Terms 2",
    "Delivery Time(Days) 2",
    "Make 2",
    "Vendor Name 3",
    "Quotation No 3",
    "Quotation Date 3",
    "Basic Rate 3",
    "Payment Terms 3",
    "Delivery Time(Days) 3",
    "Make 3"
  ];

  const renderRow = (item) => {
    const vInfo = item.vendorRateInfo || {};
    const details = vInfo.vendorDetails || [];

    return (
      <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <button
            onClick={() => setViewingItem(item)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-[10px] font-semibold mx-auto"
          >
            <Eye size={12} /> View
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
          <InfoPopover items={[item.specification]} title="Item Specification">
            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1 cursor-help hover:text-indigo-600">
              <Info size={12} /> Info
            </span>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
            vInfo.vendorType === 'Three Party' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {vInfo.vendorType || 'Regular'}
          </span>
        </td>
        
        {/* Vendor 1 */}
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-medium whitespace-nowrap">{details[0]?.name || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[0]?.quotationNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[0]?.quotationDate || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-bold whitespace-nowrap">{details[0]?.basicRate ? `₹${details[0].basicRate}` : '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">
          <InfoPopover items={[details[0]?.paymentTerms]} title="Vendor 1 Payment Terms">
             <span className="truncate max-w-[100px] block cursor-help">{details[0]?.paymentTerms || '-'}</span>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[0]?.deliveryTime ? `${details[0].deliveryTime} Days` : '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[0]?.make || '-'}</td>

        {/* Vendor 2 */}
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-medium whitespace-nowrap">{details[1]?.name || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[1]?.quotationNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[1]?.quotationDate || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-bold whitespace-nowrap">{details[1]?.basicRate ? `₹${details[1].basicRate}` : '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">
          <InfoPopover items={[details[1]?.paymentTerms]} title="Vendor 2 Payment Terms">
             <span className="truncate max-w-[100px] block cursor-help">{details[1]?.paymentTerms || '-'}</span>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[1]?.deliveryTime ? `${details[1].deliveryTime} Days` : '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[1]?.make || '-'}</td>

        {/* Vendor 3 */}
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-medium whitespace-nowrap">{details[2]?.name || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[2]?.quotationNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[2]?.quotationDate || '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-bold whitespace-nowrap">{details[2]?.basicRate ? `₹${details[2].basicRate}` : '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">
          <InfoPopover items={[details[2]?.paymentTerms]} title="Vendor 3 Payment Terms">
             <span className="truncate max-w-[100px] block cursor-help">{details[2]?.paymentTerms || '-'}</span>
          </InfoPopover>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[2]?.deliveryTime ? `${details[2].deliveryTime} Days` : '-'}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{details[2]?.make || '-'}</td>
      </tr>
    );
  };

  const renderCard = (item) => {
    const vInfo = item.vendorRateInfo || {};
    const details = vInfo.vendorDetails || [];
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
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Process</span><span className="text-gray-600">Rate / Update</span></div>
        </div>

        <div className="pt-2 border-t border-gray-50">
          <button
            onClick={() => setViewingItem(item)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[11px] font-bold active:scale-95 transition-all shadow-sm"
          >
            <Eye size={14} /> View Vendor Rates
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
    </div>
  );
}
