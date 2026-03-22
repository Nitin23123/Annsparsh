import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, donationsRes, requestsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/donations'),
                api.get('/admin/requests'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setDonations(donationsRes.data);
            setRequests(requestsRes.data);
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleVerify = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}/verify`, { is_verified: !currentStatus });
            toast.success(`User ${!currentStatus ? 'verified' : 'unverified'}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
        } catch {
            toast.error('Failed to update user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const tabs = [
        { id: 'overview', icon: 'grid_view', label: 'Overview' },
        { id: 'users', icon: 'group', label: 'Users' },
        { id: 'donations', icon: 'inventory_2', label: 'Donations' },
        { id: 'requests', icon: 'list_alt', label: 'Requests' },
    ];

    const donors = users.filter(u => u.role === 'DONOR').length;
    const ngos = users.filter(u => u.role === 'NGO').length;
    const activeDonations = donations.filter(d => d.status === 'AVAILABLE').length;
    const completedDonations = donations.filter(d => d.status === 'COMPLETED').length;

    const overviewStats = [
        { label: 'Total Users', value: loading ? '—' : users.length, sub: `${donors} donors · ${ngos} NGOs`, icon: 'group', gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Active Donations', value: loading ? '—' : activeDonations, sub: 'Available now', icon: 'restaurant', gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Total Donations', value: loading ? '—' : donations.length, sub: 'All time', icon: 'volunteer_activism', gradient: 'from-violet-500 to-purple-600' },
        { label: 'Completed', value: loading ? '—' : completedDonations, sub: 'Fully delivered', icon: 'favorite', gradient: 'from-rose-500 to-pink-600' },
    ];

    const statusColor = (status) => {
        if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-700';
        if (status === 'CLAIMED') return 'bg-blue-100 text-blue-700';
        if (status === 'COLLECTED') return 'bg-indigo-100 text-indigo-700';
        if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600';
        if (status === 'EXPIRED') return 'bg-red-100 text-red-500';
        if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700';
        if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
        if (status === 'REJECTED') return 'bg-red-100 text-red-600';
        return 'bg-gray-100 text-gray-500';
    };

    return (
        <div className="flex h-screen bg-gray-50 font-display overflow-hidden">

            {/* Sidebar */}
            <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm">
                <div className="p-5 flex items-center gap-2.5 border-b border-gray-100">
                    <div className="size-8 rounded-lg bg-brand-green flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Admin Panel</p>
                        <p className="text-[10px] text-gray-400">AnnSparsh</p>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left ${activeTab === tab.id ? 'bg-emerald-50 text-brand-green' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-brand-green' : 'text-gray-400'}`}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-100 space-y-1">
                    <button onClick={fetchAll} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-xl text-gray-400">refresh</span>
                        Refresh
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="shrink-0 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 capitalize">
                            {activeTab === 'overview' ? 'System Overview' : activeTab}
                        </h1>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="size-9 rounded-full bg-gradient-to-br from-brand-green to-primary flex items-center justify-center text-white font-bold text-sm">A</div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {overviewStats.map((s, i) => (
                                    <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`size-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-md mb-3`}>
                                            <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                        <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent Users */}
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-900">Recent Users</h3>
                                        <button onClick={() => setActiveTab('users')} className="text-xs text-primary font-semibold hover:underline">View all</button>
                                    </div>
                                    {loading ? (
                                        <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
                                    ) : (
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-400 uppercase tracking-wide">
                                                    <th className="px-5 py-3 font-semibold">User</th>
                                                    <th className="px-5 py-3 font-semibold">Role</th>
                                                    <th className="px-5 py-3 font-semibold">Verified</th>
                                                    <th className="px-5 py-3 font-semibold">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {users.slice(0, 5).map(u => (
                                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.role === 'DONOR' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : u.role === 'ADMIN' ? 'bg-gradient-to-br from-gray-500 to-gray-700' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'}`}>
                                                                    {u.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 text-xs">{u.name}</p>
                                                                    <p className="text-gray-400 text-[11px]">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'DONOR' ? 'bg-blue-100 text-blue-700' : u.role === 'ADMIN' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'}`}>
                                                                {u.is_verified ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* Recent Requests */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-900">Recent Requests</h3>
                                        <button onClick={() => setActiveTab('requests')} className="text-xs text-primary font-semibold hover:underline">View all</button>
                                    </div>
                                    {loading ? (
                                        <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
                                    ) : (
                                        <div className="p-4 space-y-3">
                                            {requests.slice(0, 5).map((r, i) => (
                                                <motion.div key={r.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50">
                                                    <div className={`size-7 rounded-xl flex items-center justify-center shrink-0 ${r.status === 'APPROVED' ? 'bg-emerald-50' : r.status === 'PENDING' ? 'bg-amber-50' : 'bg-red-50'}`}>
                                                        <span className={`material-symbols-outlined text-[15px] ${r.status === 'APPROVED' ? 'text-emerald-500' : r.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`}>
                                                            {r.status === 'APPROVED' ? 'check_circle' : r.status === 'PENDING' ? 'hourglass_top' : 'cancel'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-700 font-medium leading-snug truncate">{r.ngo_name} → {r.food_type}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">{r.donor_name} · {new Date(r.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {requests.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No requests yet</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">All Users <span className="text-gray-400 font-normal">({users.length})</span></h3>
                                <div className="flex gap-2 text-xs text-gray-400">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{donors} Donors</span>
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{ngos} NGOs</span>
                                </div>
                            </div>
                            {loading ? (
                                <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-400 uppercase tracking-wide">
                                                <th className="px-5 py-3 font-semibold">User</th>
                                                <th className="px-5 py-3 font-semibold">Role</th>
                                                <th className="px-5 py-3 font-semibold">Joined</th>
                                                <th className="px-5 py-3 font-semibold">Verified</th>
                                                <th className="px-5 py-3 font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${u.role === 'DONOR' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : u.role === 'ADMIN' ? 'bg-gradient-to-br from-gray-500 to-gray-700' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'}`}>
                                                                {u.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{u.name}</p>
                                                                <p className="text-gray-400 text-[11px]">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'DONOR' ? 'bg-blue-100 text-blue-700' : u.role === 'ADMIN' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'}`}>
                                                            {u.is_verified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {u.role !== 'ADMIN' && (
                                                            <button onClick={() => handleVerify(u.id, u.is_verified)}
                                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${u.is_verified ? 'border border-red-200 text-red-500 hover:bg-red-50' : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                                                                {u.is_verified ? 'Unverify' : 'Verify'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Donations Tab */}
                    {activeTab === 'donations' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">All Donations <span className="text-gray-400 font-normal">({donations.length})</span></h3>
                                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">{activeDonations} active</span>
                            </div>
                            {loading ? (
                                <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-400 uppercase tracking-wide">
                                                <th className="px-5 py-3 font-semibold">Food</th>
                                                <th className="px-5 py-3 font-semibold">Donor</th>
                                                <th className="px-5 py-3 font-semibold">Quantity</th>
                                                <th className="px-5 py-3 font-semibold">Status</th>
                                                <th className="px-5 py-3 font-semibold">Requests</th>
                                                <th className="px-5 py-3 font-semibold">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {donations.map(d => (
                                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5 font-semibold text-gray-900">{d.food_type}</td>
                                                    <td className="px-5 py-3.5 text-gray-500">{d.donor_name}</td>
                                                    <td className="px-5 py-3.5 text-gray-500">{d.quantity}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>
                                                            {d.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-500">{d.total_requests}</td>
                                                    <td className="px-5 py-3.5 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900">All Requests <span className="text-gray-400 font-normal">({requests.length})</span></h3>
                            </div>
                            {loading ? (
                                <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-400 uppercase tracking-wide">
                                                <th className="px-5 py-3 font-semibold">NGO</th>
                                                <th className="px-5 py-3 font-semibold">Food</th>
                                                <th className="px-5 py-3 font-semibold">Donor</th>
                                                <th className="px-5 py-3 font-semibold">Status</th>
                                                <th className="px-5 py-3 font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {requests.map(r => (
                                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5 font-semibold text-gray-900">{r.ngo_name}</td>
                                                    <td className="px-5 py-3.5 text-gray-500">{r.food_type}</td>
                                                    <td className="px-5 py-3.5 text-gray-500">{r.donor_name}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
