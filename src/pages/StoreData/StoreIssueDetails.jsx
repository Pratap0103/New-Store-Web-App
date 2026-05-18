import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Calendar, User, Shield, Warehouse, HelpCircle, Printer } from 'lucide-react';
import { getStoreIssues } from '../../utils/storageManager';
import toast from 'react-hot-toast';

export default function StoreIssueDetails() {
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    // Parse ID from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
      const records = getStoreIssues();
      const match = records.find(r => r.id === id || String(r.id) === String(id));
      setIssue(match || null);
    }
  }, []);

  const handlePrint = () => {
    if (issue) {
      toast.success(`Printing Issue Slip ${issue.id} details...`);
    }
  };

  if (!issue) {
    return (
      <div className="p-8 text-center space-y-4">
        <HelpCircle size={48} className="text-gray-400 mx-auto" />
        <h3 className="text-lg font-black text-slate-800">Issue Slip Not Found</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">The requested material issue slip could not be found or has been removed from local storage.</p>
        <a
          href="/store-issue"
          className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-black text-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Issue Slips</span>
        </a>
      </div>
    );
  }

  const formattedDate = issue.date ? new Date(issue.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-4 max-w-4xl mx-auto">
      
      {/* Top action header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 px-2 md:px-0">
        <a
          href="/store-issue"
          className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Issues List</span>
        </a>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded border hover:bg-slate-100 transition-all font-semibold text-xs shadow-sm"
        >
          <Printer size={14} />
          <span>Print Slip</span>
        </button>
      </div>

      {/* Main visual summary card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Banner metadata */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Material Issue Slip</span>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{issue.id}</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 shadow-sm">
            Dispatched & Issued
          </span>
        </div>

        {/* High-fidelity grid parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Issue Date</span>
              <span className="text-sm font-bold text-gray-800">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
              <User size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Issued To</span>
              <span className="text-sm font-bold text-gray-800">{issue.issuedTo}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
              <Warehouse size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Site / Project</span>
              <span className="text-sm font-bold text-gray-800">{issue.projectName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
              <FileText size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Material Item</span>
              <span className="text-sm font-bold text-gray-800">{issue.itemName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
              <Warehouse size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Quantity Issued</span>
              <span className="text-sm font-black text-slate-900">{issue.qty} {issue.uom}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Authorized By</span>
              <span className="text-sm font-bold text-gray-800">{issue.authorizedBy}</span>
            </div>
          </div>

        </div>

        {/* Remarks Box */}
        <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl space-y-1">
          <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Remarks / Purpose</span>
          <p className="text-xs md:text-sm font-medium text-gray-600">{issue.remarks || 'No detailed remarks registered for this material issue slip.'}</p>
        </div>

        {/* Activity Process History */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Process Timeline</h3>
          
          <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-5">
            {[
              ['Material Requested', 'Authorized by Project Lead for requisition', formattedDate, true],
              ['GRN Inventory Verified', 'Sufficient stock verified in stores bin A-4', formattedDate, true],
              ['Material Dispatched', `Issued and physically loaded to ${issue.issuedTo}`, formattedDate, true]
            ].map(([title, desc, date, isDone]) => (
              <div key={title} className="relative">
                <div className="absolute -left-[31px] top-0 bg-green-500 rounded-full h-4 w-4 border-2 border-white shadow-sm flex items-center justify-center" />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">{title}</span>
                  <span className="text-[10px] text-gray-500 block">{desc}</span>
                  <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wide mt-0.5">{date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
