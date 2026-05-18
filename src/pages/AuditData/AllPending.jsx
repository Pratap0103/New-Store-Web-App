import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw, BarChart2, Package2, ShieldCheck, Eye } from 'lucide-react';
import { getTallyEntries } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import ModalView from '../../components/ModalView';

export default function AllPending() {
  const [records, setRecords] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [filters, setFilters] = useState({ searchQuery: '', fromDate: '', toDate: '', currentStage: 'ALL' });

  useEffect(() => {
    setRecords(getTallyEntries());
  }, []);

  const handleClearFilters = () =>
    setFilters({ searchQuery: '', fromDate: '', toDate: '', currentStage: 'ALL' });

  // Filter logic
  const filteredData = useMemo(() => {
    return records.filter(item => {
      // Exclude completed items
      if (item.isCompleted) return false;

      // Filter by stage
      if (filters.currentStage !== 'ALL' && item.currentStage !== filters.currentStage) return false;

      // Filter by date
      if (filters.fromDate || filters.toDate) {
        const itemDate = item.plannedDate ? item.plannedDate.substring(0, 10) : '';
        if (filters.fromDate && itemDate < filters.fromDate) return false;
        if (filters.toDate && itemDate > filters.toDate) return false;
      }

      // Filter by search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          (item.indentNumber || '').toLowerCase().includes(q) ||
          (item.poNumber || '').toLowerCase().includes(q) ||
          (item.productName || '').toLowerCase().includes(q) ||
          (item.partyName || '').toLowerCase().includes(q) ||
          (item.billNo || '').toLowerCase().includes(q) ||
          (item.firmNameMatch || '').toLowerCase().includes(q)
        );
      }

      return true;
    }).reverse();
  }, [records, filters]);

  // Stage pending counts
  const stats = useMemo(() => {
    const active = records.filter(r => !r.isCompleted);
    return {
      total: active.length,
      audit: active.filter(r => r.currentStage === 'AUDIT').length,
      rectify: active.filter(r => r.currentStage === 'RECTIFY').length,
      reaudit: active.filter(r => r.currentStage === 'REAUDIT').length,
      tally: active.filter(r => r.currentStage === 'TALLY_ENTRY').length,
      again: active.filter(r => r.currentStage === 'AGAIN_AUDIT').length,
    };
  }, [records]);

  const headers = [
    'Action', 'Timestamp', 'PO Number', 'Party Name', 'Product Name', 'Bill No.',
    'Planned Date', 'Current Stage', 'Total Qty', 'Total Amt', 'Location', 'HOD Status'
  ];

  const getStageBadge = (stage) => {
    const badges = {
      AUDIT: 'bg-amber-100 text-amber-800 border-amber-200',
      RECTIFY: 'bg-blue-100 text-blue-800 border-blue-200',
      REAUDIT: 'bg-purple-100 text-purple-800 border-purple-200',
      TALLY_ENTRY: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      AGAIN_AUDIT: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    const labels = {
      AUDIT: 'Audit Data',
      RECTIFY: 'Rectify Mistake',
      REAUDIT: 'Reaudit Data',
      TALLY_ENTRY: 'Tally Entry',
      AGAIN_AUDIT: 'Again Audit',
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${badges[stage] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[stage] || stage}
      </span>
    );
  };

  const renderRow = (item, index) => {
    const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-GB') : '-';
    const plannedDateStr = item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('en-GB') : '-';

    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-2.5 text-center">
          <button
            onClick={() => setViewingItem(item)}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-semibold text-[11px] mx-auto shadow-sm"
          >
            <Eye size={13} />
            <span>View</span>
          </button>
        </td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 whitespace-nowrap">{formattedDate}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-indigo-600 whitespace-nowrap">{item.poNumber || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 max-w-[150px] truncate" title={item.partyName}>{item.partyName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 max-w-[160px] truncate" title={item.productName}>{item.productName || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{item.billNo || '-'}</td>
        <td className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">{plannedDateStr}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">{getStageBadge(item.currentStage)}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-gray-800 whitespace-nowrap">{item.qty}</td>
        <td className="px-4 py-2.5 text-center text-xs font-black text-emerald-600 whitespace-nowrap">₹{Number(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 truncate max-w-[120px]" title={item.location}>{item.location || '-'}</td>
        <td className="px-4 py-2.5 text-center whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.hodStatus === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
            {item.hodStatus || 'Pending'}
          </span>
        </td>
      </tr>
    );
  };

  const renderCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">PO Number</span>
            <span className="text-xs font-extrabold text-indigo-600">{item.poNumber || '-'}</span>
          </div>
          <div>
            {getStageBadge(item.currentStage)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Product Name</span>
            <span className="font-bold text-gray-700 truncate block max-w-[150px]" title={item.productName}>{item.productName || '-'}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Party Name</span>
            <span className="font-bold text-gray-700 truncate block max-w-[150px]" title={item.partyName}>{item.partyName || '-'}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Total Amount</span>
            <span className="font-black text-emerald-600">₹{Number(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase">Quantity</span>
            <span className="font-black text-gray-800">{item.qty}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 font-bold uppercase">HOD: <strong className={item.hodStatus === 'Approved' ? 'text-green-600' : 'text-amber-600'}>{item.hodStatus || 'Pending'}</strong></span>
          <button
            onClick={() => setViewingItem(item)}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-semibold text-[10px]"
          >
            <Eye size={12} />
            <span>Details</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-2 md:space-y-3 flex flex-col h-full min-h-0 bg-slate-50/20">
      {/* Header and Stats */}
      <div className="px-2 md:px-0 space-y-3 pt-1">
        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'All Pending', count: stats.total, color: 'border-slate-200 text-slate-700 bg-slate-50/50', key: 'ALL' },
            { label: 'Audit stage', count: stats.audit, color: 'border-amber-200 text-amber-700 bg-amber-50/30', key: 'AUDIT' },
            { label: 'Rectify stage', count: stats.rectify, color: 'border-blue-200 text-blue-700 bg-blue-50/30', key: 'RECTIFY' },
            { label: 'Reaudit stage', count: stats.reaudit, color: 'border-purple-200 text-purple-700 bg-purple-50/30', key: 'REAUDIT' },
            { label: 'Tally Entry', count: stats.tally, color: 'border-cyan-200 text-cyan-700 bg-cyan-50/30', key: 'TALLY_ENTRY' },
            { label: 'Again Audit', count: stats.again, color: 'border-rose-200 text-rose-700 bg-rose-50/30', key: 'AGAIN_AUDIT' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilters({ ...filters, currentStage: stat.key })}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all shadow-sm ${stat.color} ${filters.currentStage === stat.key ? 'ring-2 ring-indigo-500 scale-[1.02] bg-white font-extrabold' : 'hover:scale-[1.01] bg-white'}`}
            >
              <span className="text-[9px] font-black uppercase tracking-wider opacity-80">{stat.label}</span>
              <span className="text-lg md:text-2xl font-black mt-1 tracking-tight">{stat.count}</span>
            </button>
          ))}
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row w-full gap-2 items-center">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by Indent, PO, Party, Product..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-xs md:text-sm h-[38px] shadow-sm font-medium"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[38px] w-[38px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-300 text-gray-600'}`}
            >
              <Filter size={14} />
            </button>
            <button
              onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[38px] w-[38px] flex-shrink-0"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto lg:flex-[8] items-center`}>
            {['From Date', 'To Date'].map((ph, idx) => (
              <div key={ph} className="flex-1 w-full relative">
                <Calendar className="absolute left-2.5 top-[12px] text-gray-400 pointer-events-none" size={14} />
                <input
                  type="text"
                  placeholder={ph}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                  value={idx === 0 ? filters.fromDate : filters.toDate}
                  onChange={(e) => setFilters({ ...filters, [idx === 0 ? 'fromDate' : 'toDate']: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[38px] shadow-sm font-medium"
                />
              </div>
            ))}
            <button
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded w-[38px] h-[38px] hover:bg-gray-100 shadow-sm"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          headers={headers}
          data={filteredData}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1300px"
          currentPage={1}
          totalPages={1}
          itemsPerPage={50}
          onPageChange={() => {}}
          onItemsPerPageChange={() => {}}
          totalResults={filteredData.length}
        />
      </div>

      {/* View Detail Modal Overlay */}
      {viewingItem && (
        <ModalView isOpen={true} onClose={() => setViewingItem(null)} title="Audit Record Details" maxWidth="max-w-2xl">
          <div className="space-y-4 px-1">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <Package2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Shipment Information</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">PO Number</span>
                <span className="text-xs font-black text-indigo-600">{viewingItem.poNumber || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {[
                ['Indent Number', viewingItem.indentNumber],
                ['Project Name', viewingItem.firmNameMatch],
                ['Product Name', viewingItem.productName],
                ['Party Name', viewingItem.partyName],
                ['Bill Number', viewingItem.billNo],
                ['Bill Quantity', viewingItem.qty],
                ['Bill Amount', `₹${Number(viewingItem.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                ['Delivery Location', viewingItem.location],
                ['HOD Status', viewingItem.hodStatus],
                ['HOD Remarks', viewingItem.hodRemark || 'No HOD remarks'],
                ['Physical Condition', viewingItem.damageOrder || 'Verified'],
                ['Quantity Match', viewingItem.quantityAsPerBill || 'Verified'],
              ].map(([lbl, val]) => (
                <div key={lbl} className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">{lbl}</span>
                  <span className="text-[11px] font-bold text-gray-700 block break-words">{val || '-'}</span>
                </div>
              ))}
            </div>

            {/* Stage Timeline Tracks */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Audit Stages History
              </h4>

              <div className="space-y-2">
                {[
                  { name: 'Stage 1: Audit Data', status: viewingItem.status1, remarks: viewingItem.remarks1, date: viewingItem.actual1 },
                  { name: 'Stage 2: Rectify Mistake', status: viewingItem.status2, remarks: viewingItem.remarks2, date: viewingItem.actual2 },
                  { name: 'Stage 3: Reaudit Data', status: viewingItem.status3, remarks: viewingItem.remarks3, date: viewingItem.actual3 },
                  { name: 'Stage 4: Tally Entry', status: viewingItem.status4, remarks: viewingItem.remarks4, date: viewingItem.actual4 },
                  { name: 'Stage 5: Again Audit', status: viewingItem.status5, remarks: viewingItem.remarks5, date: viewingItem.actual5 }
                ].map((stg, i) => {
                  const hasDone = stg.status;
                  return (
                    <div key={i} className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-2 transition ${hasDone ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                      <div>
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-tight block">{stg.name}</span>
                        {stg.remarks && <p className="text-[10px] text-gray-500 font-semibold italic mt-0.5">Remarks: {stg.remarks}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {stg.date && <span className="text-[9px] font-bold text-gray-400">{new Date(stg.date).toLocaleDateString('en-GB')}</span>}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${stg.status === 'Done' || stg.status === 'okay' ? 'bg-green-100 text-green-700' : (stg.status ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}`}>
                          {stg.status || 'Not Started'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalView>
      )}
    </div>
  );
}
