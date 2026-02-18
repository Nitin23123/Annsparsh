import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            {/* Header */}
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to={userRole === 'NGO' ? "/ngo-dashboard" : "/donor-dashboard"} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Back to Dashboard">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight text-white">History & Impact</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-white/80 hover:text-white font-medium flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-lg">home</span>
                    </Link>
                    <Link
                        to="/auth"
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium text-xs transition-colors"
                    >
                        Logout
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6">
                {/* Impact Cards (Static for now, can make dynamic later) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">volunteer_activism</span>
                            </div>
                            <span className="font-bold text-primary">All Time</span>
                        </div>
                        <p className="text-3xl font-extrabold text-brand-green dark:text-white">{historyData.length} Items</p>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-brand-green/5 bg-brand-green/5">
                        <h3 className="font-bold text-brand-green dark:text-white">
                            {userRole === 'DONOR' ? 'My Donations' : 'My Requests'}
                        </h3>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center">Loading history...</div>
                    ) : historyData.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No history found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Status</th>
                                        {userRole === 'DONOR' && <th className="px-6 py-4">Claimed By (NGO)</th>}
                                        {userRole === 'NGO' && <th className="px-6 py-4">Donor Contact</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {historyData.map((item) => {
                                        // Normalize data based on role
                                        const date = new Date(item.createdAt).toLocaleDateString();
                                        const id = item.id;

                                        // For Donor: item is Donation
                                        // For NGO: item is Request (which has donation relation)
                                        const foodItem = userRole === 'DONOR' ? item.foodItem : item.donation.foodItem;
                                        const status = item.status;

                                        // Extra logic for Donor
                                        let ngoName = '-';
                                        if (userRole === 'DONOR' && item.requests) {
                                            const approvedReq = item.requests.find(r => r.status === 'APPROVED');
                                            if (approvedReq && approvedReq.ngo) {
                                                ngoName = approvedReq.ngo.name;
                                            }
                                        }

                                        // Extra logic for NGO
                                        let donorContact = '-';
                                        if (userRole === 'NGO' && item.donation.donor) {
                                            donorContact = `${item.donation.donor.name} (${item.donation.donor.phone || 'N/A'})`;
                                        }

                                        return (
                                            <tr key={id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-brand-green/70">#{id}</td>
                                                <td className="px-6 py-4 text-gray-600">{date}</td>
                                                <td className="px-6 py-4 font-bold text-brand-green dark:text-white">{foodItem}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${status === 'AVAILABLE' || status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                        status === 'CLAIMED' || status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                {userRole === 'DONOR' && (
                                                    <td className="px-6 py-4 text-gray-600">{ngoName}</td>
                                                )}
                                                {userRole === 'NGO' && (
                                                    <td className="px-6 py-4 text-gray-600">{donorContact}</td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
