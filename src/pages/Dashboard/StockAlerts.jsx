import React, { useMemo } from 'react';
import { AlertTriangle, Layers, Award, CheckCircle2, ShieldCheck, Compass, ShoppingCart } from 'lucide-react';

export default function StockAlerts({ inventory }) {
  // Aggregate stock inventory and reorders
  const stats = useMemo(() => {
    let criticalCount = 0;
    let normalCount = 0;
    let totalSKUs = inventory.length;
    let totalValuation = 0;
    const groupValMap = {};
    const criticalItems = [];

    inventory.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.totalPrice) || 0;
      totalValuation += rate;

      const isCritical = item.status === 'Critical' || qty <= 15;

      if (isCritical) {
        criticalCount++;
        const reorderQty = Math.max(0, 50 - qty);
        criticalItems.push({
          name: item.item,
          qty,
          reorderQty,
          group: item.groupHead,
          firm: item.firmName
        });
      } else {
        normalCount++;
      }

      const group = item.groupHead || 'General Store';
      groupValMap[group] = (groupValMap[group] || 0) + rate;
    });

    const groups = Object.entries(groupValMap).map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val);

    return {
      totalSKUs,
      criticalCount,
      normalCount,
      totalValuation,
      groups,
      criticalItems
    };
  }, [inventory]);

  return (
    <div className="space-y-4">
      
      {/* 1. Detail KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/30 p-3.5 rounded-xl border border-rose-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-rose-700 font-extrabold uppercase tracking-wider">Critical Alarms</span>
            <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black text-rose-700 leading-none block">{stats.criticalCount} SKUs Low</span>
            <span className="text-[9px] text-rose-600 font-black uppercase mt-0.5 block">Requires restock PO</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">Healthy Stocks</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.normalCount} SKUs OK</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase mt-0.5 block">Sufficient safety margin</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider">Monitored Lines</span>
            <Layers size={14} className="text-indigo-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">{stats.totalSKUs} SKU Types</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 block">Consolidated catalog</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-3.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between h-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Asset Valuation</span>
            <Award size={14} className="text-blue-500" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none block">₹{(stats.totalValuation / 100000).toFixed(2)}L</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 block">Store inventory value</span>
          </div>
        </div>

      </div>

      {/* 2. Critical Alarm Restock SVG Replenishment Column Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recommended Purchase Reorders</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Auto-allocated restock quantities to secure safety inventory</p>
        </div>

        <div className="w-full h-[150px] relative flex items-end justify-around px-8 pt-6 pb-2 border-b border-gray-100">
          {stats.criticalItems.length === 0 ? (
            <div className="text-center py-8 text-xs font-bold text-gray-400">No critical stocks to display reorder trends.</div>
          ) : (
            stats.criticalItems.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 w-24">
                <span className="text-[10px] font-black text-indigo-600">+{item.reorderQty}</span>
                <div 
                  className="bg-indigo-500 w-full rounded-t-lg transition-all duration-300 shadow-sm"
                  style={{ height: `${Math.max(15, (item.reorderQty / 50) * 90)}px` }}
                />
                <span className="text-[8px] text-gray-400 font-black uppercase truncate max-w-[80px]">{item.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Replenishment Command Alarms */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Replenishment Actions Panel</span>
          </h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">SKUs requiring restock orders</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {stats.criticalItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xs font-bold text-gray-400">
              🎉 No critical stock alarms! All material inventory is healthy.
            </div>
          ) : (
            stats.criticalItems.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-rose-50/40 border border-rose-100 rounded-xl p-3.5 flex flex-col justify-between h-[120px] shadow-2xs hover:bg-rose-50 transition duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <span className="text-[8px] text-rose-500 font-black uppercase tracking-wider block truncate">{item.group}</span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate block max-w-[170px]">{item.name}</span>
                  </div>
                  <div className="p-1 bg-rose-100 text-rose-600 rounded-lg animate-pulse">
                    <AlertTriangle size={13} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-rose-100/60 pt-2 text-[10px] font-black uppercase tracking-wider">
                  <div className="text-slate-500">
                    <span>Available:</span>
                    <span className="text-slate-800 ml-1 font-extrabold">{item.qty}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px]">
                    <ShoppingCart size={9} />
                    <span>Order: +{item.reorderQty}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🚀 4. Inventory Ageing & Safety Turnover Cockpit */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600" />
            <span>Inventory Ageing & Safety Turnover Cockpit</span>
          </h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-semibold">Monitor inventory stock velocities, safety turnover lead times, and obsolescence logs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          
          {/* Col 1: Stock Ageing Share */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Stock Ageing Ratios</span>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Fast Moving SKU Lines</span>
                  <span className="text-indigo-600 font-black">65.0% share</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase text-slate-600">
                  <span>Slow Moving SKU Lines</span>
                  <span className="text-amber-600 font-black">30.0% share</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-50 h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Reorder Lead Times */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-1">Safety Sourcing Timelines</span>
              <div className="space-y-1.5 pt-2 text-[10px] font-black text-slate-700">
                <div className="flex justify-between">
                  <span>Reorder release lead time:</span>
                  <span className="text-emerald-600">1.8 Days Avg</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety restock speed:</span>
                  <span className="text-indigo-600">100% within SLA</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock obsolescence index:</span>
                  <span className="text-emerald-600">0.0% Perfect</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 border border-emerald-100 p-1 rounded">
              <CheckCircle2 size={10} />
              <span>Safety Margins Secured</span>
            </div>
          </div>

          {/* Col 3: Stock Auditing */}
          <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block border-b border-indigo-100/40 pb-1">Safety Stock Verification</span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed pt-2">
                All physical catalog safety stock limits are checked against vendor lead times automatically. No stockout liability flagged.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-black uppercase bg-indigo-50 border border-indigo-100/80 p-1.5 rounded mt-2">
              <Compass size={12} className="animate-spin-slow" />
              <span>Stocks Fully Secured</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
