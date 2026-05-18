import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, CheckSquare, Clock, Package2, ShieldCheck, Activity } from 'lucide-react';
import {
  getIndents,
  getLiftingRecords,
  getStoreInRecords,
  getPOs,
  getDirectStoreInRecords,
  getPayments,
  getRejectGRNRecords,
  getDebitNotes,
  getTallyEntries,
  getBillNotReceived
} from '../../utils/storageManager';
import DataTable from '../../components/DataTable';

export default function PCDB() {
  const [stats, setStats] = useState({
    approval: { pending: 0, complete: 0 },
    vendorRate: { pending: 0, complete: 0 },
    technical: { pending: 0, complete: 0 },
    management: { pending: 0, complete: 0 },
    poCreate: { pending: 0, complete: 0 },
    lifting: { pending: 0, complete: 0 },
    storeIn: { pending: 0, complete: 0 },
    hodCheck: { pending: 0, complete: 0 },
    freightPayment: { pending: 0, complete: 0 },
    makePayment: { pending: 0, complete: 0 },
    rejectGRN: { pending: 0, complete: 0 },
    sendDebit: { pending: 0, complete: 0 },
    audit: { pending: 0, complete: 0 },
    billNotReceived: { pending: 0, complete: 0 }
  });

  useEffect(() => {
    const computeStats = () => {
      const indents = getIndents() || [];
      const lifting = getLiftingRecords() || [];
      const pos = getPOs() || [];
      const storeInRecords = getStoreInRecords() || [];
      const directStoreIn = getDirectStoreInRecords() || [];
      const payments = getPayments() || [];
      const grnRecords = getRejectGRNRecords() || [];
      const allDebitNotes = getDebitNotes() || [];
      const tallyEntries = getTallyEntries() || [];
      const bills = getBillNotReceived() || [];

      // Flatten items
      const flattenedItems = indents.flatMap(indent => 
        (indent.items || []).map(item => ({ ...indent, ...item }))
      );

      // 1. Indent Approval
      const approvalPending = flattenedItems.filter(i => i.approvalStatus === 'PENDING').length;
      const approvalComplete = flattenedItems.filter(i => i.approvalStatus === 'APPROVED').length;

      // 2. Vendor Rate
      const ratePending = indents.filter(i => i.status === 'Rate Update').length;
      const rateComplete = indents.filter(i => i.status !== 'Rate Update' && i.status !== 'Draft').length;

      // 3. Technical Approval
      const techPending = flattenedItems.filter(i => i.vendorRateInfo && !i.technicalApproval).length;
      const techComplete = flattenedItems.filter(i => i.technicalApproval).length;

      // 4. Management Approval
      const mgmtPending = flattenedItems.filter(i => i.technicalApproval && !i.managementApproval).length;
      const mgmtComplete = flattenedItems.filter(i => i.managementApproval).length;

      // 5. PO Create
      const poPending = flattenedItems.filter(i => i.managementApproval && !i.poNumber).length;
      const poComplete = pos.length;

      // 6. Lifting
      const liftPending = pos.length - lifting.length > 0 ? pos.length - lifting.length : 0;
      const liftComplete = lifting.length;

      // 7. Store In
      const storePending = lifting.length - storeInRecords.length > 0 ? lifting.length - storeInRecords.length : 0;
      const storeComplete = storeInRecords.length;

      // 8. HOD Check
      const hodPending = storeInRecords.filter(r => !r.hodStatus || r.hodStatus === 'Pending').length;
      const hodComplete = storeInRecords.filter(r => r.hodStatus === 'Approved' || r.hodStatus === 'Rejected').length;

      // 9. Freight Payment
      const freightPending = lifting.filter(i => i.transportation === 'Yes' && (!i.freightPaymentStatus || i.freightPaymentStatus === 'Pending')).length;
      const freightComplete = lifting.filter(i => i.transportation === 'Yes' && i.freightPaymentStatus === 'Paid').length;

      // 10. Make Payment
      const approvedStoreIn = storeInRecords.filter(r => r.hodStatus === 'Approved');
      let makePayPending = 0;
      let makePayComplete = 0;
      const checkPayment = (id, amount) => {
        const related = payments.filter(p => p.referenceId === id);
        const total = related.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
        if (total < amount) {
          makePayPending++;
        } else {
          makePayComplete++;
        }
      };
      approvedStoreIn.forEach(r => checkPayment(r.id, r.totalAmount || r.items?.[0]?.amount || 0));
      directStoreIn.forEach(r => checkPayment(r.id, parseFloat(r.billAmount) || 0));

      // 11. Reject for GRN
      const rejectedStoreIn = storeInRecords.filter(r => r.hodStatus === 'Rejected');
      const rejectPending = rejectedStoreIn.filter(r => !grnRecords.some(g => g.referenceId === r.id)).length;
      const rejectComplete = grnRecords.length;

      // 12. Send Debit Note
      const debitPending = lifting.filter(lift => !allDebitNotes.some(dn => dn.liftNumber === lift.id)).length;
      const debitComplete = allDebitNotes.length;

      // 13. Audit Data
      const activeTally = tallyEntries.filter(t => !t.isCompleted);
      const auditPending = activeTally.length;
      const auditComplete = tallyEntries.filter(t => t.isCompleted).length;

      // 14. Bill Not Received
      const billsPending = bills.filter(b => b.billStatus !== 'Received').length;
      const billsComplete = bills.filter(b => b.billStatus === 'Received').length;

      setStats({
        approval: { pending: approvalPending, complete: approvalComplete },
        vendorRate: { pending: ratePending, complete: rateComplete },
        technical: { pending: techPending, complete: techComplete },
        management: { pending: mgmtPending, complete: mgmtComplete },
        poCreate: { pending: poPending, complete: poComplete },
        lifting: { pending: liftPending, complete: liftComplete },
        storeIn: { pending: storePending, complete: storeComplete },
        hodCheck: { pending: hodPending, complete: hodComplete },
        freightPayment: { pending: freightPending, complete: freightComplete },
        makePayment: { pending: makePayPending, complete: makePayComplete },
        rejectGRN: { pending: rejectPending, complete: rejectComplete },
        sendDebit: { pending: debitPending, complete: debitComplete },
        audit: { pending: auditPending, complete: auditComplete },
        billNotReceived: { pending: billsPending, complete: billsComplete }
      });
    };

    computeStats();
    window.addEventListener('focus', computeStats);
    return () => window.removeEventListener('focus', computeStats);
  }, []);

  const stagesData = useMemo(() => {
    return [
      { id: 1, stage: 'Stage 1: Approval Indent', pending: stats.approval.pending, complete: stats.approval.complete, type: 'Pre-Purchase' },
      { id: 2, stage: 'Stage 2: Vendor Rate Update', pending: stats.vendorRate.pending, complete: stats.vendorRate.complete, type: 'Pre-Purchase' },
      { id: 3, stage: 'Stage 3: Technical Approval', pending: stats.technical.pending, complete: stats.technical.complete, type: 'Pre-Purchase' },
      { id: 4, stage: 'Stage 4: Management Approval', pending: stats.management.pending, complete: stats.management.complete, type: 'Pre-Purchase' },
      { id: 5, stage: 'Stage 5: PO to be Created', pending: stats.poCreate.pending, complete: stats.poCreate.complete, type: 'Purchase Order' },
      { id: 6, stage: 'Stage 6: Lifting (Dispatch)', pending: stats.lifting.pending, complete: stats.lifting.complete, type: 'Logistics' },
      { id: 7, stage: 'Stage 7: Store In (GRN Receipt)', pending: stats.storeIn.pending, complete: stats.storeIn.complete, type: 'Inventory In' },
      { id: 8, stage: 'Stage 8: HOD GRN Verification', pending: stats.hodCheck.pending, complete: stats.hodCheck.complete, type: 'Quality Check' },
      { id: 9, stage: 'Stage 9: Freight Billing', pending: stats.freightPayment.pending, complete: stats.freightPayment.complete, type: 'Logistics' },
      { id: 10, stage: 'Stage 10: Vendor Settlement (Payments)', pending: stats.makePayment.pending, complete: stats.makePayment.complete, type: 'Finance' },
      { id: 11, stage: 'Stage 11: Rejected GRN processing', pending: stats.rejectGRN.pending, complete: stats.rejectGRN.complete, type: 'Quality Check' },
      { id: 12, stage: 'Stage 12: Send Debit Note processing', pending: stats.sendDebit.pending, complete: stats.sendDebit.complete, type: 'Finance' },
      { id: 13, stage: 'Stage 13: 5-Stage Accounting Audit', pending: stats.audit.pending, complete: stats.audit.complete, type: 'Accounting' },
      { id: 14, stage: 'Stage 14: Bill Not Received tracking', pending: stats.billNotReceived.pending, complete: stats.billNotReceived.complete, type: 'Accounting' }
    ];
  }, [stats]);

  // Aggregate values
  const totals = useMemo(() => {
    return stagesData.reduce((acc, row) => {
      acc.pending += row.pending;
      acc.complete += row.complete;
      return acc;
    }, { pending: 0, complete: 0 });
  }, [stagesData]);

  const completionRate = useMemo(() => {
    const total = totals.pending + totals.complete;
    if (total === 0) return 100;
    return Math.round((totals.complete / total) * 100);
  }, [totals]);

  const headers = ['Stage', 'Total Pending', 'Total Complete'];

  const renderRow = (item, index) => {
    return (
      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
            <div>
              <span className="text-xs font-black text-slate-800 uppercase block">{item.stage}</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{item.type}</span>
            </div>
          </div>
        </td>
        <td className="px-5 py-3 text-center">
          <span className={`px-3 py-1 rounded-full text-xs font-black min-w-[50px] inline-block text-center border ${item.pending > 0 ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            {item.pending}
          </span>
        </td>
        <td className="px-5 py-3 text-center">
          <span className="px-3 py-1 rounded-full text-xs font-black min-w-[50px] inline-block text-center border bg-green-50 text-green-700 border-green-200 shadow-sm">
            {item.complete}
          </span>
        </td>
      </tr>
    );
  };

  const renderCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{item.type}</span>
        <span className="text-xs font-black text-slate-800 uppercase block">{item.stage}</span>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
          <div className="text-center p-1 bg-amber-50/30 rounded border border-amber-100">
            <span className="text-[8px] text-amber-600 font-extrabold uppercase block">Pending</span>
            <span className="text-sm font-black text-amber-700">{item.pending}</span>
          </div>
          <div className="text-center p-1 bg-green-50/30 rounded border border-green-100">
            <span className="text-[8px] text-green-600 font-extrabold uppercase block">Completed</span>
            <span className="text-sm font-black text-green-700">{item.complete}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-1 md:p-3 space-y-3 flex flex-col h-full min-h-0 bg-slate-50/20">
      
      {/* Dynamic Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-2 md:px-0">
        
        {/* Dynamic completion gauge */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
          <div className="space-y-1.5">
            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest block">System Flow rate</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Cycle Completion</h2>
            <div className="w-[180px] bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl md:text-4xl font-black text-indigo-600">{completionRate}%</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider mt-0.5">overall efficiency</span>
          </div>
        </div>

        {/* Dynamic Total Pending */}
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock size={22} className="animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest block">Cycle Backlogs</span>
            <span className="text-2xl font-black text-slate-800">{totals.pending}</span>
            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">tasks waiting action</span>
          </div>
        </div>

        {/* Dynamic Total Completed */}
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckSquare size={22} />
          </div>
          <div>
            <span className="text-[9px] text-green-500 font-black uppercase tracking-widest block">Archived Tasks</span>
            <span className="text-2xl font-black text-slate-800">{totals.complete}</span>
            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">operations finalized</span>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          headers={headers}
          data={stagesData}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="800px"
          currentPage={1}
          totalPages={1}
          itemsPerPage={50}
          onPageChange={() => {}}
          onItemsPerPageChange={() => {}}
          totalResults={stagesData.length}
        />
      </div>

    </div>
  );
}
