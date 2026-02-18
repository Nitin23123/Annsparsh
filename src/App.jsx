import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from './socket';

import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import StatsSection from './components/StatsSection';
import ImpactMap from './components/ImpactMap';
import Footer from './components/Footer';
import Auth from './components/Auth';
import RoleSelection from './components/RoleSelection';
import DonorDashboard from './components/DonorDashboard';
import NGODashboard from './components/NGODashboard';
import CreateDonation from './components/CreateDonation';
import DonationManagement from './components/DonationManagement';
import Tracking from './components/Tracking';
import AdminDashboard from './components/AdminDashboard';
import VerificationPending from './components/VerificationPending';
import UserProfile from './components/UserProfile';
import History from './components/History';
import ShelterFinder from './components/ShelterFinder';
import Notifications from './components/Notifications';
import HelpCenter from './components/HelpCenter';
import './App.css';

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <StatsSection />
        <ImpactMap />
      </main>
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('donation:created', (data) => {
      toast.info(`New Donation Available: ${data.foodItem}`);
    });

    socket.on('request:created', (data) => {
      toast.warning(`New Request for ${data.donation.foodItem}`);
    });

    socket.on('request:updated', (data) => {
      const msg = data.status === 'APPROVED' ? 'Request Approved! 🎉' : 'Request Rejected ❌';
      toast.success(msg);
    });

    return () => {
      socket.off('connect');
      socket.off('donation:created');
      socket.off('request:created');
      socket.off('request:updated');
    };
  }, []);

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Protected Routes */}
        <Route path="/donor-dashboard" element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/ngo-dashboard" element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NGODashboard />
          </ProtectedRoute>
        } />
        <Route path="/create-donation" element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <CreateDonation />
          </ProtectedRoute>
        } />
        <Route path="/donation-requests" element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <DonationManagement />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute allowedRoles={['DONOR', 'NGO']}>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/tracking" element={<Tracking />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/shelters" element={<ShelterFinder />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
    </div>
  );
}

export default App;
