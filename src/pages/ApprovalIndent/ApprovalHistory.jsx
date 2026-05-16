import React, { useMemo, useState } from 'react';
import { 
  Check, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import InfoPopover from '../../components/InfoPopover';
import DataTable from '../../components/DataTable';

export default function ApprovalHistory({ data, filters }) {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

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
        const matchesSearch = (
          item.serialNo.toLowerCase().includes(q) ||
          item.firmName.toLowerCase().includes(q) ||
          item.indenterName.toLowerCase().includes(q) ||
          item.itemName.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          (item.approvalRemarks && item.approvalRemarks.toLowerCase().includes(q))
        );
        if (!matchesSearch) return false;
      }

      // New Category Filters
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
      if (filters.itemName && item.itemName !== filters.itemName) return false;
      if (filters.uom && item.uom !== filters.uom) return false;

      return true;
    });
  }, [data, filters]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const tableHeaders = [
    "Serial No",
    "Decision Date",
    "Approve Status",
    "Remarks",
    "Qty",
    "ItemCount",
    "Firm Name",
    "Indenter Name",
    "Status",
    "Department",
    "Group-Head",
    "Item Name",
    "UOM",
    "Area of Use",
    "Attachment",
    "Specification"
  ];

  const renderRow = (item) => {
    return (
      <tr key={`${item.id}-${item.itemCount}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
        <td className="px-4 py-2.5 text-center text-[10px] text-gray-500 font-medium whitespace-nowrap">
          {item.approvedAt ? (
            (() => {
              const d = new Date(item.approvedAt);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            })()
          ) : (
            item.timestamp // Fallback to indent timestamp if approvedAt is missing
          )}
        </td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
            item.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {item.approvalStatus}
          </span>
        </td>
        <td className="px-4 py-2.5 text-left whitespace-nowrap">
          {item.approvalRemarks ? (
            <InfoPopover items={[item.approvalRemarks]} title="Approval Remarks">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 cursor-help hover:text-indigo-600">
                <Info size={12} /> View Remarks
              </span>
            </InfoPopover>
          ) : (
            <span className="text-gray-300 italic text-[10px]">No remarks</span>
          )}
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-bold whitespace-nowrap">{item.itemQty || 1}</td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.indenterName}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tight ${
            item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {item.indentStatus}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-medium whitespace-nowrap">{item.itemName}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.areaOfUse}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          {item.attachment ? (
            <span className="text-emerald-500 flex justify-center"><Check size={14} /></span>
          ) : (
            <span className="text-gray-300">-</span>
          )}
        </td>
        <td className="px-4 py-2.5 text-left whitespace-nowrap">
          <InfoPopover items={[item.specification]} title="Item Specification">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 cursor-help hover:text-indigo-600">
              <Info size={12} /> View Info
            </span>
          </InfoPopover>
        </td>
      </tr>
    );
  };

  const renderCard = (item) => {
    return (
      <div key={`${item.id}-${item.itemCount}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Item Name</span>
            <span className="text-gray-900 font-bold">{item.itemName}</span>
          </div>
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Qty</span>
            <span className="text-indigo-600 font-bold">{item.itemQty || 1} {item.uom}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tight ${
              item.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {item.approvalStatus}
            </span>
            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tight ${
              item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {item.indentStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-[11px] border-t border-gray-100 pt-3">
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Firm</span>
            <span className="text-gray-700 font-medium">{item.firmName}</span>
          </div>
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Department</span>
            <span className="text-gray-700 font-medium">{item.department}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400 block uppercase text-[9px]">Decision Date</span>
            <span className="text-gray-700 font-medium">
              {item.approvedAt ? new Date(item.approvedAt).toLocaleString() : item.timestamp}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400 block uppercase text-[9px]">Remarks</span>
            <span className="text-gray-600 italic">{item.approvalRemarks || 'No remarks'}</span>
          </div>
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
        minWidth="1500px"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalResults={filteredData.length}
      />
    </div>
  );
}
