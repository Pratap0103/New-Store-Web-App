import React, { useState, useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import DataTable from '../../components/DataTable';

export default function FrightHistory({ data, filters }) {
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
          item.indentNo?.toLowerCase().includes(q) ||
          item.projectName?.toLowerCase().includes(q) ||
          item.vendorName?.toLowerCase().includes(q)
        );
      }
      return true;
    }).reverse();
  }, [data, filters]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const headers = [
    "Timestamp", "Indent Number", "Project Name", "Vendor Name", "Product Name", 
    "Qty", "Actual Date", "Vehicle Number", "Bilty Number", "Freight Amount", "Bilty Image"
  ];

  const renderRow = (item, idx) => (
    <tr key={idx} className="hover:bg-gray-50/50 transition-all text-center">
      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-medium text-gray-500">
        {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase">{item.indentNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-indigo-600 uppercase">{item.projectName}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase truncate max-w-[150px]">{item.vendorName}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-700 uppercase truncate max-w-[150px]">{item.items?.[0]?.productName}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-black text-gray-700">{item.items?.[0]?.liftQty}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-500">
        {item.freightPaidAt ? new Date(item.freightPaidAt).toLocaleDateString() : '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-800 uppercase">{item.freightData?.vehicleNumber || item.vehicleNo}</td>
      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-800 uppercase">{item.freightData?.biltyNumber || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] font-black text-green-700">₹{parseFloat(item.freightData?.freightAmount || item.frightAmount || 0).toLocaleString()}</td>
      <td className="px-4 py-3 whitespace-nowrap">
         <ImageIcon size={14} className="mx-auto text-indigo-400 hover:text-indigo-600 cursor-pointer" />
      </td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.indentNo}</span>
          <h4 className="text-sm font-bold text-gray-900 uppercase leading-tight">{item.projectName}</h4>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[9px] font-black uppercase">Paid</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[10px]">
        <div className="flex flex-col">
          <span className="text-gray-400 font-bold uppercase">Vehicle</span>
          <span className="font-bold text-gray-700 uppercase">{item.freightData?.vehicleNumber || item.vehicleNo}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 font-bold uppercase">Bilty</span>
          <span className="font-bold text-gray-700 uppercase">{item.freightData?.biltyNumber || '-'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <DataTable 
      headers={headers}
      data={paginatedData}
      renderRow={renderRow}
      renderCard={renderCard}
      minWidth="min-w-[1500px]"
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      totalResults={filteredData.length}
    />
  );
}
