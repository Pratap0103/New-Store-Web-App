import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';

export default function HODCheckHistory({ data, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.fromDate || filters.toDate) {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.poNumber?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q) ||
          item.indentNo?.toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const headers = [
    "Lift No.", "Indent No", "Item No", "Product", "HOD Status", "Remark", "Approved Date"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-gray-50/50 transition-all text-center">
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-indigo-600 uppercase">{item.liftNumber || item.id?.slice(-6)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase">{item.indentNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-400 uppercase">#1</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-gray-800 uppercase truncate max-w-[200px]">{item.items?.[0]?.productName}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.hodStatus === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {item.hodStatus}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-gray-600 italic truncate max-w-[250px]">{item.hodRemark || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-500">
        {item.hodApprovedAt ? new Date(item.hodApprovedAt).toLocaleDateString() : '-'}
      </td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.poNumber}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight">{item.items?.[0]?.productName}</h4>
        </div>
        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${item.hodStatus === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {item.hodStatus}
        </span>
      </div>
      <div className="space-y-1 pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 italic font-medium">"{item.hodRemark}"</p>
        <p className="text-[10px] text-gray-500 font-bold">{item.hodApprovedAt ? new Date(item.hodApprovedAt).toLocaleDateString() : '-'}</p>
      </div>
    </div>
  );

  return (
    <DataTable 
      headers={headers}
      data={paginatedData}
      renderRow={renderRow}
      renderCard={renderCard}
      minWidth="min-w-[1000px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredData.length}
    />
  );
}
