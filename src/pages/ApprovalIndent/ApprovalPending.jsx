import React, { useState, useMemo } from 'react';
import { 
  Check, Info, CheckSquare, Square, ChevronLeft, ChevronRight 
} from 'lucide-react';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';

export default function ApprovalPending({ 
  data, 
  filters, 
  refresh, 
  selectedIds, 
  setSelectedIds, 
  rowEdits, 
  setRowEdits 
}) {
  // Pagination State (DataTable expects these)
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
          item.department.toLowerCase().includes(q)
        );
        if (!matchesSearch) return false;
      }
      
      if (filters.department && item.department !== filters.department) return false;
      if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
      if (filters.itemName && item.itemName !== filters.itemName) return false;

      return true;
    });
  }, [data, filters]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const toggleSelect = (item) => {
    const key = `${item.id}-${item.itemCount}`;
    if (selectedIds.includes(key)) {
      setSelectedIds(prev => prev.filter(k => k !== key));
      const newEdits = { ...rowEdits };
      delete newEdits[key];
      setRowEdits(newEdits);
    } else {
      setSelectedIds(prev => [...prev, key]);
      setRowEdits(prev => ({
        ...prev,
        [key]: { status: 'APPROVED', remarks: '', qty: item.itemQty || 1 }
      }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds([]);
      setRowEdits({});
    } else {
      const allKeys = paginatedData.map(i => `${i.id}-${i.itemCount}`);
      setSelectedIds(allKeys);
      const newEdits = {};
      allKeys.forEach(k => {
        const item = paginatedData.find(i => `${i.id}-${i.itemCount}` === k);
        newEdits[k] = { status: 'APPROVED', remarks: '', qty: item?.itemQty || 1 };
      });
      setRowEdits(newEdits);
    }
  };

  const handleEditChange = (key, field, value) => {
    setRowEdits(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const tableHeaders = [
    <button onClick={toggleSelectAll} className="text-indigo-600 hover:text-indigo-800 transition-colors">
      {selectedIds.length === paginatedData.length && paginatedData.length > 0 ? (
        <CheckSquare size={18} />
      ) : (
        <Square size={18} />
      )}
    </button>,
    "Approve Status",
    <div className="w-[300px] text-left">Remarks</div>,
    "Serial No",
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
    const key = `${item.id}-${item.itemCount}`;
    const isSelected = selectedIds.includes(key);
    return (
      <tr key={key} className={`transition-colors ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50/50'}`}>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <button onClick={() => toggleSelect(item)} className={`${isSelected ? 'text-indigo-600' : 'text-gray-300'} hover:text-indigo-500 transition-colors`}>
            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
        </td>
        <td className="px-4 py-2.5 whitespace-nowrap">
          <select
            disabled={!isSelected}
            value={rowEdits[key]?.status || 'APPROVED'}
            onChange={(e) => handleEditChange(key, 'status', e.target.value)}
            className={`w-full text-[11px] rounded border h-[28px] focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none px-2 transition-all ${
              !isSelected ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-indigo-200 text-indigo-700 font-bold'
            }`}
          >
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECT</option>
          </select>
        </td>
        <td className="px-4 py-2.5 whitespace-nowrap w-[300px]">
          <input
            disabled={!isSelected}
            type="text"
            placeholder={isSelected ? "Enter remarks..." : "Select to enter"}
            value={rowEdits[key]?.remarks || ''}
            onChange={(e) => handleEditChange(key, 'remarks', e.target.value)}
            className={`w-full text-[11px] rounded border px-3 py-1 h-[28px] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
              !isSelected ? 'bg-gray-50 border-gray-200 text-gray-400 italic' : 'bg-white border-indigo-200 text-gray-700'
            }`}
          />
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-indigo-600 font-medium whitespace-nowrap">{item.serialNo}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <input
            disabled={!isSelected}
            type="number"
            value={rowEdits[key]?.qty ?? (item.itemQty || 1)}
            onChange={(e) => handleEditChange(key, 'qty', e.target.value)}
            className={`w-[70px] text-center text-xs font-bold rounded border px-2 py-1 h-[28px] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
              !isSelected ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-indigo-200 text-indigo-700'
            }`}
          />
        </td>
        <td className="px-4 py-2.5 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
        <td className="px-4 py-2.5 text-center text-[11px] text-gray-700 uppercase whitespace-nowrap">{item.firmName}</td>
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
    const key = `${item.id}-${item.itemCount}`;
    const isSelected = selectedIds.includes(key);
    return (
      <div key={key} className={`bg-white rounded-xl border p-4 space-y-3 shadow-sm transition-all ${isSelected ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => toggleSelect(item)} className={`${isSelected ? 'text-indigo-600' : 'text-gray-300'} transition-colors`}>
              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase">{item.itemName}</h4>
              <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-tight">{item.serialNo}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tight ${
            item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {item.indentStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-[11px] border-t border-gray-100 pt-3">
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Item Name</span>
            <span className="text-gray-900 font-bold">{item.itemName}</span>
          </div>
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Qty</span>
            <div className="flex items-center gap-2">
              <input
                disabled={!isSelected}
                type="number"
                value={rowEdits[key]?.qty ?? (item.itemQty || 1)}
                onChange={(e) => handleEditChange(key, 'qty', e.target.value)}
                className={`w-[60px] text-[11px] font-bold rounded border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                  !isSelected ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-indigo-200 text-indigo-700'
                }`}
              />
              <span className="text-gray-500 font-medium uppercase text-[10px]">{item.uom}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Firm</span>
            <span className="text-gray-700 font-medium">{item.firmName}</span>
          </div>
          <div>
            <span className="text-gray-400 block uppercase text-[9px]">Department</span>
            <span className="text-gray-700 font-medium">{item.department}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400 block uppercase text-[9px]">Indenter</span>
            <span className="text-gray-700">{item.indenterName}</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
           <div className="flex flex-col gap-1">
            <span className="text-gray-400 uppercase text-[9px] font-bold">Approve Status</span>
            <select
              disabled={!isSelected}
              value={rowEdits[key]?.status || 'APPROVED'}
              onChange={(e) => handleEditChange(key, 'status', e.target.value)}
              className={`w-full text-xs rounded-lg border h-[36px] px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all ${
                !isSelected ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-indigo-200 text-indigo-700 font-bold'
              }`}
            >
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECT</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 uppercase text-[9px] font-bold">Remarks</span>
            <input
              disabled={!isSelected}
              type="text"
              placeholder={isSelected ? "Enter remarks..." : "Select to enter"}
              value={rowEdits[key]?.remarks || ''}
              onChange={(e) => handleEditChange(key, 'remarks', e.target.value)}
              className={`w-full text-xs rounded-lg border px-3 h-[36px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                !isSelected ? 'bg-gray-50 border-gray-200 text-gray-400 italic' : 'bg-white border-indigo-200 text-gray-700'
              }`}
            />
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
