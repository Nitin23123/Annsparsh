import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../api';
import socket from '../socket';

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

function expiryLabel(createdAt, bestBefore) {
    const expiry = new Date(new Date(createdAt).getTime() + bestBefore * 3600000);
    const h = (expiry - Date.now()) / 3600000;
    if (h < 0) return { text: 'Expired', cls: 'text-red-500' };
    if (h < 2) return { text: Math.round(h * 60) + 'm left', cls: 'text-red-500' };
    if (h < 24) return { text: Math.round(h) + 'h left', cls: 'text-amber-500' };
    return { text: Math.round(h / 24) + 'd left', cls: 'text-emerald-500' };
}

const NavLnk = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
        <span className={`material-symbols-outlined text-xl ${active ? 'text-primary' : 'text-white/40 group-hover:text-white/70'}`}>{icon}</span>
        {label}
    </Link>
);

export default function NGODashboard() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [available, setAvailable] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(null);
    const [activeSection, setActiveSection] = useState('browse');
    const [alreadyRequested, setAlreadyRequested] = useState(new Set());
    const [volunteerModal, setVolunteerModal] = useState(null); // holds request object
    const [volunteerForm, setVolunteerForm] = useState({ volunteer_name: '', volunteer_phone: '', vehicle_type: 'Two-Wheeler', vehicle_number: '' });
    const [submittingVolunteer, setSubmittingVolunteer] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [availRes, reqRes] = await Promise.all([
                api.get('/donations/available'),
                api.get('/requests/mine'),
            ]);
            setAvailable(availRes.data);
            setMyRequests(reqRes.data);
            // track which donation IDs this NGO already requested
            const ids = new Set(reqRes.data.map(r => r.donation_id));
            setAlreadyRequested(ids);
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
        const onAvailable = ({ donation }) => {
            setAvailable(prev => {
                if (prev.some(d => d.id === donation.id)) return prev;
                return [donation, ...prev];
            });
            toast.info(`New donation: ${donation.food_type}`);
        };
        const onResolved = ({ request, status, otp }) => {
            setMyRequests(prev => prev.map(r => {
                if (r.id !== request.id) return r;
                return { ...r, ...request, status, otp: otp ?? r.otp };
            }));
            if (otp) {
                toast.success(`OTP issued: ${otp}`);
            } else {
                toast.info(`Request ${status.toLowerCase()}`);
            }
        };
        const onCollected = ({ donation, request }) => {
            setMyRequests(prev => prev.map(r => r.id === request.id ? { ...r, otp_verified: true } : r));
            setAvailable(prev => prev.filter(d => d.id !== donation.id));
            toast.success('Pickup confirmed');
        };
        const onConnect = () => {
            fetchData();
        };

        socket.on('donation:available', onAvailable);
        socket.on('request:resolved', onResolved);
        socket.on('pickup:collected', onCollected);
        socket.on('connect', onConnect);

        return () => {
            socket.off('donation:available', onAvailable);
            socket.off('request:resolved', onResolved);
            socket.off('pickup:collected', onCollected);
            socket.off('connect', onConnect);
        };
    }, [fetchData]);

    const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
    const approvedCount = myRequests.filter(r => r.status === 'APPROVED').length;

    const stats = [
        { label: 'Available Food', value: available.length, icon: 'restaurant', gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Requests Sent', value: myRequests.length, icon: 'send', gradient: 'from-blue-500 to-indigo-500' },
        { label: 'Approved', value: approvedCount, icon: 'check_circle', gradient: 'from-violet-500 to-purple-600' },
        { label: 'Pending', value: pendingCount, icon: 'hourglass_top', gradient: 'from-amber-400 to-orange-500' },
    ];

    const handleRequest = async (donationId) => {
        setRequesting(donationId);
        try {
            await api.post('/requests', { donation_id: donationId });
            toast.success('Request sent successfully!');
            await fetchData();
            setActiveSection('requests');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Request failed');
        } finally {
            setRequesting(null);
        }
    };

    const handleAssignVolunteer = async (e) => {
        e.preventDefault();
        setSubmittingVolunteer(true);
        try {
            await api.put(`/requests/${volunteerModal.id}/volunteer`, volunteerForm);
            toast.success('Volunteer assigned! OTP generated.');
            setVolunteerModal(null);
            setVolunteerForm({ volunteer_name: '', volunteer_phone: '', vehicle_type: 'Two-Wheeler', vehicle_number: '' });
            await fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to assign volunteer');
        } finally {
            setSubmittingVolunteer(false);
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
                <div className="mx-4 mb-4 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">NGO Dashboard</span>
                </div>

                <nav className="flex-1 px-3 space-y-0.5">
                    <button onClick={() => setActiveSection('browse')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left ${activeSection === 'browse' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                        <span className={`material-symbols-outlined text-xl ${activeSection === 'browse' ? 'text-primary' : 'text-white/40'}`}>restaurant_menu</span>
                        Browse Food
                        {!loading && available.length > 0 && (
                            <span className="ml-auto text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">{available.length}</span>
                        )}
                    </button>
                    <button onClick={() => setActiveSection('requests')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left ${activeSection === 'requests' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                        <span className={`material-symbols-outlined text-xl ${activeSection === 'requests' ? 'text-primary' : 'text-white/40'}`}>list_alt</span>
                        My Requests
                        {pendingCount > 0 && <span className="ml-auto text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>}
                    </button>
                    <NavLnk to="/profile" icon="person" label="Profile" />
                    <div className="pt-3 mt-3 border-t border-white/10 space-y-0.5">
                        <NavLnk to="/" icon="home" label="Home" />
                        <Link to="/auth" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium group">
                            <span className="material-symbols-outlined text-xl text-red-400/40 group-hover:text-red-300">logout</span>
                            Log Out
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
                        <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(user.name || 'N')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user.name || 'NGO'}</p>
                            <p className="text-white/40 text-xs truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="shrink-0 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{greeting}, {(user.name || 'NGO').split(' ')[0]} 👋</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Browse available donations and manage your food requests.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchData} className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">refresh</span>
                        </button>
                        {!loading && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {available.length} donations live
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`size-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-md mb-3`}>
                                    <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Browse Food */}
                    {activeSection === 'browse' && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-lg">restaurant_menu</span>
                                Available Food Donations
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{available.length}</span>
                            </h2>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                                    ))}
                                </div>
                            ) : available.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                                    <span className="text-4xl block mb-3">🍽️</span>
                                    <p className="text-gray-500 text-sm font-medium">No food available right now</p>
                                    <p className="text-gray-400 text-xs mt-1">Check back soon — donors list new food daily</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                        {available.map((d, i) => {
                                            const exp = expiryLabel(d.created_at, d.best_before);
                                            const alreadySent = alreadyRequested.has(d.id);
                                            return (
                                                <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
                                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-5 pt-5 pb-4 border-b border-gray-100">
                                                        <div className="flex items-start justify-between">
                                                            <div className="size-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl">
                                                                {getFoodIcon(d.food_type)}
                                                            </div>
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white border ${exp.cls}`}>{exp.text}</span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 mt-3">{d.food_type}</h3>
                                                    </div>
                                                    <div className="p-5">
                                                        {d.notes && <p className="text-xs text-gray-500 mb-4 line-clamp-2">{d.notes}</p>}
                                                        <div className="space-y-2 mb-5">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="material-symbols-outlined text-[14px] text-primary">production_quantity_limits</span>
                                                                <span className="font-semibold text-gray-700">{d.quantity}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                                                                <span>{d.donor_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                                                                <span className="truncate">{d.address}</span>
                                                            </div>
                                                        </div>
                                                        {alreadySent ? (
                                                            <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center bg-gray-100 text-gray-400 flex items-center justify-center gap-1.5">
                                                                <span className="material-symbols-outlined text-lg">check</span>
                                                                Request Sent
                                                            </div>
                                                        ) : (
                                                            <motion.button whileTap={{ scale: 0.97 }}
                                                                onClick={() => handleRequest(d.id)}
                                                                disabled={requesting === d.id}
                                                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all text-sm flex items-center justify-center gap-1.5 disabled:opacity-60">
                                                                {requesting === d.id ? (
                                                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                                                                )}
                                                                {requesting === d.id ? 'Sending...' : 'Request Food'}
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    )}

                    {/* My Requests */}
                    {activeSection === 'requests' && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-lg">list_alt</span>
                                My Requests
                                {pendingCount > 0 && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">{pendingCount} pending</span>}
                            </h2>

                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}
                                </div>
                            ) : myRequests.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <span className="text-4xl block mb-2">📋</span>
                                    <p className="text-gray-500 text-sm font-medium">No requests yet</p>
                                    <button onClick={() => setActiveSection('browse')} className="text-primary text-sm font-bold hover:underline mt-1">Browse available food →</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myRequests.map((req, i) => (
                                        <motion.div key={req.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="flex">
                                                <div className={`w-1 shrink-0 ${req.status === 'APPROVED' ? 'bg-emerald-500' : req.status === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'}`} />
                                                <div className="flex-1 p-5">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg">
                                                                {getFoodIcon(req.food_type)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{req.food_type}</p>
                                                                <p className="text-xs text-gray-400">{req.quantity} · from {req.donor_name}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                                                            {req.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                                                            {req.address}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                                                            {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {req.status === 'APPROVED' && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {req.volunteer_name ? (
                                                                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-1.5">
                                                                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                                                                        <span className="material-symbols-outlined text-sm">directions_car</span>
                                                                        Volunteer Assigned
                                                                    </p>
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                                                        <span><span className="text-gray-400">Name:</span> {req.volunteer_name}</span>
                                                                        <span><span className="text-gray-400">Phone:</span> {req.volunteer_phone}</span>
                                                                        <span><span className="text-gray-400">Vehicle:</span> {req.vehicle_type}</span>
                                                                        <span><span className="text-gray-400">Number:</span> {req.vehicle_number}</span>
                                                                    </div>
                                                                    <div className="mt-2 flex items-center gap-3 bg-white border border-emerald-200 rounded-xl px-3 py-2">
                                                                        <span className="material-symbols-outlined text-primary text-sm">key</span>
                                                                        <div>
                                                                            <p className="text-[10px] text-gray-400 font-medium">Pickup OTP — share with volunteer</p>
                                                                            <p className="text-xl font-bold tracking-[0.3em] text-gray-900">{req.otp}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => { setVolunteerModal(req); setVolunteerForm({ volunteer_name: '', volunteer_phone: '', vehicle_type: 'Two-Wheeler', vehicle_number: '' }); }}
                                                                    className="inline-flex items-center gap-2 text-xs bg-primary text-white px-3 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                                                    Assign Volunteer
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {req.status === 'REJECTED' && (
                                                        <div className="mt-3 inline-flex items-center gap-2 text-xs bg-red-50 text-red-600 px-3 py-2 rounded-xl border border-red-100">
                                                            <span className="material-symbols-outlined text-sm">cancel</span>
                                                            Request was not approved
                                                        </div>
                                                    )}
                                                    {req.status === 'PENDING' && (
                                                        <div className="mt-3 inline-flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-xl border border-amber-100">
                                                            <span className="material-symbols-outlined text-sm">hourglass_top</span>
                                                            Waiting for donor approval
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>

            {/* Volunteer Assignment Modal */}
            <AnimatePresence>
                {volunteerModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setVolunteerModal(null); }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-emerald-600 px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Assign Volunteer</h3>
                                        <p className="text-white/70 text-xs mt-0.5">For: {volunteerModal.food_type}</p>
                                    </div>
                                    <button onClick={() => setVolunteerModal(null)} className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={handleAssignVolunteer} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Volunteer Name</label>
                                        <input
                                            type="text" required
                                            value={volunteerForm.volunteer_name}
                                            onChange={e => setVolunteerForm(p => ({ ...p, volunteer_name: e.target.value }))}
                                            placeholder="Full name"
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone Number</label>
                                        <input
                                            type="tel" required
                                            value={volunteerForm.volunteer_phone}
                                            onChange={e => setVolunteerForm(p => ({ ...p, volunteer_phone: e.target.value }))}
                                            placeholder="10-digit number"
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Vehicle Type</label>
                                    <select
                                        value={volunteerForm.vehicle_type}
                                        onChange={e => setVolunteerForm(p => ({ ...p, vehicle_type: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                                        <option>Two-Wheeler</option>
                                        <option>Three-Wheeler (Auto)</option>
                                        <option>Four-Wheeler (Car)</option>
                                        <option>Minivan / Tempo</option>
                                        <option>Truck</option>
                                        <option>On Foot</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Vehicle Number</label>
                                    <input
                                        type="text" required
                                        value={volunteerForm.vehicle_number}
                                        onChange={e => setVolunteerForm(p => ({ ...p, vehicle_number: e.target.value }))}
                                        placeholder="e.g. DL 01 AB 1234"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase" />
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
                                    <p className="text-xs text-amber-700">A 4-digit OTP will be generated and shared with the donor. The volunteer must quote this OTP to confirm food collection.</p>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setVolunteerModal(null)}
                                        className="flex-1 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submittingVolunteer}
                                        className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
                                        <span className="material-symbols-outlined text-base">send</span>
                                        {submittingVolunteer ? 'Assigning...' : 'Assign & Generate OTP'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
