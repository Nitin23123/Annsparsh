import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import Tracking from './components/Tracking';
import AdminDashboard from './components/AdminDashboard';
import VerificationPending from './components/VerificationPending';
import UserProfile from './components/UserProfile';
import History from './components/History';
import ShelterFinder from './components/ShelterFinder';
import Notifications from './components/Notifications';
import HelpCenter from './components/HelpCenter';
import Grievances from './components/Grievances';
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

        <Route path="/tracking" element={
          <ProtectedRoute allowedRoles={['DONOR', 'NGO']}>
            <Tracking />
          </ProtectedRoute>
        } />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/verification" element={<VerificationPending />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/shelters" element={<ShelterFinder />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/report" element={<Grievances />} />
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={['DONOR', 'NGO']}>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
    </div>
  );
}

export default App;
