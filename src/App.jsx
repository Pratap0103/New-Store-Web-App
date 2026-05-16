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
            <Route index element={<Navigate to="/create-indent" replace />} />
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;