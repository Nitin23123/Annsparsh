import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../api';
import socket from '../socket';

const FOOD_ICONS = { default: '🥘', rice: '🍚', bread: '🍞', biryani: '🍛', fruit: '🍎', dal: '🍲', veg: '🥦', curry: '🍛' };

function getFoodIcon(foodType = '') {
    const lower = foodType.toLowerCase();
    if (lower.includes('rice')) return '🍚';
    if (lower.includes('bread')) return '🍞';
    if (lower.includes('biryani')) return '🍛';
    if (lower.includes('fruit')) return '🍎';
    if (lower.includes('dal') || lower.includes('daal')) return '🍲';
    if (lower.includes('veg')) return '🥦';
    if (lower.includes('curry') || lower.includes('paneer')) return '🍛';
    return '🥘';
}

function expiryTime(createdAt, bestBefore) {
    return new Date(new Date(createdAt).getTime() + bestBefore * 3600000);
}

function expiryColor(createdAt, bestBefore) {
    const h = (expiryTime(createdAt, bestBefore) - Date.now()) / 3600000;
    return h < 2 ? 'text-red-500' : h < 6 ? 'text-amber-500' : 'text-emerald-500';
}

const NavItem = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
        <span className={`material-symbols-outlined text-xl ${active ? 'text-primary' : 'text-white/40 group-hover:text-white/70'}`}>{icon}</span>
        {label}
    </Link>
);

export default function DonorDashboard() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [otpInputs, setOtpInputs] = useState({}); // { requestId: otpValue }
    const [verifyingOtp, setVerifyingOtp] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [donationsRes, requestsRes] = await Promise.all([
                api.get('/donations/mine'),
                api.get('/requests/incoming'),
            ]);
            setDonations(donationsRes.data);
            setRequests(requestsRes.data);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        api.get('/auth/me').then(({ data }) => {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
        }).catch(() => {});
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const onIncoming = ({ request, donation }) => {
            setRequests(prev => {
                if (prev.some(r => r.id === request.id)) return prev;
                const enriched = {
                    ...request,
                    food_type: donation.food_type,
                    quantity: donation.quantity,
                    address: donation.address,
                };
                return [enriched, ...prev];
            });
            toast.info(`New request for ${donation.food_type}`);
        };
        const onCollected = ({ donation, request }) => {
            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, otp_verified: true, status: 'APPROVED' } : r));
            setDonations(prev => prev.map(d => d.id === donation.id ? { ...d, status: 'COLLECTED' } : d));
            toast.success('Pickup confirmed');
        };
        const onConnect = () => {
            fetchData();
        };

        socket.on('request:incoming', onIncoming);
        socket.on('pickup:collected', onCollected);
        socket.on('connect', onConnect);

        return () => {
            socket.off('request:incoming', onIncoming);
            socket.off('pickup:collected', onCollected);
            socket.off('connect', onConnect);
        };
    }, [fetchData]);

    const activeDonations = donations.filter(d => d.status === 'AVAILABLE').length;
    const approvedReqs = requests.filter(r => r.status === 'APPROVED').length;
    const pendingReqs = requests.filter(r => r.status === 'PENDING').length;

    const stats = [
        { label: 'Total Donations', value: donations.length, icon: 'volunteer_activism', gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Active Listings', value: activeDonations, icon: 'restaurant', gradient: 'from-blue-500 to-indigo-500' },
        { label: 'Approved', value: approvedReqs, icon: 'check_circle', gradient: 'from-violet-500 to-purple-600' },
        { label: 'Pending', value: pendingReqs, icon: 'pending', gradient: 'from-amber-400 to-orange-500' },
    ];

    const handleAction = async (requestId, action) => {
        try {
            await api.put(`/requests/${requestId}`, { action });
            toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'}!`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Action failed');
        }
    };

    const handleDelete = async (donationId) => {
        try {
            await api.delete(`/donations/${donationId}`);
            setDonations(prev => prev.filter(d => d.id !== donationId));
            toast.success('Donation removed.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not delete');
        }
    };

    const handleStatusUpdate = async (donationId, status) => {
        try {
            await api.put(`/donations/${donationId}/status`, { status });
            toast.success(`Marked as ${status}`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update failed');
        }
    };

    const handleVerifyOtp = async (requestId) => {
        const otp = otpInputs[requestId];
        if (!otp || otp.length < 4) return toast.error('Enter 4-digit OTP');
        setVerifyingOtp(requestId);
        try {
            await api.post(`/requests/${requestId}/verify-otp`, { otp });
            toast.success('OTP verified! Food marked as collected.');
            setOtpInputs(prev => ({ ...prev, [requestId]: '' }));
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setVerifyingOtp(null);
        }
    };

    const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="flex h-screen bg-gray-50 font-display overflow-hidden">

            {/* Sidebar */}
            <aside className="w-60 shrink-0 flex flex-col" style={{ background: '#0f2f1c' }}>
                <div className="p-5 flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                        <span className="material-symbols-outlined text-white text-lg">eco</span>
                    </div>
                    <span className="text-white font-bold tracking-tight">AnnSparsh</span>
                </div>

                <div className="mx-4 mb-4 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Donor Dashboard</span>
                </div>

                <nav className="flex-1 px-3 space-y-0.5">
                    <NavItem to="/donor-dashboard" icon="grid_view" label="Dashboard" active />
                    <NavItem to="/create-donation" icon="add_circle" label="Donate Food" />
                    <NavItem to="/history" icon="history" label="History" />
                    <NavItem to="/profile" icon="person" label="Profile" />
                    <div className="pt-3 mt-3 border-t border-white/10 space-y-0.5">
                        <NavItem to="/" icon="home" label="Home" />
                        <Link to="/auth" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium group">
                            <span className="material-symbols-outlined text-xl text-red-400/40 group-hover:text-red-300">logout</span>
                            Log Out
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
                        <div className="size-9 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(user.name || 'D')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user.name || 'Donor'}</p>
                            <p className="text-white/40 text-xs truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="shrink-0 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{greeting}, {(user.name || 'Donor').split(' ')[0]} 👋</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Here's what's happening with your donations today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchData} className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">refresh</span>
                        </button>
                        <Link to="/create-donation"
                            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 text-sm">
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Donation
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <motion.div key={s.label}
                                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`size-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-md mb-3`}>
                                    <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* My Donations */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">restaurant</span>
                                My Donations
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{donations.length}</span>
                            </h2>
                            <Link to="/create-donation" className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-sm">add</span> Add new
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-44 animate-pulse" />
                                ))}
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <span className="text-4xl block mb-2">🍽️</span>
                                <p className="text-gray-500 text-sm font-medium">No donations yet</p>
                                <Link to="/create-donation" className="text-primary text-sm font-bold hover:underline mt-1 inline-block">Create your first →</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {donations.map((d, i) => {
                                        const expiry = expiryTime(d.created_at, d.best_before);
                                        const pendingCount = parseInt(d.pending_requests || 0);
                                        return (
                                            <motion.div key={d.id}
                                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                                <div className={`h-1 ${d.status === 'AVAILABLE' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : d.status === 'CLAIMED' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-gray-200 to-gray-300'}`} />
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="size-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
                                                            {getFoodIcon(d.food_type)}
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${d.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : d.status === 'CLAIMED' ? 'bg-blue-50 text-blue-600' : d.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                                                            {d.status}
                                                        </span>
                                                    </div>
                                                    <p className="font-bold text-gray-900 text-sm">{d.food_type}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{d.quantity}</p>
                                                    <div className="mt-3 space-y-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                                                            <span className={`font-medium ${expiryColor(d.created_at, d.best_before)}`}>
                                                                Best before {expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                                                            <span className="truncate">{d.address}</span>
                                                        </div>
                                                        {pendingCount > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                                                                <span className="material-symbols-outlined text-[13px]">notifications</span>
                                                                {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex gap-1.5">
                                                        {d.status === 'AVAILABLE' && (
                                                            <button onClick={() => handleDelete(d.id)}
                                                                className="flex-1 py-1.5 text-xs border border-red-100 text-red-400 hover:bg-red-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                                                                <span className="material-symbols-outlined text-[13px]">delete</span> Remove
                                                            </button>
                                                        )}
                                                        {d.status === 'CLAIMED' && (
                                                            <button onClick={() => handleStatusUpdate(d.id, 'COLLECTED')}
                                                                className="flex-1 py-1.5 text-xs border border-blue-100 text-blue-500 hover:bg-blue-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                                                                <span className="material-symbols-outlined text-[13px]">local_shipping</span> Collected
                                                            </button>
                                                        )}
                                                        {d.status === 'COLLECTED' && (
                                                            <button onClick={() => handleStatusUpdate(d.id, 'COMPLETED')}
                                                                className="flex-1 py-1.5 text-xs border border-emerald-100 text-emerald-600 hover:bg-emerald-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                                                                <span className="material-symbols-outlined text-[13px]">check_circle</span> Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>

                    {/* Incoming Requests */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
                                Incoming Requests
                            </h2>
                            {pendingReqs > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full font-bold">{pendingReqs} pending</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                                <span className="material-symbols-outlined text-3xl text-gray-300 block mb-1">inbox</span>
                                <p className="text-gray-400 text-sm">No requests yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {requests.map((req, i) => (
                                        <motion.div key={req.id}
                                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            <div className="flex">
                                                <div className={`w-1 shrink-0 ${req.status === 'PENDING' ? 'bg-amber-400' : req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                <div className="flex-1 p-5 flex flex-col gap-3">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                                                    {(req.ngo_name || 'N')[0]}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-bold text-gray-900 truncate">{req.ngo_name}</p>
                                                                    <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()} · {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                                    {req.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                Requesting: <span className="font-semibold text-gray-900">{req.food_type}</span>
                                                                <span className="text-gray-400 ml-2">· {req.quantity}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{req.address}</p>
                                                        </div>
                                                    {req.status === 'PENDING' && (
                                                        <div className="flex gap-2 shrink-0">
                                                            <motion.button whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleAction(req.id, 'REJECT')}
                                                                className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-base">close</span> Reject
                                                            </motion.button>
                                                            <motion.button whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleAction(req.id, 'APPROVE')}
                                                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-base">check</span> Approve
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                    </div>{/* end top row */}
                                                    {req.status === 'APPROVED' && req.volunteer_name && !req.otp_verified && (
                                                        <div className="w-full mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                                                            <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                                <span className="material-symbols-outlined text-sm">directions_car</span>
                                                                Volunteer En Route
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                                                <span><span className="text-gray-400">Name:</span> <span className="font-semibold">{req.volunteer_name}</span></span>
                                                                <span><span className="text-gray-400">Phone:</span> <span className="font-semibold">{req.volunteer_phone}</span></span>
                                                                <span><span className="text-gray-400">Vehicle:</span> <span className="font-semibold">{req.vehicle_type}</span></span>
                                                                <span><span className="text-gray-400">Number:</span> <span className="font-semibold">{req.vehicle_number}</span></span>
                                                            </div>
                                                            <div className="bg-white border border-blue-200 rounded-xl p-3">
                                                                <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm text-primary">key</span>
                                                                    Verify OTP from volunteer
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text" maxLength={4}
                                                                        value={otpInputs[req.id] || ''}
                                                                        onChange={e => setOtpInputs(prev => ({ ...prev, [req.id]: e.target.value.replace(/\D/g, '') }))}
                                                                        placeholder="_ _ _ _"
                                                                        className="flex-1 px-3 py-2 text-center text-lg font-bold tracking-widest border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                                                                    <button
                                                                        onClick={() => handleVerifyOtp(req.id)}
                                                                        disabled={verifyingOtp === req.id}
                                                                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-1 disabled:opacity-60">
                                                                        <span className="material-symbols-outlined text-base">verified</span>
                                                                        {verifyingOtp === req.id ? 'Verifying...' : 'Confirm'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {req.status === 'APPROVED' && req.otp_verified && (
                                                        <div className="w-full mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                                            <div>
                                                                <p className="text-xs font-bold text-emerald-700">Food Collected ✓</p>
                                                                <p className="text-xs text-emerald-600">{req.volunteer_name} picked up the food</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {req.status === 'APPROVED' && !req.volunteer_name && (
                                                        <div className="w-full mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-amber-500 text-sm">hourglass_top</span>
                                                            <p className="text-xs text-amber-700">Waiting for NGO to assign a volunteer...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
