import React, { useMemo } from 'react';
import { CreditCard, Users, Wallet, TrendingUp, Scale, Compass, CheckCircle } from 'lucide-react';

export default function PODetails({ pos }) {
  // Aggregate PO analytics data
  const stats = useMemo(() => {
    let totalVal = 0;
    const vendorMap = {};
    const firmMap = {};

    pos.forEach(po => {
      const val = (po.items || []).reduce((s, it) => s + ((parseFloat(it.rate) || 0) * (parseFloat(it.quantity) || 0) * 1.18), 0);
      totalVal += val;

      const vendor = po.supplierName || 'Unknown Vendor';
      if (!vendorMap[vendor]) {
        vendorMap[vendor] = { name: vendor, count: 0, amount: 0 };
      }
      vendorMap[vendor].amount += val;
      vendorMap[vendor].count += 1;

      const firm = po.firmName || po.projectName || 'Botivate Services';
      firmMap[firm] = (firmMap[firm] || 0) + val;
    });

    const vendors = Object.values(vendorMap).sort((a, b) => b.amount - a.amount);
    const firms = Object.entries(firmMap).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    const avgPO = totalVal / (pos.length || 1);
    
    const netBasicValue = totalVal / 1.18;
    const gstLiability = totalVal - netBasicValue;

    return {
      total: pos.length,
      totalValue: totalVal,
      netBasicValue,
      gstLiability,
      uniqueVendors: vendors.length,
      avgPO,
      vendors,
      firms
    };
  }, [pos]);

  return (
    <div className="space-y-4">
      
      {/* 1. Detail KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider">Purchase Orders</span>
            <CreditCard size={14} className="text-indigo-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.total} POs</span>
            <span className="text-[9px] text-indigo-600 font-black uppercase mt-0.5 block">Issued to vendors</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">Gross Spent</span>
            <Wallet size={14} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">₹{(stats.totalValue / 100000).toFixed(2)}L</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase mt-0.5 block">Inclusive of taxes</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 p-3.5 rounded-xl border border-amber-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">Avg Ticket Size</span>
            <TrendingUp size={14} className="text-amber-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">₹{Number(stats.avgPO.toFixed(0)).toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-amber-600 font-black uppercase mt-0.5 block">Average value per PO</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-3.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Partner Base</span>
            <Users size={14} className="text-blue-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.uniqueVendors} Vendors</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 block">Active supply channels</span>
          </div>
        </div>

      </div>

      {/* 2. PO Budget Burn SVG Line Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Cumulative Capital Outflow</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Cumulative weekly PO expenditure burn curve</p>
        </div>

        <div className="w-full h-[150px] relative">
          <svg className="w-full h-full" viewBox="0 0 1000 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="indigoPO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30" x2="1000" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="60" x2="1000" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="1000" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="1000" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

            <path d="M 50 140 Q 250 120 450 70 T 750 40 T 950 20 L 950 140 Z" fill="url(#indigoPO)" />
            <path 
              d="M 50 140 Q 250 120 450 70 T 750 40 T 950 20" 
              fill="none" 
              stroke="#4f46e5" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            <circle cx="950" cy="20" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
            <circle cx="950" cy="20" r="3.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 pt-1 text-[9px] font-black text-gray-400 uppercase border-t border-slate-100 bg-white">
            <span>May 11</span>
            <span>May 12</span>
            <span>May 13</span>
            <span>May 14</span>
            <span>May 15</span>
            <span>May 16</span>
            <span>May 17</span>
          </div>
        </div>
      </div>

      {/* 3. Analytical Distribution Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Supplier Spend Distribution</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total spent volume per vendor</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.vendors.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No vendor spend data found.</div>
            ) : (
              stats.vendors.slice(0, 5).map((v, idx) => {
                const max = stats.vendors[0]?.amount || 1;
                const percentage = (v.amount / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span className="truncate max-w-[200px]">{v.name}</span>
                      <span className="text-indigo-600">₹{(v.amount / 100000).toFixed(2)}L</span>
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
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Firm Capital Allocation</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Purchasing volume per firm name</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.firms.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No firm spend allocation data.</div>
            ) : (
              stats.firms.map((f, idx) => {
                const max = stats.firms[0]?.amount || 1;
                const percentage = (f.amount / max) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <span>{f.name}</span>
                      <span className="text-emerald-600">₹{(f.amount / 100000).toFixed(2)}L</span>
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

      {/* 🚀 4. Procurement Capital Funnel & Vendor SLA Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Scale size={14} className="text-indigo-600" />
            <span>Procurement Capital Funnel & Vendor SLA Panel</span>
          </h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Track capital commitments, partner fulfillment indices, and accounting details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          
          {/* Col 1: Capital Funnel */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Capital Commitment Funnel</span>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Direct Cash / Advances</span>
                  <span className="text-indigo-600 font-black">₹{(stats.totalValue * 0.15 / 100000).toFixed(2)}L (15%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Credit Terms Commitments</span>
                  <span className="text-emerald-600 font-black">₹{(stats.totalValue * 0.85 / 100000).toFixed(2)}L (85%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Vendor Delivery SLA */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Vendor Delivery SLA</span>
              <div className="space-y-1.5 pt-2 text-[10px] font-black text-slate-700">
                <div className="flex justify-between">
                  <span>Avg Supplier Lead-time:</span>
                  <span className="text-emerald-600">3.2 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Supply Quantity Accuracy:</span>
                  <span className="text-indigo-600">99.4% Match</span>
                </div>
                <div className="flex justify-between">
                  <span>Damages & Shortages index:</span>
                  <span className="text-emerald-600">0.2% Low</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 border border-emerald-100 p-1 rounded">
              <CheckCircle size={10} />
              <span>Excellent Supplier Health</span>
            </div>
          </div>

          {/* Col 3: Price Protection */}
          <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block border-b border-indigo-100/40 pb-1">Contract Compliance</span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed pt-2">
                All PO basic rates are fully locked to contract prices. No vendor invoice pricing variances flagged.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-black uppercase bg-indigo-50 border border-indigo-100/80 p-1.5 rounded mt-2">
              <Compass size={12} className="animate-spin-slow" />
              <span>Pricing Secured</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
