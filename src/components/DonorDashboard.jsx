import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import socket from '../socket';

export default function DonorDashboard() {
    const [requests, setRequests] = useState([]);
    const [activeDonations, setActiveDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Requests for my donations
                const requestsRes = await api.get('/requests/donor');
                setRequests(requestsRes.data);

                // Fetch my active donations (optional, but good context)
                // const donationsRes = await api.get('/donations/my'); 
                // For now, we focus on requests
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Real-time listener
        socket.on('request:created', (newRequest) => {
            // Ideally check if this request belongs to my donation, but for now we append
            // To be safe, we could re-fetch or just append if we trust the broadcast
            setRequests((prev) => [newRequest, ...prev]);
        });

        socket.on('request:updated', (updatedRequest) => {
            setRequests((prev) => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
        });

        return () => {
            socket.off('request:created');
            socket.off('request:updated');
        };
    }, []);

    const handleAction = async (requestId, status) => {
        try {
            await api.put(`/requests/${requestId}`, { status });
            alert(`Request ${status} successfully!`);
            // Refresh list
            const requestsRes = await api.get('/requests/donor');
            setRequests(requestsRes.data);
        } catch (error) {
            console.error('Error updating request:', error);
            const msg = error.response?.data?.message || 'Failed to update request.';
            alert(msg);
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
                        <Link to="/donor-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/20 text-primary border-r-4 border-primary transition-all group">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link to="/create-donation" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-white/70 group-hover:text-white">add_circle</span>
                            <span className="font-medium">Donate Food</span>
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
                            <h2 className="text-2xl font-bold text-brand-green dark:text-warm-cream">Donor Dashboard</h2>
                            <p className="text-brand-green/70 dark:text-white/60 text-sm">Manage your donations and approve requests.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/create-donation" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                                <span className="material-symbols-outlined">add_circle</span>
                                <span>Add Food Donation</span>
                            </Link>
                        </div>
                    </header>

                    <div className="px-8 pb-10 space-y-8 mt-6">

                        {/* Pending Requests Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-xl font-bold text-brand-green dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">notifications_active</span>
                                Pending Requests
                            </h3>
                            {loading ? (
                                <p className="text-brand-green/60 animate-pulse">Loading requests...</p>
                            ) : requests.length === 0 ? (
                                <motion.div
                                    className="bg-white dark:bg-white/5 p-12 rounded-2xl border border-dashed border-brand-green/20 text-center"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <span className="material-symbols-outlined text-4xl text-brand-green/20 mb-3">inbox</span>
                                    <p className="text-brand-green/60 font-medium">No pending requests at the moment.</p>
                                    <p className="text-sm text-brand-green/40 mt-1">Great job! You're all caught up.</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {requests.map((req, index) => (
                                            <motion.div
                                                key={req.id}
                                                className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-brand-green/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>

                                                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="px-2.5 py-1 bg-orange-100/80 backdrop-blur-sm text-orange-700 text-xs font-bold rounded-full uppercase tracking-wide border border-orange-200">Request #{req.id}</span>
                                                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                                {new Date(req.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xl font-bold text-brand-green dark:text-white mb-2">
                                                            Request for: <span className="text-primary">{req.donation.foodItem}</span>
                                                        </h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-3 p-4 bg-gray-50/80 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                                            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <span className="material-symbols-outlined text-primary text-base mt-0.5">apartment</span>
                                                                <div>
                                                                    <span className="font-semibold block text-brand-green dark:text-white">NGO Name</span>
                                                                    {req.ngo.name}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <span className="material-symbols-outlined text-primary text-base mt-0.5">chat</span>
                                                                <div>
                                                                    <span className="font-semibold block text-brand-green dark:text-white">Message</span>
                                                                    {req.message || "No message provided."}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                                                                <span className="font-semibold text-brand-green dark:text-white">Current Status:</span>
                                                                <span className={`font-bold px-2 py-0.5 rounded ${req.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : req.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {req.status}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Contact & Volunteer Info for Approved Requests */}
                                                        {req.status === 'APPROVED' && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="mt-4 bg-green-50/80 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20"
                                                            >
                                                                <p className="font-bold text-brand-green dark:text-warm-cream mb-2 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-green-600">local_shipping</span>
                                                                    Pickup Logistics
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="material-symbols-outlined text-gray-400">call</span>
                                                                        <a href={`tel:${req.ngo.phone}`} className="hover:underline text-primary font-bold hover:text-primary/80 transition-colors">Call NGO: {req.ngo.phone || 'N/A'}</a>
                                                                    </div>
                                                                    {req.volunteerName ? (
                                                                        <>
                                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                                                <span className="material-symbols-outlined text-gray-400">person</span>
                                                                                <span>Volunteer: <span className="font-semibold">{req.volunteerName}</span></span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                                                <span className="material-symbols-outlined text-gray-400">directions_car</span>
                                                                                <span>Vehicle: <span className="font-semibold">{req.vehicleNumber}</span></span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                                                <span className="material-symbols-outlined text-gray-400">smartphone</span>
                                                                                <span>Ph: <span className="font-semibold">{req.volunteerPhone}</span></span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-xs text-orange-600 italic flex items-center gap-1 col-span-2">
                                                                            <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                                                            Waiting for NGO to assign volunteer details...
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {req.status === 'PENDING' && (
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleAction(req.id, 'REJECTED')}
                                                                className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                                Reject
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleAction(req.id, 'APPROVED')}
                                                                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                                                Approve Request
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>

                    </div>
                </main>
            </div>
        </div>
    );
}

