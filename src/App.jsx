import { Routes, Route } from 'react-router-dom';
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
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/ngo-dashboard" element={<NGODashboard />} />
        <Route path="/create-donation" element={<CreateDonation />} />
        <Route path="/donation-requests" element={<DonationManagement />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/history" element={<History />} />
        <Route path="/shelters" element={<ShelterFinder />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
    </div>
  );
}

export default App;
