import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  CreditCard, 
  Truck, 
  Package, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight,
  TrendingDown,
  Layers,
  Coins,
  Search,
  RotateCcw
} from 'lucide-react';
import { 
  getIndents, 
  getPOs, 
  getLiftingRecords, 
  getStoreInRecords, 
  getDirectStoreInRecords, 
  getStoreIssues, 
  getInventory 
} from '../../utils/storageManager';
import IndentDetails from './IndentDetails';
import PODetails from './PODetails';
import InwardDetails from './InwardDetails';
import IssueDetails from './IssueDetails';
import StockAlerts from './StockAlerts';

export default function Dasboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [indents, setIndents] = useState([]);
  const [pos, setPOs] = useState([]);
  const [lifting, setLifting] = useState([]);
  const [storeIn, setStoreIn] = useState([]);
  const [directStoreIn, setDirectStoreIn] = useState([]);
  const [storeIssues, setStoreIssues] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedFirm, setSelectedFirm] = useState('');

  useEffect(() => {
    setIndents(getIndents() || []);
    setPOs(getPOs() || []);
    setLifting(getLiftingRecords() || []);
    setStoreIn(getStoreInRecords() || []);
    setDirectStoreIn(getDirectStoreInRecords() || []);
    setStoreIssues(getStoreIssues() || []);
    setInventory(getInventory() || []);
  }, []);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedVendor('');
    setSelectedProduct('');
    setSelectedFirm('');
  };

  // List options for dropdown filters
  const vendorOptions = useMemo(() => {
    const list = pos.map(p => p.supplierName).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [pos]);

  const productOptions = useMemo(() => {
    const list = inventory.map(i => i.item).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [inventory]);

  const firmOptions = useMemo(() => {
    const list = indents.map(i => i.firmName || i.projectName).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [indents]);

  // Apply filters to data collections
  const filteredData = useMemo(() => {
    const checkDateRange = (dateStr) => {
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (startDate && new Date(startDate) > d) return false;
      if (endDate && new Date(endDate) < d) return false;
      return true;
    };

    const filteredIndents = indents.filter(ind => {
      if (!checkDateRange(ind.timestamp)) return false;
      if (selectedFirm && (ind.firmName !== selectedFirm && ind.projectName !== selectedFirm)) return false;
      return true;
    });

    const filteredPOs = pos.filter(po => {
      if (!checkDateRange(po.timestamp)) return false;
      if (selectedVendor && po.supplierName !== selectedVendor) return false;
      if (selectedFirm && po.firmName !== selectedFirm) return false;
      return true;
    });

    const filteredStoreIn = storeIn.filter(s => {
      if (!checkDateRange(s.timestamp)) return false;
      if (selectedVendor && s.vendorName !== selectedVendor) return false;
      if (selectedFirm && s.firmName !== selectedFirm) return false;
      return true;
    });

    const filteredStoreIssues = storeIssues.filter(s => {
      if (!checkDateRange(s.date)) return false;
      if (selectedFirm && s.firmName !== selectedFirm) return false;
      return true;
    });

    return {
      indents: filteredIndents,
      pos: filteredPOs,
      storeIn: filteredStoreIn,
      storeIssues: filteredStoreIssues
    };
  }, [indents, pos, storeIn, storeIssues, startDate, endDate, selectedVendor, selectedFirm]);

  // --- Aggregate Metrics Calculations ---
  const metrics = useMemo(() => {
    // 1. Procurement Indents Card
    const totalIndentsCount = filteredData.indents.length;
    const totalIndentQty = filteredData.indents.reduce((sum, ind) => {
      const itemsQty = (ind.items || []).reduce((s, it) => s + (parseFloat(it.itemQty || it.quantity) || 0), 0);
      return sum + itemsQty;
    }, 0);

    // 2. Total PO Value Card
    const totalPOValue = filteredData.pos.reduce((sum, po) => {
      const poVal = (po.items || []).reduce((s, it) => s + ((parseFloat(it.rate) || 0) * (parseFloat(it.quantity) || 0) * 1.18), 0);
      return sum + poVal;
    }, 0);
    const avgPOValue = totalPOValue / (filteredData.pos.length || 1);

    // 3. Items Received Card
    const itemsReceivedCount = filteredData.storeIn.length;
    const totalReceivedQty = filteredData.storeIn.reduce((sum, grn) => {
      const grnQty = (grn.items || []).reduce((s, it) => s + (parseFloat(it.liftQty || it.quantity) || 0), 0);
      return sum + grnQty;
    }, 0);

    // 4. Stock Issued Card
    const stockIssuedCount = filteredData.storeIssues.length;
    const totalIssuedQty = filteredData.storeIssues.reduce((sum, iss) => sum + (parseFloat(iss.qty) || 0), 0);

    // 5. Stock Alerts Card (low stocks)
    const lowStockAlerts = inventory.filter(inv => inv.status === 'Critical' || inv.quantity <= 15).length;
    const safetyStockQty = inventory.filter(inv => inv.status === 'Critical').length;

    return {
      indentsCount: totalIndentsCount,
      indentQty: totalIndentQty,
      poValue: totalPOValue,
      avgPOValue: avgPOValue,
      receivedCount: itemsReceivedCount,
      receivedQty: totalReceivedQty,
      issuedCount: stockIssuedCount,
      issuedQty: totalIssuedQty,
      alertsCount: lowStockAlerts,
      criticalCount: safetyStockQty
    };
  }, [filteredData, inventory]);

  // --- Vendor Spend Metrics ---
  const topVendors = useMemo(() => {
    const spends = {};
    filteredData.pos.forEach(po => {
      const v = po.supplierName || 'Unknown Vendor';
      const val = (po.items || []).reduce((s, it) => s + ((parseFloat(it.rate) || 0) * (parseFloat(it.quantity) || 0) * 1.18), 0);
      
      if (!spends[v]) {
        spends[v] = { name: v, count: 0, amount: 0 };
      }
      spends[v].amount += val;
      spends[v].count += 1;
    });

    return Object.values(spends)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredData]);

  // --- Funnel Stage Pipeline Counts ---
  const stagePipeline = useMemo(() => {
    const counts = {
      pendingApproval: 0,
      approved: 0,
      enquirySent: 0,
      poCreated: 0,
      received: 0,
      issued: 0,
      billingPending: 0
    };

    const flattened = indents.flatMap(ind => (ind.items || []).map(it => ({ ...ind, ...it })));
    
    counts.pendingApproval = flattened.filter(i => i.approvalStatus === 'PENDING').length;
    counts.approved = flattened.filter(i => i.approvalStatus === 'APPROVED').length;
    counts.poCreated = pos.length;
    counts.received = storeIn.length;
    counts.issued = storeIssues.length;
    counts.billingPending = getStoreInRecords().filter(r => r.hodStatus === 'Approved').length;

    return counts;
  }, [indents, pos, storeIn, storeIssues]);

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-3 flex flex-col h-full min-h-0 overflow-y-auto bg-slate-50/50">

      {/* 🚀 Navigation Button Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-gray-200 flex-shrink-0 scrollbar-thin">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'indents', label: 'Indents Analysis', icon: ClipboardList },
          { id: 'pos', label: 'Purchase Orders', icon: CreditCard },
          { id: 'inwards', label: 'Goods Inward (GRN)', icon: Truck },
          { id: 'issues', label: 'Material Issues', icon: Package },
          { id: 'alerts', label: 'Inventory Alarms', icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-2xs border ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                  : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 1. Dashboard Filters Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        
        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-[9px] text-gray-400 pointer-events-none" size={13} />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] font-semibold text-gray-700 h-[34px] shadow-2xs"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-[9px] text-gray-400 pointer-events-none" size={13} />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] font-semibold text-gray-700 h-[34px] shadow-2xs"
            />
          </div>
        </div>

        {/* Vendors */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Vendors</label>
          <select 
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] font-semibold text-gray-700 h-[34px] shadow-2xs"
          >
            <option value="">All Vendors</option>
            {vendorOptions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Products */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Products</label>
          <select 
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] font-semibold text-gray-700 h-[34px] shadow-2xs"
          >
            <option value="">All Products</option>
            {productOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Firms */}
        <div className="space-y-1 flex flex-col justify-between">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Firms Name</label>
          <div className="flex gap-2">
            <select 
              value={selectedFirm}
              onChange={(e) => setSelectedFirm(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] font-semibold text-gray-700 h-[34px] shadow-2xs"
            >
              <option value="">All Firms</option>
              {firmOptions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button 
              onClick={handleClearFilters}
              className="w-[34px] h-[34px] flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition shadow-2xs flex-shrink-0"
              title="Reset Filters"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* 2. Premium Metrics Summary Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        
        {/* Card 1: Procurement Indents */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider block">Procurement Indents</span>
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <ClipboardList size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.indentsCount}</span>
            <div className="flex justify-between items-center text-[9px] font-black text-blue-600 block uppercase tracking-wider mt-0.5">
              <span>Quantity</span>
              <span>{(metrics.indentQty / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total PO Value */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider block">Total PO Value</span>
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <CreditCard size={16} />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              ₹{(metrics.poValue / 100000).toFixed(2)}L
            </span>
            <div className="flex justify-between items-center text-[9px] font-black text-indigo-600 block uppercase tracking-wider mt-0.5">
              <span>Avg/PO</span>
              <span>₹{Number(metrics.avgPOValue.toFixed(0)).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Items Received */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block">Items Received</span>
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <Truck size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.receivedCount}</span>
            <div className="flex justify-between items-center text-[9px] font-black text-emerald-600 block uppercase tracking-wider mt-0.5">
              <span>Total Qty</span>
              <span>{(metrics.receivedQty / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Card 4: Stock Issued */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-orange-700 font-extrabold uppercase tracking-wider block">Stock Issued</span>
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <Package size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.issuedCount}</span>
            <div className="flex justify-between items-center text-[9px] font-black text-orange-600 block uppercase tracking-wider mt-0.5">
              <span>Issue Qty</span>
              <span>{metrics.issuedQty}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Stock Alerts */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-rose-700 font-extrabold uppercase tracking-wider block">Stock Alerts</span>
            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.alertsCount}</span>
            <div className="flex justify-between items-center text-[9px] font-black text-rose-600 block uppercase tracking-wider mt-0.5">
              <span>Low Stock</span>
              <span>{metrics.criticalCount} SKUs</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Procurement & Outflow Spline Chart (Handcrafted Premium SVG) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Procurement & Outflow Trends</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Historical daily spline cycles</p>
          </div>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-emerald-500 rounded block"></span>
              <span>Indent Inflow</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-indigo-500 rounded block"></span>
              <span>Purchase Orders</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-orange-500 block"></span>
              <span>Stores Issue</span>
            </div>
          </div>
        </div>

        {/* SVG Spline Plotter */}
        <div className="w-full h-[220px] relative">
          <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="40" x2="1000" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="80" x2="1000" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="1000" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="160" x2="1000" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

            {/* Graph Splines */}
            {/* Area under curves */}
            <path d="M 50 180 Q 200 40 300 40 T 550 180 L 1000 180 L 50 180 Z" fill="url(#emeraldGrad)" />
            <path d="M 50 180 Q 200 120 400 120 T 700 180 L 1000 180 L 50 180 Z" fill="url(#indigoGrad)" />

            {/* Lines */}
            {/* Green Line - Indent Inflow */}
            <path 
              d="M 50 180 Q 200 40 300 40 T 550 180 T 800 180 T 950 180" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            {/* Indigo Line - POs */}
            <path 
              d="M 50 180 Q 200 120 400 120 T 700 180 T 950 180" 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
            {/* Orange dashed Line - Store Issues */}
            <path 
              d="M 50 180 Q 150 180 300 160 T 600 180 T 950 180" 
              fill="none" 
              stroke="#f97316" 
              strokeWidth="2.5" 
              strokeDasharray="5 5" 
              strokeLinecap="round" 
            />

            {/* Coordinate Markers */}
            <circle cx="300" cy="40" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
            <circle cx="300" cy="40" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            
            <circle cx="400" cy="120" r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="300" cy="160" r="3" fill="#f97316" stroke="#ffffff" strokeWidth="1" />

          </svg>

          {/* Timeline coordinates layout labels */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 pt-1 text-[9px] font-black text-gray-400 uppercase border-t border-slate-100 bg-white">
            <span>May 10</span>
            <span>May 11</span>
            <span>May 12</span>
            <span>May 13</span>
            <span>May 14</span>
            <span>May 15</span>
            <span>May 16</span>
            <span>May 17</span>
          </div>

          {/* Y Axis Guide numbers */}
          <div className="absolute left-2 inset-y-0 flex flex-col justify-between text-[9px] font-black text-gray-300 pointer-events-none py-2 pb-5">
            <span>16</span>
            <span>12</span>
            <span>8</span>
            <span>4</span>
            <span>0</span>
          </div>

        </div>
      </div>

      {/* 4. Bottom split: Workflow Pipeline and Top Vendors Spend list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Left: Workflow Status Distribution ( Funnel Progress bars ) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3 md:col-span-1">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Workflow Pipeline</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Active lifecycle stage counts</p>
          </div>
          
          <div className="space-y-3.5 pt-1">
            
            {/* Stage 1: Indents Pending */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                <span>Indents Pending Approval</span>
                <span className="text-indigo-600">{stagePipeline.pendingApproval}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stagePipeline.pendingApproval / 20) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stage 2: Approved / RFQ ready */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                <span>Approved Indents (RFQ Stage)</span>
                <span className="text-blue-600">{stagePipeline.approved}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stagePipeline.approved / 20) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stage 3: PO Created */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                <span>Purchase Orders Active</span>
                <span className="text-amber-600">{stagePipeline.poCreated}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stagePipeline.poCreated / 20) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stage 4: Received in Store */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                <span>Goods Receipts (Store In)</span>
                <span className="text-emerald-600">{stagePipeline.received}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stagePipeline.received / 20) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stage 5: Billing Check Pending */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                <span>HOD Approved GRN (Billing Pending)</span>
                <span className="text-rose-600">{stagePipeline.billingPending}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stagePipeline.billingPending / 20) * 100)}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right: Top Vendors by Volume spends */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3 md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Top Vendors by Volume</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Purchase spends per supplier</p>
            </div>
            <a 
              href="/master"
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-0.5"
            >
              <span>View All Vendors</span>
              <ChevronRight size={12} />
            </a>
          </div>

          <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-center pt-2">
            {topVendors.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-gray-400">
                No purchases or vendor spend found.
              </div>
            ) : (
              topVendors.map((vend, idx) => {
                const maxAmount = topVendors[0]?.amount || 1;
                const percentage = (vend.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight block truncate max-w-[190px]">
                          {vend.name}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold block uppercase">
                          {vend.count} {vend.count === 1 ? 'Order' : 'Orders'} Processed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end">
                      {/* Spline spend bar indicator */}
                      <div className="hidden sm:block w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-slate-800">
                          ₹{(vend.amount / 100000).toFixed(2)}L
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Value</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
      
      </>
      )}

      {activeTab === 'indents' && <IndentDetails indents={indents} />}
      {activeTab === 'pos' && <PODetails pos={pos} />}
      {activeTab === 'inwards' && <InwardDetails storeIn={storeIn} />}
      {activeTab === 'issues' && <IssueDetails storeIssues={storeIssues} />}
      {activeTab === 'alerts' && <StockAlerts inventory={inventory} />}

    </div>
  );
}
