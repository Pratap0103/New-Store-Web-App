import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, X, Calendar, 
  ChevronLeft, ChevronRight, FileText, Download, Info
} from 'lucide-react';
import { getIndents } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function CreatedHistory() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [indents, setIndents] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    searchQuery: '',
    fromDate: '',
    toDate: '',
    status: '',
    firm: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    setIndents(getIndents());
  }, []);

  // Flatten indents for table display
  const flattenedIndents = indents.flatMap(indent => 
    indent.items.map(item => ({
      ...indent,
      ...item,
      indentId: indent.id 
    }))
  ).reverse();

  const filteredIndents = flattenedIndents.filter(item => {
    if (filters.status && item.indentStatus !== filters.status) return false;
    if (filters.firm && item.firmName !== filters.firm) return false;
    
    // Date filter logic
    if (filters.fromDate || filters.toDate) {
      const [datePart] = item.timestamp.split(' ');
      const [d, m, y] = datePart.split('/');
      const itemDate = `${y}-${m}-${d}`;
      
      if (filters.fromDate && itemDate < filters.fromDate) return false;
      if (filters.toDate && itemDate > filters.toDate) return false;
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        item.serialNo.toLowerCase().includes(q) ||
        item.firmName.toLowerCase().includes(q) ||
        item.indenterName.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredIndents.length / itemsPerPage);
  const paginatedIndents = filteredIndents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImageView = (base64) => {
    setSelectedImage(base64);
    setShowImageModal(true);
  };

  const firms = Array.from(new Set(indents.map(i => i.firmName)));

  // Components for DataTable
  const tableHeaders = [
    "TimeStamp", "Serial No", "ItemCount", "Firm Name", "Indenter Name", 
    "Status", "Department", "Group-Head", "Item Name", "UOM", 
    "Area of Use", "Attachment", "Specification"
  ];

  const renderRow = (item, idx) => (
    <tr key={`${item.indentId}-${item.itemCount}`} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-100">
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.timestamp}</td>
      <td className="px-4 py-3 text-center text-xs text-indigo-600 whitespace-nowrap">{item.serialNo}</td>
      <td className="px-4 py-3 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-700 uppercase whitespace-nowrap">{item.firmName}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.indenterName}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
          item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {item.indentStatus}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-800 whitespace-nowrap">{item.itemName}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.areaOfUse}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        {item.attachment ? (
          <button 
            onClick={() => handleImageView(item.attachment)}
            className="text-indigo-600 hover:text-indigo-800 flex justify-center w-full"
          >
            <Eye size={16} />
          </button>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-left whitespace-nowrap">
        {item.specification ? (
          <InfoPopover items={[item.specification]} title="Item Specification">
            <span className="text-[11px] text-gray-500 flex items-center gap-1 cursor-help hover:text-indigo-600">
              <Info size={12} /> View Info
            </span>
          </InfoPopover>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={`${item.indentId}-${item.itemCount}`} className="bg-white rounded-lg border border-indigo-50 shadow-sm p-3 space-y-2">
      <div className="flex justify-between items-start border-b border-gray-100 pb-2">
        <div>
          <span className="text-[9px] text-indigo-500 uppercase tracking-widest leading-none block mb-1">{item.serialNo} / {item.itemCount}</span>
          <h4 className="text-xs text-gray-900 uppercase leading-tight">{item.itemName}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${
          item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {item.indentStatus}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-tighter text-[8px]">Firm Entity</span>
          <span className="text-gray-700 uppercase truncate">{item.firmName}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-tighter text-[8px]">Indenter Name</span>
          <span className="text-gray-700 uppercase truncate">{item.indenterName}</span>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100 text-[10px] space-y-1.5 shadow-inner">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Department</span>
          <span className="text-gray-800">{item.department}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Group Head</span>
          <span className="text-gray-800">{item.groupHead}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
          <span className="text-gray-500 font-medium">Area of Use</span>
          <span className="text-indigo-600 uppercase">{item.areaOfUse}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {item.attachment && (
          <button 
            onClick={() => handleImageView(item.attachment)}
            className="flex-1 bg-white border border-indigo-200 text-indigo-600 py-2 rounded-lg text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <Eye size={12} strokeWidth={3} /> Attachment
          </button>
        )}
        <div className="flex-1 text-center py-2 bg-slate-100 rounded-lg">
           <span className="text-[8px] text-gray-400 uppercase tracking-tighter block leading-none mb-0.5">Logged At</span>
           <span className="text-[10px] text-gray-600 whitespace-nowrap">{item.timestamp.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-2 md:space-y-6 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search History..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-sky-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
            <button
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'grid' : 'hidden'} lg:flex grid-cols-2 md:grid-cols-4 gap-2 w-full lg:w-auto lg:flex-[5] items-center`}>
             <input
               type="date"
               value={filters.fromDate}
               onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
               className="w-full bg-white border border-gray-300 rounded-lg lg:rounded px-2 py-1.5 focus:outline-none focus:border-sky-500 text-[11px] md:text-sm h-[32px] md:h-[38px]"
             />
             <input
               type="date"
               value={filters.toDate}
               onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
               className="w-full bg-white border border-gray-300 rounded-lg lg:rounded px-2 py-1.5 focus:outline-none focus:border-sky-500 text-[11px] md:text-sm h-[32px] md:h-[38px]"
             />
             <SearchableDropdown
               options={firms.map(f => ({ value: f, label: f }))}
               value={filters.firm}
               onChange={(val) => setFilters({ ...filters, firm: val })}
               placeholder="All Firms"
               className="w-full"
             />
             <SearchableDropdown
               options={[
                 { value: 'Critical', label: 'Critical' },
                 { value: 'Non-Critical', label: 'Non-Critical' }
               ]}
               value={filters.status}
               onChange={(val) => setFilters({ ...filters, status: val })}
               placeholder="All Status"
               className="w-full"
             />
          </div>
        </div>
      </div>

      {/* Main Content - Using DataTable */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <DataTable
          headers={tableHeaders}
          data={paginatedIndents}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1400px"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalResults={filteredIndents.length}
        />
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-2 relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200"
            >
              <X size={20} />
            </button>
            <div className="overflow-auto max-h-[85vh] rounded-xl">
              {selectedImage.startsWith('data:image/') ? (
                <img src={selectedImage} alt="Attachment" className="w-full h-auto" />
              ) : (
                <div className="p-10 text-center">
                  <FileText size={48} className="mx-auto text-indigo-200 mb-4" />
                  <p className="text-gray-600">Document Preview</p>
                  <a href={selectedImage} download className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                    <Download size={18} /> Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
