import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function History() {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role);
            fetchHistory(user.role);
        }
    }, []);

    const fetchHistory = async (role) => {
        try {
            let res;
            if (role === 'DONOR') {
                res = await api.get('/donations/my');
            } else if (role === 'NGO') {
                res = await api.get('/requests/ngo');
            }
            if (res) {
                setHistoryData(res.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark text-deep-green font-display min-h-screen">
            <header className="bg-brand-green text-white px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-white text-2xl">eco</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">AnnSparsh</h2>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-white/80 hover:text-white font-medium flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-lg">home</span> Home
                    </Link>
                    {userRole === 'DONOR' ? (
                        <Link to="/donor-dashboard" className="text-white/80 hover:text-white font-medium flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
                        </Link>
                    ) : (
                        <Link to="/ngo-dashboard" className="text-white/80 hover:text-white font-medium flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
                        </Link>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-brand-green dark:text-white mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">history_edu</span>
                        {userRole === 'DONOR' ? 'Donation History' : 'Request History'}
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">progress_activity</span>
                            <p className="text-brand-green/60 animate-pulse">Loading history...</p>
                        </div>
                    ) : historyData.length === 0 ? (
                        <motion.div
                            className="bg-white dark:bg-white/5 p-16 rounded-3xl border border-dashed border-brand-green/20 text-center"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <span className="material-symbols-outlined text-6xl text-brand-green/20 mb-4">history_toggle_off</span>
                            <p className="text-xl text-brand-green/60 font-medium">No history found.</p>
                            <p className="text-brand-green/40 mt-2">Past activities will appear here.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {historyData.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-brand-green/5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700"></div>

                                        <div className="relative z-10">
                                            {/* Header Row */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2.5 py-1 bg-gray-100/80 backdrop-blur-sm text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide border border-gray-200">
                                                            ID: #{item.id}
                                                        </span>
                                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px]">event</span>
                                                            {new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-brand-green dark:text-white mt-2">
                                                        {userRole === 'DONOR' ? item.foodItem : item.donation.foodItem}
                                                    </h3>
                                                </div>
                                                <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/10 shadow-sm">
                                                    <span className={`font-bold flex items-center gap-1.5 ${item.status === 'CLAIMED' || item.status === 'APPROVED' ? 'text-green-600' : item.status === 'PENDING' ? 'text-orange-500' : 'text-gray-500'}`}>
                                                        <span className="w-2 h-2 rounded-full bg-current"></span>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                                {userRole === 'DONOR' ? (
                                                    // Donor View Details
                                                    <>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donation Details</p>
                                                            <p className="text-gray-700 dark:text-gray-200"><span className="font-semibold">{item.quantity}</span> • {item.foodType}</p>
                                                            <p className="text-gray-500 text-sm truncate">{item.pickupAddress}</p>
                                                        </div>
                                                        {item.requests && item.requests.length > 0 && (
                                                            <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-3 md:pt-0 md:pl-6">
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Picked Up By</p>
                                                                {item.requests.map(req => (
                                                                    req.status === 'APPROVED' && (
                                                                        <div key={req.id}>
                                                                            <p className="font-bold text-primary">{req.ngo.name}</p>
                                                                            <p className="text-sm text-gray-500">Phone: {req.ngo.phone}</p>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    // NGO View Details
                                                    <>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donation Source</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-gray-400">person</span>
                                                                <span className="font-semibold text-gray-700 dark:text-gray-200">{item.donation.donor.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-gray-400">call</span>
                                                                <span className="text-gray-600 dark:text-gray-300">{item.donation.donor.phone}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-3 md:pt-0 md:pl-6">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Volunteer</p>
                                                            {item.volunteerName ? (
                                                                <>
                                                                    <p className="font-bold text-gray-700 dark:text-gray-200">{item.volunteerName}</p>
                                                                    <p className="text-sm text-gray-500">{item.volunteerPhone} • {item.vehicleNumber}</p>
                                                                </>
                                                            ) : (
                                                                <p className="text-sm text-orange-500 italic">No volunteer assigned yet.</p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
