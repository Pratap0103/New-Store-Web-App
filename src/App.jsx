import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Master from './pages/Master/Master';
import CreateIndent from './pages/CreateIndent/CreateIndent';
import CreatedHistory from './pages/CreateIndent/CreatedHistory';
import ApprovalIndent from './pages/ApprovalIndent/ApprovalIndent';
import VendorRate from './pages/VendorRateUpdate/VendorRate';
import TechnicalApproval from './pages/TechnicalApproval/TechnicalApproval';
import ManagementApproval from './pages/ManagementApproval/ManagementApproval';
import PendingPO from './pages/POtoBeCreate/PendingPO';
import CreatePO from './pages/CreatePO/CreatePO';
import RevicePO from './pages/CreatePO/RevicePO';
import POHistory from './pages/POHistory/POHistory';
import Lifting from './pages/Lifting/Lifting';
import StoreIn from './pages/StoreIn/StoreIn';
import HODCheck from './pages/HODCheck/HODCheck';
import FrightPayment from './pages/FreightPayment/FrightPayment';
import MakePayment from './pages/MakePayment/MakePayment';
import RejectGRN from './pages/RejectForGRN/RejectGRN';
import SendDebit from './pages/SendDebitNote/SendDebit';
import AllPending from './pages/AuditData/AllPending';
import Audit from './pages/AuditData/Audit';
import Rectify from './pages/AuditData/Rectify';
import Reaudit from './pages/AuditData/Reaudit';
import Tallyentry from './pages/AuditData/Tallyentry';
import AgainAudit from './pages/AuditData/AgainAudit';

// New Modules
import BillnotRecevied from './pages/BillNotReceived/BillnotRecevied';
import PCDB from './pages/DBfoPC/PCDB';
import StoreIssue from './pages/StoreData/StoreIssue';
import StoreIssueReturn from './pages/StoreData/StoreIssueReturn';
import StoreIssueDetails from './pages/StoreData/StoreIssueDetails';
import Inventory from './pages/Inventory/Inventory';
import Enquiry from './pages/Enquiry/Enquiry';
import EnquiryHistory from './pages/Enquiry/EnquiryHistory';
import Dasboard from './pages/Dashboard/Dasboard';

import ProtectedRoute from './components/ProtectedRoute';
import { initializeStorage } from './utils/storageManager';

function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dasboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="master" element={<Master />} />
            <Route path="create-indent" element={<CreateIndent />} />
            <Route path="indent-history" element={<CreatedHistory />} />
            <Route path="approval-indent" element={<ApprovalIndent />} />
            <Route path="vendor-rate" element={<VendorRate />} />
            <Route path="technical-approval" element={<TechnicalApproval />} />
            <Route path="management-approval" element={<ManagementApproval />} />
            <Route path="po-to-be-create" element={<PendingPO />} />
            <Route path="create-po" element={<CreatePO />} />
            <Route path="revice-po" element={<RevicePO />} />
            <Route path="po-history" element={<POHistory />} />
            <Route path="lifting" element={<Lifting />} />
            <Route path="store-in" element={<StoreIn />} />
            <Route path="hod-check" element={<HODCheck />} />
            <Route path="freight-payment" element={<FrightPayment />} />
            <Route path="make-payment" element={<MakePayment />} />
            <Route path="reject-grn" element={<RejectGRN />} />
            <Route path="send-debit" element={<SendDebit />} />
            
            {/* Audit Data Module Routes */}
            <Route path="audit-all-pending" element={<AllPending />} />
            <Route path="audit-stage" element={<Audit />} />
            <Route path="rectify-stage" element={<Rectify />} />
            <Route path="reaudit-stage" element={<Reaudit />} />
            <Route path="tally-entry" element={<Tallyentry />} />
            <Route path="again-audit" element={<AgainAudit />} />

            {/* Bill Not Received Route */}
            <Route path="bill-not-received" element={<BillnotRecevied />} />

            {/* PC Dashboard Route */}
            <Route path="pcdb" element={<PCDB />} />

            {/* Store Data Routes */}
            <Route path="store-issue" element={<StoreIssue />} />
            <Route path="store-issue-return" element={<StoreIssueReturn />} />
            <Route path="store-issue-details" element={<StoreIssueDetails />} />

            {/* Inventory Route */}
            <Route path="inventory" element={<Inventory />} />

            {/* Enquiry Route */}
            <Route path="enquiry" element={<Enquiry />} />
            <Route path="enquiry-history" element={<EnquiryHistory />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;