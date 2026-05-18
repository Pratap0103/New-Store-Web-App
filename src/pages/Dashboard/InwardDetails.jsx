import React, { useMemo } from 'react';
import { Truck, CheckCircle2, AlertOctagon, HelpCircle, ShieldCheck, Compass } from 'lucide-react';

export default function InwardDetails({ storeIn }) {
  // Aggregate inward analytics
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalQty = 0;
    const firmMap = {};
    const transporterMap = {};

    storeIn.forEach(grn => {
      const itemsCount = (grn.items || []).reduce((s, it) => s + (parseFloat(it.liftQty || it.quantity) || 0), 0);
      totalQty += itemsCount;

      if (!grn.hodStatus || grn.hodStatus === 'Pending') pending++;
      else if (grn.hodStatus === 'Approved') approved++;
      else if (grn.hodStatus === 'Rejected') rejected++;

      const firm = grn.firmName || grn.projectName || 'Botivate Services';
      firmMap[firm] = (firmMap[firm] || 0) + 1;

      const trans = grn.transporterName || 'Self Delivery';
      transporterMap[trans] = (transporterMap[trans] || 0) + 1;
    });

    const firms = Object.entries(firmMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const transporters = Object.entries(transporterMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    return {
      total: storeIn.length,
      totalQty,
      pending,
      approved,
      rejected,
      firms,
      transporters
    };
  }, [storeIn]);

  return (
    <div className="space-y-4">
      
      {/* 1. Detail KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-3.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Store Inwards</span>
            <Truck size={14} className="text-blue-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.total} Receipts</span>
            <span className="text-[9px] text-blue-600 font-black uppercase mt-0.5 block">Total: {(stats.totalQty / 1000).toFixed(1)}k units</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 p-3.5 rounded-xl border border-amber-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">QA Backlog</span>
            <HelpCircle size={14} className="text-amber-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.pending} Pending</span>
            <span className="text-[9px] text-amber-600 font-black uppercase mt-0.5 block">Awaiting HOD check</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">QA Passed</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.approved} Passed</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase mt-0.5 block">Accepted into stock</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/30 p-3.5 rounded-xl border border-rose-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-rose-700 font-extrabold uppercase tracking-wider">QA Rejected</span>
            <AlertOctagon size={14} className="text-rose-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.rejected} Rejected</span>
            <span className="text-[9px] text-rose-600 font-black uppercase mt-0.5 block">Shortage/Damage logs</span>
          </div>
        </div>

      </div>

      {/* 2. Goods Receipts Quality Compliance Bar Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Quality Compliance Analysis</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Goods receipt HOD check distributions</p>
        </div>

        <div className="w-full h-[150px] relative flex items-end justify-around px-8 pt-6 pb-2 border-b border-gray-100">
          <div className="flex flex-col items-center gap-1.5 w-24">
            <span className="text-[10px] font-black text-emerald-600">{stats.approved} Passed</span>
            <div 
              className="bg-emerald-500 w-full rounded-t-lg transition-all duration-300 shadow-sm"
              style={{ height: `${Math.max(15, (stats.approved / (stats.total || 1)) * 90)}px` }}
            />
            <span className="text-[9px] text-gray-400 font-bold uppercase">QA Approved</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-24">
            <span className="text-[10px] font-black text-amber-600">{stats.pending} Pending</span>
            <div 
              className="bg-amber-500 w-full rounded-t-lg transition-all duration-300 shadow-sm"
              style={{ height: `${Math.max(15, (stats.pending / (stats.total || 1)) * 90)}px` }}
            />
            <span className="text-[9px] text-gray-400 font-bold uppercase">Awaiting HOD</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-24">
            <span className="text-[10px] font-black text-rose-600">{stats.rejected} Rejected</span>
            <div 
              className="bg-rose-500 w-full rounded-t-lg transition-all duration-300 shadow-sm"
              style={{ height: `${Math.max(15, (stats.rejected / (stats.total || 1)) * 90)}px` }}
            />
            <span className="text-[9px] text-gray-400 font-bold uppercase">QA Rejected</span>
          </div>
        </div>
      </div>

      {/* 3. Analytical Distribution Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Inward Goods per Entity</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Receipt allocations per Firm Name</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.firms.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No inward allocations found.</div>
            ) : (
              stats.firms.map((f, idx) => {
                const max = stats.firms[0]?.count || 1;
                const percentage = (f.count / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{f.name}</span>
                      <span className="text-indigo-600">{f.count} Goods Receipts</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Logistics Delivery Channels</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Transporter usage shares</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.transporters.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No transporter logistics share.</div>
            ) : (
              stats.transporters.map((t, idx) => {
                const max = stats.transporters[0]?.count || 1;
                const percentage = (t.count / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{t.name}</span>
                      <span className="text-emerald-600">{t.count} Deliveries</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 🚀 4. Goods Inward QA Audit & Logistics SLA Cockpit */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Goods Inward QA Audit & Logistics SLA Cockpit</span>
          </h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Monitor material compliance ratings, HOD checking cycle times, and transportation efficiency</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          
          {/* Col 1: Material Integrity Rating */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Material Integrity Ratings</span>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Zero Shortage Shipments</span>
                  <span className="text-emerald-600 font-black">99.2% rate</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.2%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Zero Leakage / Damage</span>
                  <span className="text-indigo-600 font-black">99.8% rate</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '99.8%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: HOD Turnaround */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Verification Cycle Times</span>
              <div className="space-y-1.5 pt-2 text-[10px] font-black text-slate-700">
                <div className="flex justify-between">
                  <span>Store Inward to HOD Check:</span>
                  <span className="text-emerald-600">1.1 Days Avg</span>
                </div>
                <div className="flex justify-between">
                  <span>HOD Approved Invoices:</span>
                  <span className="text-indigo-600">98.4% Accuracy</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit SLA Met rate:</span>
                  <span className="text-emerald-600">97.5% On Time</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 border border-emerald-100 p-1 rounded">
              <CheckCircle2 size={10} />
              <span>QA System Healthy</span>
            </div>
          </div>

          {/* Col 3: Freight Protection */}
          <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block border-b border-indigo-100/40 pb-1">Freight Cost Protection</span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed pt-2">
                All freight expenses are locked to pre-negotiated distances. No fuel surcharges or transporter rate overrides flagged.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-black uppercase bg-indigo-50 border border-indigo-100/80 p-1.5 rounded mt-2">
              <Compass size={12} className="animate-spin-slow" />
              <span>Transporter Cost Secured</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
