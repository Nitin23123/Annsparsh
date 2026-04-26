import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const STATUS_STYLES = {
    AVAILABLE: 'text-emerald-600 bg-emerald-50',
    CLAIMED: 'text-amber-600 bg-amber-50',
    COLLECTED: 'text-blue-600 bg-blue-50',
    COMPLETED: 'text-blue-600 bg-blue-50',
    EXPIRED: 'text-gray-500 bg-gray-100',
    PENDING: 'text-amber-600 bg-amber-50',
    APPROVED: 'text-emerald-600 bg-emerald-50',
    REJECTED: 'text-red-600 bg-red-50',
};

const COMPLETED_DONATION_STATUSES = ['COLLECTED', 'COMPLETED', 'EXPIRED'];
const COMPLETED_REQUEST_STATUSES = ['REJECTED'];

export default function History() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        fetchHistory(user.role);
    }, []);

    const fetchHistory = async (role) => {
        setLoading(true);
        setError('');
        try {
            const url = role === 'DONOR' ? '/donations/mine' : '/requests/mine';
            const { data } = await api.get(url);
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        if (filter === 'all') return items;
        if (userRole === 'DONOR') {
            return items.filter(d => COMPLETED_DONATION_STATUSES.includes(d.status));
        }
        return items.filter(r => COMPLETED_REQUEST_STATUSES.includes(r.status) || r.donation_status === 'COLLECTED');
    }, [items, filter, userRole]);

    const heading = userRole === 'DONOR' ? 'Donation History' : 'Request History';
    const dashboardLink = userRole === 'DONOR' ? '/donor-dashboard' : '/ngo-dashboard';

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
                    <Link to={dashboardLink} className="text-white/80 hover:text-white font-medium flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <h2 className="text-3xl font-bold text-brand-green dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-4xl">history_edu</span>
                            {heading}
                        </h2>
                        <div className="inline-flex bg-white dark:bg-white/5 border border-brand-green/10 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-primary text-white shadow' : 'text-brand-green/70 hover:text-brand-green'}`}>
                                All
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'completed' ? 'bg-primary text-white shadow' : 'text-brand-green/70 hover:text-brand-green'}`}>
                                Completed
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">progress_activity</span>
                            <p className="text-brand-green/60 animate-pulse">Loading history...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            className="bg-white dark:bg-white/5 p-16 rounded-3xl border border-dashed border-brand-green/20 text-center"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}>
                            <span className="material-symbols-outlined text-6xl text-brand-green/20 mb-4">history_toggle_off</span>
                            <p className="text-xl text-brand-green/60 font-medium">
                                {items.length === 0 ? 'No history yet.' : 'Nothing matches this filter.'}
                            </p>
                            <p className="text-brand-green/40 mt-2">
                                {userRole === 'DONOR'
                                    ? 'Your donations will appear here.'
                                    : 'Your pickup requests will appear here.'}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {filtered.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-brand-green/5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(index, 8) * 0.05 }}
                                        whileHover={{ scale: 1.005 }}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4 gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide border border-gray-200">
                                                            #{item.id}
                                                        </span>
                                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px]">event</span>
                                                            {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-brand-green dark:text-white mt-2 truncate">
                                                        {item.food_type}
                                                    </h3>
                                                </div>
                                                <span className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-current/10 ${STATUS_STYLES[item.status] || 'text-gray-600 bg-gray-100'}`}>
                                                    <span className="w-2 h-2 rounded-full bg-current" />
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/70 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                                {userRole === 'DONOR' ? (
                                                    <>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donation</p>
                                                            <p className="text-gray-700 dark:text-gray-200">
                                                                <span className="font-semibold">{item.quantity}</span>
                                                            </p>
                                                            <p className="text-gray-500 text-sm">{item.address}</p>
                                                            {item.notes && (
                                                                <p className="text-gray-400 text-xs italic mt-1">{item.notes}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-3 md:pt-0 md:pl-6">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Best Before</p>
                                                            <p className="text-gray-700 dark:text-gray-200">{item.best_before} hours</p>
                                                            {item.pending_requests > 0 && (
                                                                <p className="text-amber-600 text-sm font-semibold mt-2">
                                                                    {item.pending_requests} pending request{item.pending_requests > 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donor</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-gray-400">person</span>
                                                                <span className="font-semibold text-gray-700 dark:text-gray-200">{item.donor_name || 'Unknown'}</span>
                                                            </div>
                                                            <p className="text-gray-500 text-sm mt-1">
                                                                {item.quantity} • {item.address}
                                                            </p>
                                                            <p className="text-gray-400 text-xs">Donation status: {item.donation_status}</p>
                                                        </div>
                                                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-3 md:pt-0 md:pl-6">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volunteer</p>
                                                            {item.volunteer_name ? (
                                                                <>
                                                                    <p className="font-bold text-gray-700 dark:text-gray-200">{item.volunteer_name}</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {item.volunteer_phone}
                                                                        {item.vehicle_number && ` • ${item.vehicle_number}`}
                                                                    </p>
                                                                    {item.otp_verified && (
                                                                        <p className="text-blue-600 text-xs font-semibold mt-1 flex items-center gap-1">
                                                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                            OTP verified — pickup confirmed
                                                                        </p>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic">No volunteer assigned yet.</p>
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
