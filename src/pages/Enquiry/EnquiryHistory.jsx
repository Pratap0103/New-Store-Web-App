import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, History as HistoryIcon } from 'lucide-react';
import { getQuotationHistory } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import toast from 'react-hot-toast';

export default function EnquiryHistory() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuotation, setExpandedQuotation] = useState(null);
  
  // Modal for supplier details
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    setHistory(getQuotationHistory());
  }, []);

  const handleClearFilters = () => setSearchQuery('');

  // Group history items by quotation number
  const groupedData = useMemo(() => {
    const groups = {};
    
    // Filter history based on search
    const filtered = history.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.quatationNo || '').toLowerCase().includes(q) ||
        (item.supplierName || '').toLowerCase().includes(q) ||
        (item.indentNo || '').toLowerCase().includes(q) ||
        (item.product || '').toLowerCase().includes(q) ||
        (item.firm || '').toLowerCase().includes(q)
      );
    });

    filtered.forEach(row => {
      const key = row.quatationNo || 'QT-UNKNOWN';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return Object.entries(groups).map(([quatationNo, items]) => {
      const suppliers = Array.from(new Set(items.map(i => i.supplierName)));
      
      return {
        quatationNo,
        items,
        timestamp: items[0].timestamp || new Date().toISOString(),
        supplierName: suppliers.length > 1 ? `${suppliers.length} Suppliers` : suppliers[0],
        allSuppliers: suppliers,
        firm: items[0].firm || 'Botivate Services',
        pdfLink: items[0].pdfLink || '#'
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, searchQuery]);

  const toggleExpand = (quotationNo) => {
    setExpandedQuotation(expandedQuotation === quotationNo ? null : quotationNo);
  };

  const handleViewPdf = (e, link) => {
    e.stopPropagation();
    toast.success('Opening Enquiry PDF Copy...');
    window.open(link, '_blank');
  };

  const headers = [
    '', 'Date', 'Enquiry No', 'Supplier', 'FIRM Name', 'Items Count', 'Action'
  ];

  const renderRow = (group, index) => {
    const formattedDate = group.timestamp ? new Date(group.timestamp).toLocaleDateString('en-GB') : 'N/A';
    const isExpanded = expandedQuotation === group.quatationNo;

    return (
      <React.Fragment key={group.quatationNo}>
        <tr 
          onClick={() => toggleExpand(group.quatationNo)}
          className="hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-gray-100 font-medium text-slate-700"
        >
          <td className="px-4 py-2.5 text-center text-gray-400">
            {isExpanded ? <ChevronUp size={15} className="text-indigo-600" /> : <ChevronDown size={15} />}
          </td>
          <td className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">{formattedDate}</td>
          <td className="px-4 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{group.quatationNo}</td>
          <td className="px-4 py-2.5 text-center whitespace-nowrap">
            <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
              {group.supplierName}
            </span>
          </td>
          <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[170px] truncate" title={group.firm}>{group.firm}</td>
          <td className="px-4 py-2.5 text-center text-xs font-black text-slate-800 whitespace-nowrap">{group.items.length} Product(s)</td>
          <td className="px-4 py-2.5 text-center">
            <button
              onClick={(e) => handleViewPdf(e, group.pdfLink)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 hover:bg-indigo-600 hover:text-white transition font-black text-[9px] uppercase shadow-sm"
            >
              <FileText size={11} />
              <span>View PDF</span>
            </button>
          </td>
        </tr>

        {/* Row expansion: displays items & vendor bids */}
        {isExpanded && (
          <tr className="bg-slate-50/50">
            <td colSpan={7} className="px-6 py-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
                <div className="bg-slate-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Supplier RFQ Bid Sessions</span>
                  <span className="text-[9px] text-gray-400 font-medium">Click View Details to view offered item rates</span>
                </div>
                
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-2">Supplier Name</th>
                      <th className="px-4 py-2 text-center">Material Count</th>
                      <th className="px-4 py-2 text-center">Response Status</th>
                      <th className="px-4 py-2 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.allSuppliers.map((supplierName, idx) => {
                      const supplierItems = group.items.filter(i => i.supplierName === supplierName);
                      const hasResponded = supplierItems.some(i => i.responded_at || i.vendor_rate);
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50 border-b border-gray-100 last:border-0 transition">
                          <td className="px-4 py-2 text-xs font-black text-slate-800 uppercase tracking-tight">{supplierName}</td>
                          <td className="px-4 py-2 text-center text-xs font-bold text-gray-500">{supplierItems.length} items</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${hasResponded ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'}`}>
                              {hasResponded ? 'Responded' : 'Awaiting Bid'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right pr-4">
                            <button
                              onClick={() => setSelectedBid({
                                supplierName,
                                quotationNo: group.quatationNo,
                                items: supplierItems
                              })}
                              className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 rounded transition shadow-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderCard = (group, index) => {
    const formattedDate = group.timestamp ? new Date(group.timestamp).toLocaleDateString('en-GB') : 'N/A';
    
    return (
      <div key={group.quatationNo} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-indigo-600 font-black block uppercase tracking-wider">{group.quatationNo}</span>
            <span className="text-xs font-extrabold text-slate-800">{group.supplierName}</span>
          </div>
          <button
            onClick={(e) => handleViewPdf(e, group.pdfLink)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 rounded-lg transition"
          >
            <FileText size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Enquiry Date</span>
            <span className="font-bold text-gray-700 block">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Items Count</span>
            <span className="font-bold text-gray-700 block">{group.items.length} Product(s)</span>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">FIRM Name</span>
            <span className="font-bold text-gray-700 block truncate">{group.firm}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => toggleExpand(group.quatationNo)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition font-black text-[9px] uppercase"
          >
            {expandedQuotation === group.quatationNo ? 'Collapse Bids' : 'View Supplier Bids'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0 overflow-hidden">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 pb-2 border-b border-gray-100 px-2 md:px-0 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <HistoryIcon size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">Enquiry History</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Review sent quotation requests and rates</p>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-2.5 top-[9px] text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search history records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs h-[32px] shadow-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Datatable Container */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          headers={headers}
          data={groupedData}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1100px"
          currentPage={1}
          totalPages={1}
          itemsPerPage={50}
          onPageChange={() => {}}
          onItemsPerPageChange={() => {}}
          totalResults={groupedData.length}
        />
      </div>

      {/* Supplier Bid offered rates details Modal popup */}
      {selectedBid && (
        <ModalForm
          isOpen={true}
          onClose={() => setSelectedBid(null)}
          title={`RFQ Bid Details: ${selectedBid.supplierName}`}
        >
          <div className="space-y-4">
            
            <div className="border border-indigo-50 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="px-4 py-3">SR.</th>
                    <th className="px-4 py-3 text-center">Indent No</th>
                    <th className="px-4 py-3">Material Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-center">Unit</th>
                    <th className="px-4 py-3 text-right pr-6">Offered Rate (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBid.items.map((item, idx) => {
                    const isQuoted = item.vendor_rate || item.responded_at;
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 border-b border-gray-100 last:border-0 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 text-center text-xs font-black text-indigo-600">{item.indentNo}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-black text-slate-800">{item.product}</div>
                          {item.description && (
                            <div className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{item.description}</div>
                          )}
                          <div className="text-[9px] text-indigo-500 font-extrabold uppercase mt-1 tracking-tighter">{item.firm}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-black text-gray-700">{item.qty}</td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">{item.unit}</td>
                        <td className="px-4 py-3 text-right pr-6 font-black text-slate-800">
                          {isQuoted ? (
                            <span className="text-emerald-600">₹{Number(item.vendor_rate || 420).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-red-500 italic text-[11px]">Not Quote</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedBid(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-black text-xs uppercase tracking-wider"
              >
                Close Details
              </button>
            </div>

          </div>
        </ModalForm>
      )}

    </div>
  );
}
