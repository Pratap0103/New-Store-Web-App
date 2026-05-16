import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, X, Calendar, 
  ChevronLeft, ChevronRight, FileText, Download, Info, ExternalLink
} from 'lucide-react';
import { getPOs } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import POPdf from '../CreatePO/POPdf';

export default function POHistory() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    searchQuery: '',
    fromDate: '',
    toDate: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    setPOs(getPOs());
  }, []);

  const filteredPOs = pos.filter(po => {
    // Date filter logic
    if (filters.fromDate || filters.toDate) {
      const poDate = po.poDate.split('T')[0];
      if (filters.fromDate && poDate < filters.fromDate) return false;
      if (filters.toDate && poDate > filters.toDate) return false;
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  }).reverse();

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const paginatedPOs = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePdfView = (po) => {
    setSelectedPO(po);
    setShowPdfModal(true);
  };

  const tableHeaders = [
    "PO Number", "PO Copy (Pdf)", "Firm Name", "Vendor Name", "Amount"
  ];

  const renderRow = (po, idx) => (
    <tr key={po.id} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-100">
      <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-600 whitespace-nowrap">
        {po.poNumber}
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <button 
          onClick={() => handlePdfView(po)}
          className="text-indigo-600 hover:text-indigo-800 flex justify-center w-full transition-transform active:scale-90"
          title="View PDF"
        >
          <FileText size={18} />
        </button>
      </td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-700 uppercase whitespace-nowrap">
        {po.companyName || 'Botivate'}
      </td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-700 uppercase whitespace-nowrap">
        {po.supplierName}
      </td>
      <td className="px-4 py-3 text-center text-xs font-medium text-gray-900 whitespace-nowrap">
        ₹{parseFloat(po.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const renderCard = (po, idx) => (
    <div key={po.id} className="bg-white rounded-lg border border-indigo-50 shadow-sm p-3 space-y-3">
      <div className="flex justify-between items-start border-b border-gray-100 pb-2">
        <div>
          <span className="text-[9px] text-indigo-500 uppercase tracking-widest leading-none block mb-1">
            {new Date(po.poDate).toLocaleDateString('en-GB')}
          </span>
          <h4 className="text-xs font-bold text-indigo-600 uppercase leading-tight">{po.poNumber}</h4>
        </div>
        <div className="text-right">
            <span className="text-[8px] text-gray-400 uppercase tracking-tighter block leading-none mb-0.5">Total Amount</span>
            <span className="text-xs font-bold text-gray-900">₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-tighter text-[8px]">Firm Name</span>
          <span className="text-xs text-gray-700 font-medium uppercase truncate">{po.companyName || 'Botivate'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-tighter text-[8px]">Vendor Name</span>
          <span className="text-xs text-gray-700 font-medium uppercase truncate">{po.supplierName}</span>
        </div>
      </div>

      <button 
        onClick={() => handlePdfView(po)}
        className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 border border-indigo-100 active:scale-95 transition-all"
      >
        <FileText size={14} /> View PO Copy
      </button>
    </div>
  );

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      {/* Header / Filters Only */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4 w-full pb-2 border-b border-gray-100 px-2 md:px-0">
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search PO History..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
            <button
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'grid' : 'hidden'} lg:flex grid-cols-2 gap-2 w-full lg:w-auto lg:flex-[1.5] items-center`}>
             <input
               type="date"
               value={filters.fromDate}
               onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
               className="w-full bg-white border border-gray-300 rounded-lg lg:rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-sm h-[32px] md:h-[38px]"
             />
             <input
               type="date"
               value={filters.toDate}
               onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
               className="w-full bg-white border border-gray-300 rounded-lg lg:rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-sm h-[32px] md:h-[38px]"
             />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <DataTable
          headers={tableHeaders}
          data={paginatedPOs}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="800px"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalResults={filteredPOs.length}
        />
      </div>

      {/* PDF Modal */}
      {showPdfModal && selectedPO && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPO.poNumber}</h3>
                  <p className="text-xs text-gray-500">{selectedPO.supplierName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PDFDownloadLink
                  document={
                    <POPdf 
                      {...selectedPO}
                      supplierEmail={selectedPO.companyEmail}
                      items={selectedPO.items.map(it => ({
                        ...it,
                        product: it.productName,
                        qty: it.quantity,
                        amount: it.rate * it.quantity
                      }))}
                      companyAddress="123, Business Park, Mumbai"
                      companyPhone="+91 9876543210"
                      companyGstin="27ABCDE1234F1Z5"
                      companyPan="ABCDE1234F"
                      supplierGstin={selectedPO.gstin}
                      deliveryDate={new Date(new Date(selectedPO.poDate).getTime() + 7 * 86400000).toLocaleDateString('en-GB')}
                      projectName="Botivate New Store"
                      deliveryAddress="Warehouse 1, Mumbai, Maharashtra"
                    />
                  }
                  fileName={`${selectedPO.poNumber.replace(/\//g, '-')}.pdf`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-200"
                >
                  {({ loading }) => (
                    loading ? 'Generating...' : <><Download size={16} /> Download PDF</>
                  )}
                </PDFDownloadLink>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-4">
                <PDFViewer className="w-full h-full rounded-xl border border-gray-200 shadow-inner">
                    <POPdf 
                      {...selectedPO}
                      supplierEmail={selectedPO.companyEmail}
                      items={selectedPO.items.map(it => ({
                        ...it,
                        product: it.productName,
                        qty: it.quantity,
                        amount: it.rate * it.quantity
                      }))}
                      companyAddress="123, Business Park, Mumbai"
                      companyPhone="+91 9876543210"
                      companyGstin="27ABCDE1234F1Z5"
                      companyPan="ABCDE1234F"
                      supplierGstin={selectedPO.gstin}
                      deliveryDate={new Date(new Date(selectedPO.poDate).getTime() + 7 * 86400000).toLocaleDateString('en-GB')}
                      projectName="Botivate New Store"
                      deliveryAddress="Warehouse 1, Mumbai, Maharashtra"
                    />
                </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
