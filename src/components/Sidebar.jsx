import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Settings,
  LogOut as LogOutIcon,
  X,
  Users,
  Database,
  ClipboardList,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle,
  ShoppingCart,
  FilePlus2,
  Search,
  Pencil,
  LayoutGrid,
  FilePlus,
  ClipboardCheck,
  Tags,
  Cpu,
  HelpCircle,
  TrendingUp,
  UserCheck,
  History,
  PackageSearch,
  Truck,
  Package,
  CreditCard,
  Ban,
  Warehouse,
  Coins,
  Receipt,
  Blocks
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getIndents, getLiftingRecords, getStoreInRecords, getPOs, getDirectStoreInRecords, getPayments, getRejectGRNRecords, getDebitNotes, getTallyEntries, getBillNotReceived, getQuotationHistory } from '../utils/storageManager';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMastersOpen, setIsMastersOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isStoreDataOpen, setIsStoreDataOpen] = useState(false);
  const [counts, setCounts] = useState({ 
    approval: 0, 
    vendorRate: 0, 
    technical: 0, 
    management: 0, 

    poToBeCreate: 0, 
    lifting: 0, 
    storeIn: 0,
    hodCheck: 0,
    freightPayment: 0,
    makePayment: 0,
    rejectGRN: 0,
    sendDebit: 0,
    totalAudit: 0,
    audit: 0,
    rectify: 0,
    reaudit: 0,
    tally: 0,
    again: 0,
    billNotReceived: 0,
    enquiry: 0
  });

  useEffect(() => {
    const refreshCounts = () => {
      const indents = getIndents() || [];
      const lifting = getLiftingRecords() || [];
      const pos = getPOs() || [];

      // Flatten indents for multi-item modules
      const flattenedItems = indents.flatMap(indent => 
        (indent.items || []).map(item => ({ ...indent, ...item }))
      );

      // 1. Approval Indent: approvalStatus === 'PENDING'
      const approvalCount = flattenedItems.filter(i => i.approvalStatus === 'PENDING').length;

      // 2. Vendor Rate: status === 'Rate Update'
      const vendorRateCount = indents.filter(i => i.status === 'Rate Update').length;

      // Enquiry: APPROVED items with no quotation history
      const quotationHistory = getQuotationHistory() || [];
      const enquiryCount = flattenedItems.filter(item => {
        const isApproved = item.approvalStatus === 'APPROVED';
        const alreadyHasEnquiry = quotationHistory.some(h => h.indentNo === (item.id || item.indentId) && h.product === item.productName);
        return isApproved && !alreadyHasEnquiry;
      }).length;

      // 3. Technical Approval: vendorRateInfo && !technicalApproval
      const technicalCount = flattenedItems.filter(i => i.vendorRateInfo && !i.technicalApproval).length;

      // 4. Management Approval: technicalApproval && !managementApproval
      const managementCount = flattenedItems.filter(i => i.technicalApproval && !i.managementApproval).length;

      // 5. PO to be Create: managementApproval && !poNumber
      const poToBeCreateCount = flattenedItems.filter(i => i.managementApproval && !i.poNumber).length;

      // 6. Lifting: Matches Lifting.jsx (pos.length)
      const liftingCount = pos.length;

      // 7. Store In: Matches StoreIn.jsx (lifting.length)
      const storeInCount = lifting.length;

      // 8. HOD Check: storeIn records with no hodStatus or 'Pending'
      const storeInRecords = getStoreInRecords() || [];
      const hodCheckCount = storeInRecords.filter(i => !i.hodStatus || i.hodStatus === 'Pending').length;

      // 9. Freight Payment: lifting records with transportation === 'Yes' and no payment
      const freightPaymentCount = lifting.filter(i => i.transportation === 'Yes' && (!i.freightPaymentStatus || i.freightPaymentStatus === 'Pending')).length;

      // 10. Make Payment
      const directStoreIn = getDirectStoreInRecords() || [];
      const payments = getPayments() || [];
      const approvedStoreIn = storeInRecords.filter(r => r.hodStatus === 'Approved');
      
      let makePaymentCount = 0;
      const checkPaymentPending = (id, amount) => {
        const related = payments.filter(p => p.referenceId === id);
        const total = related.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
        if (total < amount) makePaymentCount++;
      };
      
      approvedStoreIn.forEach(r => checkPaymentPending(r.id, r.totalAmount || r.items?.[0]?.amount || 0));
      directStoreIn.forEach(r => checkPaymentPending(r.id, parseFloat(r.billAmount) || 0));

      // 11. Reject GRN
      const grnRecords = getRejectGRNRecords() || [];
      const rejectedStoreIn = storeInRecords.filter(r => r.hodStatus === 'Rejected');
      const rejectGRNCount = rejectedStoreIn.filter(r => !grnRecords.some(g => g.referenceId === r.id)).length;

      // 12. Send Debit Note
      const allDebitNotes = getDebitNotes() || [];
      const sendDebitCount = lifting.filter(lift => !allDebitNotes.some(dn => dn.liftNumber === lift.id)).length;

      // 13. Audit Data stages
      const tallyEntries = getTallyEntries() || [];
      const activeTally = tallyEntries.filter(t => !t.isCompleted);
      const auditCount = activeTally.filter(t => t.currentStage === 'AUDIT').length;
      const rectifyCount = activeTally.filter(t => t.currentStage === 'RECTIFY').length;
      const reauditCount = activeTally.filter(t => t.currentStage === 'REAUDIT').length;
      const tallyCount = activeTally.filter(t => t.currentStage === 'TALLY_ENTRY').length;
      const againCount = activeTally.filter(t => t.currentStage === 'AGAIN_AUDIT').length;
      const totalAuditCount = activeTally.length;

      // 14. Bill Not Received
      const bills = getBillNotReceived() || [];
      const billNotReceivedCount = bills.filter(b => b.billStatus !== 'Received').length;

      setCounts({ 
        approval: approvalCount,
        vendorRate: vendorRateCount,
        technical: technicalCount,
        management: managementCount,
        poToBeCreate: poToBeCreateCount,
        lifting: liftingCount, 
        storeIn: storeInCount,
        hodCheck: hodCheckCount,
        freightPayment: freightPaymentCount,
        makePayment: makePaymentCount,
        rejectGRN: rejectGRNCount,
        sendDebit: sendDebitCount,
        totalAudit: totalAuditCount,
        audit: auditCount,
        rectify: rectifyCount,
        reaudit: reauditCount,
        tally: tallyCount,
        again: againCount,
        billNotReceived: billNotReceivedCount,
        enquiry: enquiryCount
      });
    };

    refreshCounts();
    const interval = setInterval(refreshCounts, 15000); // More frequent refresh
    window.addEventListener('focus', refreshCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshCounts);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const adminMenuItems = [
    { path: '/dashboard',           icon: TrendingUp,     label: 'Dashboard' },
    { path: '/master',              icon: LayoutGrid,     label: 'Master' },
    { path: '/create-indent',       icon: FilePlus,       label: 'Create Indent' },
    { path: '/approval-indent',     icon: ClipboardCheck, label: 'Approval Indent',     count: counts.approval },
    { path: '/vendor-rate',         icon: Tags,           label: 'Vendor Rate',         count: counts.vendorRate },
    { path: '/enquiry',             icon: HelpCircle,     label: 'Create Enquiry',      count: counts.enquiry },
    { path: '/enquiry-history',     icon: History,        label: 'Enquiry History' },
    { path: '/technical-approval',  icon: Cpu,            label: 'Technical Approval',  count: counts.technical },
    { path: '/management-approval', icon: UserCheck,      label: 'Management Approval', count: counts.management },
    { path: '/po-to-be-create',     icon: PackageSearch,  label: 'PO to be Create',     count: counts.poToBeCreate },
    { path: '/create-po',           icon: FilePlus2,      label: 'Create PO' },
    { path: '/po-history',          icon: History,        label: 'PO History' },
    { path: '/lifting',             icon: Truck,          label: 'Lifting',             count: counts.lifting },
    { path: '/store-in',            icon: Package,        label: 'Store In',            count: counts.storeIn },
    { path: '/hod-check',           icon: ClipboardCheck, label: 'HOD Check',           count: counts.hodCheck },
    { path: '/freight-payment',     icon: Truck,          label: 'Freight Payment',     count: counts.freightPayment },
    { path: '/make-payment',        icon: CreditCard,     label: 'Make Payment',        count: counts.makePayment },
    { path: '/reject-grn',          icon: Ban,            label: 'Reject for GRN',      count: counts.rejectGRN },
    { path: '/send-debit',          icon: FileText,       label: 'Send Debit Note',     count: counts.sendDebit },
    
    // Collapsible Audit Data Menu
    {
      isNested: true,
      isOpen: isAuditOpen,
      onToggle: () => setIsAuditOpen(!isAuditOpen),
      icon: ShieldCheck,
      label: 'Audit Data',
      count: counts.totalAudit,
      subItems: [
        { path: '/audit-all-pending', label: 'All Pending', count: counts.totalAudit },
        { path: '/audit-stage', label: 'Audit stage', count: counts.audit },
        { path: '/rectify-stage', label: 'Rectify stage', count: counts.rectify },
        { path: '/reaudit-stage', label: 'Reaudit stage', count: counts.reaudit },
        { path: '/tally-entry', label: 'Tally Entry', count: counts.tally },
        { path: '/again-audit', label: 'Again Audit', count: counts.again }
      ]
    },

    // PC Dashboard Route
    { path: '/pcdb', icon: Coins, label: 'PC Dashboard' },

    // Collapsible Store Data Menu
    {
      isNested: true,
      isOpen: isStoreDataOpen,
      onToggle: () => setIsStoreDataOpen(!isStoreDataOpen),
      icon: Warehouse,
      label: 'Store Data',
      subItems: [
        { path: '/store-issue', label: 'Store Issue' },
        { path: '/store-issue-return', label: 'Store Return' }
      ]
    },

    // Inventory Route
    { path: '/inventory', icon: Blocks, label: 'Inventory' },

    // Bill Not Received Route
    { path: '/bill-not-received', icon: Receipt, label: 'Bill Not Received', count: counts.billNotReceived },

    { path: '/settings',            icon: Settings,       label: 'Settings' },
  ];

  const employeeMenuItems = [
    { path: '/master',        icon: LayoutGrid, label: 'Master' },
    { path: '/create-indent', icon: FilePlus,   label: 'Create Indent' },
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 sm:w-72 lg:w-56 2xl:w-60 bg-white border-r border-indigo-100 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-indigo-600 tracking-tight">Botivate</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-indigo-100/50 rounded-lg">
              <X size={20} className="text-indigo-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {menuItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.isNested ? (
                  <div className="space-y-1">
                    <button
                      onClick={item.onToggle}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-indigo-100/50 hover:text-indigo-600 border-l-4 border-transparent`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="font-medium leading-tight whitespace-nowrap">{item.label}</span>
                      </div>
                      {item.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {item.isOpen && (
                      <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                              flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200
                              ${isActive 
                                ? 'bg-indigo-100/50 text-indigo-600' 
                                : 'text-gray-600 hover:bg-indigo-50/50 hover:text-indigo-600'}
                            `}
                          >
                            <span className="text-sm leading-tight whitespace-nowrap font-black">{sub.label}</span>
                            {sub.count > 0 && (
                              <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                {sub.count}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                      ${isActive 
                        ? 'bg-indigo-100/50 text-indigo-600 border-l-4 border-indigo-600' 
                        : 'text-gray-700 hover:bg-indigo-50/50 hover:text-indigo-600 border-l-4 border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="font-black leading-tight whitespace-nowrap">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-indigo-100 bg-indigo-50/50">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all font-semibold shadow-sm"
            >
              <LogOutIcon size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;