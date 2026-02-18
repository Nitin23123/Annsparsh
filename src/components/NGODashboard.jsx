import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import socket from '../socket';

export default function NGODashboard() {
    const [donations, setDonations] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [volunteerData, setVolunteerData] = useState({ name: '', phone: '', vehicle: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [donationsRes, requestsRes] = await Promise.all([
                    api.get('/donations'),
                    api.get('/requests/ngo') // Assuming this endpoint exists or we filter by user
                ]);
                setDonations(donationsRes.data);
                setMyRequests(requestsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Real-time listener
        socket.on('donation:created', (newDonation) => {
            setDonations((prev) => [newDonation, ...prev]);
        });

        socket.on('request:updated', (updatedRequest) => {
            setMyRequests((prev) => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
        });

        return () => {
            socket.off('donation:created');
            socket.off('request:updated');
        };
    }, []);

    const handleRequest = async (donationId) => {
        try {
            const res = await api.post('/requests', { donationId });
            alert('Request sent successfully!');
            setMyRequests((prev) => [res.data, ...prev]);
        } catch (error) {
            console.error('Error sending request:', error);
            const msg = error.response?.data?.message || 'Failed to send request.';
            alert(msg);
        }
    };

    const openVolunteerModal = (req) => {
        setSelectedRequest(req);
        setShowVolunteerModal(true);
    };

    const submitVolunteerInfo = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/requests/${selectedRequest.id}`, {
                volunteerName: volunteerData.name,
                volunteerPhone: volunteerData.phone,
                vehicleNumber: volunteerData.vehicle
            });
            alert('Volunteer assigned successfully!');
            setShowVolunteerModal(false);
            setVolunteerData({ name: '', phone: '', vehicle: '' });
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            alert('Failed to assign volunteer');
        }
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark text-deep-green font-display min-h-screen">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-brand-green text-white flex flex-col shrink-0 relative z-20 shadow-2xl">
                    <div className="p-6 flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
                            <span className="material-symbols-outlined text-white text-2xl">eco</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">AnnSparsh</h1>
                    </div>
                    <nav className="mt-6 flex-1 px-3 space-y-2">
                        <Link to="/ngo-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/20 text-primary border-r-4 border-primary transition-all group">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link to="/history" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-white/70 group-hover:text-white">history</span>
                            <span className="font-medium">History</span>
                        </Link>
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                                <span className="material-symbols-outlined text-white/70 group-hover:text-white">home</span>
                                <span className="font-medium">Back to AnnSparsh</span>
                            </Link>
                            <Link
                                to="/auth"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all text-red-200 hover:text-red-100"
                            >
                                <span className="material-symbols-outlined text-red-300 group-hover:text-red-100">logout</span>
                                <span className="font-medium">Log Out</span>
                            </Link>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-brand-cream dark:bg-background-dark relative">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-brand-cream/80 backdrop-blur-md dark:bg-background-dark/80 border-b border-brand-green/5">
                        <div>
                            <h2 className="text-2xl font-bold text-brand-green dark:text-warm-cream">NGO Dashboard</h2>
                            <p className="text-brand-green/70 dark:text-white/60 text-sm">Find available food donations and manage requests.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/50 px-4 py-2 rounded-full border border-brand-green/10 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-sm font-medium text-brand-green">Live Updates Active</span>
                            </div>
                        </div>
                    </header>

                    <div className="px-8 pb-10 space-y-12 mt-6">

                        {/* My Requests Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-xl font-bold text-brand-green dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list_alt</span>
                                My Requests
                            </h3>
                            {myRequests.length === 0 ? (
                                <motion.div
                                    className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-dashed border-brand-green/20 text-center"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <p className="text-brand-green/60">No active requests. Request food below!</p>
                                </motion.div>
                            ) : (
                                <div className="grid gap-4">
                                    <AnimatePresence>
                                        {myRequests.map((req, index) => (
                                            <motion.div
                                                key={req.id}
                                                className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-brand-green/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-brand-green"></div>
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-brand-green dark:text-white flex items-center gap-2">
                                                            {req.donation.foodItem}
                                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' : req.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                                {req.status}
                                                            </span>
                                                        </h3>

                                                        <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                                {new Date(req.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {/* Donor Contact for Approved Requests */}
                                                        {req.status === 'APPROVED' && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                className="flex flex-wrap items-center gap-4 text-sm mt-3 bg-green-50/50 p-2 rounded-lg border border-green-100"
                                                            >
                                                                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                                    <span className="font-semibold">{req.donation.donor.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm text-primary">call</span>
                                                                    <a href={`tel:${req.donation.donor.phone}`} className="text-primary font-bold hover:underline">{req.donation.donor.phone || 'N/A'}</a>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {req.volunteerName && (
                                                            <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded border border-blue-100 inline-flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-sm">local_shipping</span>
                                                                <span><span className="font-bold">Volunteer:</span> {req.volunteerName} ({req.vehicleNumber})</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {req.status === 'APPROVED' && !req.volunteerName && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => openVolunteerModal(req)}
                                                            className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">local_shipping</span>
                                                            Assign Volunteer
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.section>

                        {/* Available Donations Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-brand-green dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">restaurant</span>
                                Available Food
                            </h2>
                            {donations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-brand-green/60 text-lg">No food donations available right now.</p>
                                    <p className="text-brand-green/40">Check back soon!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {donations.map((donation, index) => (
                                            <motion.div
                                                key={donation.id}
                                                className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg shadow-brand-green/5 border border-brand-green/5 hover:shadow-xl transition-all group"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ y: -5 }}
                                            >
                                                {/* Image Placeholder or Actual Image */}
                                                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                                                    {donation.imageUrl ? (
                                                        <img src={donation.imageUrl} alt={donation.foodItem} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-brand-green/10 text-brand-green/20">
                                                            <span className="material-symbols-outlined text-6xl">restaurant_menu</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-green shadow-sm">
                                                        {donation.foodType}
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold text-brand-green dark:text-white leading-tight">{donation.foodItem}</h3>
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{donation.description || "No description provided."}</p>

                                                    <div className="space-y-2 mb-6">
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span className="material-symbols-outlined text-[18px]">production_quantity_limits</span>
                                                            <span>Quantity: <span className="font-semibold text-gray-700 dark:text-gray-200">{donation.quantity}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                            <span>Expires: <span className="font-semibold text-red-500">{new Date(donation.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                            <span className="truncate">{donation.pickupAddress}</span>
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleRequest(donation.id)}
                                                        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined">volunteer_activism</span>
                                                        Request Food
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.section>
                    </div>
                </main>

                {/* Volunteer Modal */}
                {showVolunteerModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                            <h3 className="text-2xl font-bold mb-1 text-brand-green">Assign Volunteer</h3>
                            <p className="text-gray-500 mb-6 text-sm">Enter the details of the person picking up the food.</p>

                            <form onSubmit={submitVolunteerInfo} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Volunteer Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul Kumar"
                                        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        value={volunteerData.name}
                                        onChange={(e) => setVolunteerData({ ...volunteerData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        value={volunteerData.phone}
                                        onChange={(e) => setVolunteerData({ ...volunteerData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. DL 10 AB 1234"
                                        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        value={volunteerData.vehicle}
                                        onChange={(e) => setVolunteerData({ ...volunteerData, vehicle: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowVolunteerModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Assign Now</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
