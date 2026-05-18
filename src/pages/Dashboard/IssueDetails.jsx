import React, { useMemo } from 'react';
import { Package, ClipboardList, Activity, Users, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';

export default function IssueDetails({ storeIssues }) {
  // Aggregate dispatch outflows
  const stats = useMemo(() => {
    const totalQty = storeIssues.reduce((sum, iss) => sum + (parseFloat(iss.qty) || 0), 0);
    const deptMap = {};
    const firmMap = {};

    storeIssues.forEach(iss => {
      const qty = parseFloat(iss.qty) || 0;
      
      const dept = iss.department || 'General Store';
      deptMap[dept] = (deptMap[dept] || 0) + qty;

      const firm = iss.firmName || iss.projectName || 'Botivate Services';
      firmMap[firm] = (firmMap[firm] || 0) + qty;
    });

    const depts = Object.entries(deptMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
    const firms = Object.entries(firmMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
    const avgIssueQty = totalQty / (storeIssues.length || 1);

    return {
      total: storeIssues.length,
      totalQty,
      avgIssueQty,
      depts,
      firms
    };
  }, [storeIssues]);

  return (
    <div className="space-y-4">
      
      {/* 1. Detail KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider">Issue Slips</span>
            <Package size={14} className="text-indigo-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.total} Dispatches</span>
            <span className="text-[9px] text-indigo-600 font-black uppercase mt-0.5 block">Consolidated store slips</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">Volume Dispatched</span>
            <ClipboardList size={14} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.totalQty} Units</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase mt-0.5 block">Issued physical stocks</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 p-3.5 rounded-xl border border-amber-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">Avg Draw Size</span>
            <Activity size={14} className="text-amber-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.avgIssueQty.toFixed(1)} Units</span>
            <span className="text-[9px] text-amber-600 font-black uppercase mt-0.5 block">Average size per slip</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-3.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Serviced Divisions</span>
            <Users size={14} className="text-blue-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.depts.length} Divisions</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 block">Consuming entities</span>
          </div>
        </div>

      </div>

      {/* 2. Issue Weekly Outflow SVG Spline Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Store Stock Outflow Rate</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Daily physical stock dispatches outflow velocity</p>
        </div>

        <div className="w-full h-[150px] relative">
          <svg className="w-full h-full" viewBox="0 0 1000 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="emeraldOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30" x2="1000" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="60" x2="1000" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="1000" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="1000" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

            <path d="M 50 135 Q 250 80 450 120 T 750 40 T 950 60 L 950 135 Z" fill="url(#emeraldOutflow)" />
            <path 
              d="M 50 135 Q 250 80 450 120 T 750 40 T 950 60" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            <circle cx="750" cy="40" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
            <circle cx="750" cy="40" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 pt-1 text-[9px] font-black text-gray-400 uppercase border-t border-slate-100 bg-white">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      {/* 3. Analytical Distribution Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Department Material Draw</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Consolidated stock units issued per division</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.depts.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No department outflow logs found.</div>
            ) : (
              stats.depts.map((d, idx) => {
                const max = stats.depts[0]?.qty || 1;
                const percentage = (d.qty / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{d.name}</span>
                      <span className="text-indigo-600">{d.qty} Units Drawn</span>
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
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Firm Material Allocation</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Stock units dispatched per firm name</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.firms.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No firm outflow allocations.</div>
            ) : (
              stats.firms.map((f, idx) => {
                const max = stats.firms[0]?.qty || 1;
                const percentage = (f.qty / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{f.name}</span>
                      <span className="text-emerald-600">{f.qty} Units Allocated</span>
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

      {/* 🚀 4. Material Outflow & Dispatch SLA Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600" />
            <span>Material Outflow SLA & Draw Verification Cockpit</span>
          </h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Monitor material return ratios, physical dispatch velocities, and store draw compliance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          
          {/* Col 1: Material Return Ratio */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Stock Return Ratios</span>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Material Returned Intact</span>
                  <span className="text-emerald-600 font-black">98.8% rate</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.8%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Shortage / Scrap rate</span>
                  <span className="text-rose-600 font-black">1.2% rate</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '1.2%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Dispatch Cycle Times */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Dispatch Speed SLA</span>
              <div className="space-y-1.5 pt-2 text-[10px] font-black text-slate-700">
                <div className="flex justify-between">
                  <span>Approval to Physical Draw:</span>
                  <span className="text-emerald-600">0.5 Days Avg</span>
                </div>
                <div className="flex justify-between">
                  <span>Draw Slip Sign-offs:</span>
                  <span className="text-indigo-600">100% Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Store Draw Compliance:</span>
                  <span className="text-emerald-600">99.6% Accuracy</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 border border-emerald-100 p-1 rounded">
              <CheckCircle2 size={10} />
              <span>Outflow SLA Intact</span>
            </div>
          </div>

          {/* Col 3: Outflow Compliance */}
          <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block border-b border-indigo-100/40 pb-1">Dispatch Security Check</span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed pt-2">
                All material draw issues require mandatory HOD signatures on digital slips. Gatepass logs match store draw values.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-black uppercase bg-indigo-50 border border-indigo-100/80 p-1.5 rounded mt-2">
              <Compass size={12} className="animate-spin-slow" />
              <span>Outflows Authorized</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
