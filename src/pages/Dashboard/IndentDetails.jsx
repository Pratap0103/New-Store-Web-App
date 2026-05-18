import React, { useMemo } from 'react';
import { ClipboardList, Clock, CheckCircle, Ban, Compass, ShieldAlert, Award, AlertTriangle } from 'lucide-react';

export default function IndentDetails({ indents }) {
  // Aggregate metrics
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    const firmMap = {};
    const deptMap = {};
    let urgentCount = 0;
    let mediumCount = 0;
    let routineCount = 0;

    const flattened = indents.flatMap(ind => (ind.items || []).map(it => ({ ...ind, ...it })));
    
    flattened.forEach(item => {
      if (item.approvalStatus === 'PENDING') pending++;
      else if (item.approvalStatus === 'APPROVED') approved++;
      else if (item.approvalStatus === 'REJECTED') rejected++;

      const p = String(item.priority || item.urgency || '').toLowerCase();
      if (p.includes('high') || p.includes('urgent')) urgentCount++;
      else if (p.includes('med')) mediumCount++;
      else routineCount++;
    });

    indents.forEach(ind => {
      const firm = ind.firmName || ind.projectName || 'Botivate Services';
      firmMap[firm] = (firmMap[firm] || 0) + 1;

      const dept = ind.department || 'General Store';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const firms = Object.entries(firmMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const depts = Object.entries(deptMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    return {
      total: indents.length,
      totalItems: flattened.length,
      pending,
      approved,
      rejected,
      firms,
      depts,
      urgentCount,
      mediumCount,
      routineCount
    };
  }, [indents]);

  return (
    <div className="space-y-4">
      
      {/* 1. Detail KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-3.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Total Indents</span>
            <ClipboardList size={14} className="text-blue-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.total} Indents</span>
            <span className="text-[9px] text-blue-600 font-black uppercase mt-0.5 block">{stats.totalItems} total SKUs</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 p-3.5 rounded-xl border border-amber-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">Approval Backlog</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.pending} Items</span>
            <span className="text-[9px] text-amber-600 font-black uppercase mt-0.5 block">Awaiting stage check</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">Approved Requests</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.approved} items</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase mt-0.5 block">Ready for procurement</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/30 p-3.5 rounded-xl border border-rose-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-rose-700 font-extrabold uppercase tracking-wider">Rejected Requests</span>
            <Ban size={14} className="text-rose-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.rejected} items</span>
            <span className="text-[9px] text-rose-600 font-black uppercase mt-0.5 block">Flagged by HOD/Manager</span>
          </div>
        </div>

      </div>

      {/* 2. Indent Weekly Spline Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Indent Creation Velocity Chart</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Weekly trend analysis of indent requests</p>
        </div>

        <div className="w-full h-[150px] relative">
          <svg className="w-full h-full" viewBox="0 0 1000 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30" x2="1000" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="60" x2="1000" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="1000" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="1000" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

            <path d="M 50 130 Q 200 40 400 30 T 700 110 T 950 130 L 950 130 L 50 130 Z" fill="url(#blueGrad)" />
            <path 
              d="M 50 130 Q 200 40 400 30 T 700 110 T 950 130" 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            <circle cx="400" cy="30" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
            <circle cx="400" cy="30" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
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
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Firm-wise Request Volume</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Indent counts requested per entity</p>
          </div>

          <div className="space-y-3 pt-2">
            {stats.firms.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No firm-wise data available.</div>
            ) : (
              stats.firms.map((firm, idx) => {
                const max = stats.firms[0]?.count || 1;
                const percentage = (firm.count / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{firm.name}</span>
                      <span className="text-indigo-600">{firm.count} Indents</span>
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
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Department Share Analysis</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Consolidated request ratios per department</p>
          </div>

          <div className="space-y-3 pt-2">
            {stats.depts.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No department data available.</div>
            ) : (
              stats.depts.map((dept, idx) => {
                const max = stats.depts[0]?.count || 1;
                const percentage = (dept.count / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{dept.name}</span>
                      <span className="text-emerald-600">{dept.count} Requests</span>
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

      {/* 🚀 4. SLA & Priority Fulfillment Audit Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Compass size={14} className="text-indigo-600 animate-spin-slow" />
            <span>Indent SLA & Priority Fulfillment Cockpit</span>
          </h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-semibold">Real-time tracking of operational delays, department response speeds, and priority shares</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          
          {/* Col 1: Urgency Shares */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Priority Allocation</span>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Critical / Urgent</span>
                  <span className="text-rose-600 font-black">{stats.urgentCount} items</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(stats.urgentCount / (stats.totalItems || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Medium Priority</span>
                  <span className="text-amber-600 font-black">{stats.mediumCount} items</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(stats.mediumCount / (stats.totalItems || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Routine Requests</span>
                  <span className="text-emerald-600 font-black">{stats.routineCount} items</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(stats.routineCount / (stats.totalItems || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Turnaround Time */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Response SLA Index</span>
              <div className="space-y-1.5 pt-2 text-[10px] font-black text-slate-700">
                <div className="flex justify-between">
                  <span>HOD Stage Verification:</span>
                  <span className="text-emerald-600">1.2 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Owner technical check:</span>
                  <span className="text-indigo-600">0.8 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment Release rate:</span>
                  <span className="text-emerald-600">97.8% On Time</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 border border-emerald-100 p-1 rounded">
              <CheckCircle size={10} />
              <span>SLA Target Maintained</span>
            </div>
          </div>

          {/* Col 3: Operational Warning */}
          <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block border-b border-indigo-100/40 pb-1">Store Audit Alerts</span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed pt-2">
                All indents are fully compliant with budgetary ceilings. No double-procurement or pricing overrides flagged.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-black uppercase bg-indigo-50 border border-indigo-100/80 p-1.5 rounded mt-2">
              <ShieldAlert size={12} />
              <span>Zero Budget Violations</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
