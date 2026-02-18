import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
            alert('Failed to update request.');
        }
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark text-deep-green font-display min-h-screen">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-brand-green text-white flex flex-col shrink-0">
                    <div className="p-6 flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl">eco</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">AnnSparsh</h1>
                    </div>
                    <nav className="mt-6 flex-1 px-3 space-y-1">
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
                <main className="flex-1 overflow-y-auto bg-brand-cream dark:bg-background-dark">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-brand-cream/80 backdrop-blur-md dark:bg-background-dark/80">
                        <div>
                            <h2 className="text-2xl font-bold text-brand-green dark:text-warm-cream">Donor Dashboard</h2>
                            <p className="text-brand-green/70 dark:text-white/60 text-sm">Manage your donations and approve requests.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/create-donation" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined">add_circle</span>
                                <span>Add Food Donation</span>
                            </Link>
                        </div>
                    </header>

                    <div className="px-8 pb-10 space-y-8">

                        {/* Pending Requests Section */}
                        <div>
                            <h3 className="text-xl font-bold text-brand-green dark:text-white mb-4">Pending Requests</h3>
                            {loading ? (
                                <p>Loading requests...</p>
                            ) : requests.length === 0 ? (
                                <div className="bg-white dark:bg-white/5 p-8 rounded-xl border border-brand-green/5 text-center shadow-sm">
                                    <p className="text-brand-green/60">No pending requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-white/5 p-6 rounded-xl border border-brand-green/5 shadow-sm hover:border-primary/30 transition-all">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded uppercase">Request #{req.id}</span>
                                                        <span className="text-sm text-gray-400">• {new Date(req.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-brand-green dark:text-white">
                                                        Request for: <span className="text-primary">{req.donation.foodItem}</span>
                                                    </h4>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            <span className="font-semibold">NGO:</span> {req.ngo.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            <span className="font-semibold">Message:</span> {req.message || "No message provided."}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            <span className="font-semibold">Status:</span> <span className={`font-bold ${req.status === 'PENDING' ? 'text-orange-500' : req.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`}>{req.status}</span>
                                                        </p>

                                                        {/* Contact & Volunteer Info for Approved Requests */}
                                                        {req.status === 'APPROVED' && (
                                                            <div className="mt-3 bg-gray-50 dark:bg-white/10 p-3 rounded-lg text-sm">
                                                                <p className="font-bold text-brand-green dark:text-warm-cream mb-1">Pickup Details:</p>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="material-symbols-outlined text-sm">call</span>
                                                                    <a href={`tel:${req.ngo.phone}`} className="hover:underline text-primary font-bold">Call NGO: {req.ngo.phone || 'N/A'}</a>
                                                                </div>

                                                                {req.volunteerName ? (
                                                                    <div className="text-gray-600 dark:text-gray-300 space-y-1 border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                                                        <p><span className="font-semibold">Volunteer:</span> {req.volunteerName}</p>
                                                                        <p><span className="font-semibold">Phone:</span> {req.volunteerPhone}</p>
                                                                        <p><span className="font-semibold">Vehicle:</span> {req.vehicleNumber}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-orange-600 italic">Waiting for NGO to assign volunteer...</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {req.status === 'PENDING' && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'APPROVED')}
                                                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-colors"
                                                        >
                                                            Approve Request
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

