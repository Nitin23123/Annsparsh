import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
            alert('Failed to send request.');
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
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display relative">
            {/* ... Existing Header ... */}
            <header className="bg-brand-green text-white px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-8">
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
                        <Link to="/history" className="text-white/80 hover:text-white font-medium flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-lg">history</span> History
                        </Link>
                        <Link
                            to="/auth"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span> Logout
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* My Requests Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-brand-green dark:text-white mb-6">My Requests</h2>
                    {myRequests.length === 0 ? (
                        <p>No active requests.</p>
                    ) : (
                        <div className="grid gap-4">
                            {myRequests.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center border border-gray-100">
                                    <div className="w-full">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-brand-green">{req.donation.foodItem}</h3>
                                                <p className="text-sm text-gray-500 mb-2">Status: <span className={`font-bold ${req.status === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>{req.status}</span></p>

                                                {/* Donor Contact for Approved Requests */}
                                                {req.status === 'APPROVED' && (
                                                    <div className="flex items-center gap-4 text-sm mt-1 mb-2">
                                                        <div className="flex items-center gap-1 text-gray-700">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                            <span className="font-semibold">{req.donation.donor.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm text-primary">call</span>
                                                            <a href={`tel:${req.donation.donor.phone}`} className="text-primary font-bold hover:underline">{req.donation.donor.phone || 'N/A'}</a>
                                                        </div>
                                                    </div>
                                                )}

                                                {req.volunteerName && (
                                                    <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded border border-blue-100 inline-block">
                                                        <span className="font-bold">Volunteer Assigned:</span> {req.volunteerName} ({req.vehicleNumber})
                                                    </div>
                                                )}
                                            </div>

                                            {req.status === 'APPROVED' && !req.volunteerName && (
                                                <button onClick={() => openVolunteerModal(req)} className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-green/90 shadow-sm transition-all flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                                                    Assign Volunteer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Available Donations Section - Keep existing logic */}
                <h2 className="text-2xl font-bold text-brand-green dark:text-white mb-6">Available Food</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donations.map((donation) => (
                        <div key={donation.id} className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                            {/* ... Existing Card Content ... */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold">{donation.foodItem}</h3>
                                <p className="text-sm text-gray-500 mb-4">{donation.quantity} • Expires: {new Date(donation.expiryTime).toLocaleTimeString()}</p>
                                <button onClick={() => handleRequest(donation.id)} className="w-full bg-primary text-white font-bold py-2 rounded-lg">Request Food</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Volunteer Modal */}
            {showVolunteerModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-brand-green">Assign Volunteer</h3>
                        <form onSubmit={submitVolunteerInfo} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Volunteer Name"
                                className="w-full border p-2 rounded"
                                value={volunteerData.name}
                                onChange={(e) => setVolunteerData({ ...volunteerData, name: e.target.value })}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Volunteer Phone"
                                className="w-full border p-2 rounded"
                                value={volunteerData.phone}
                                onChange={(e) => setVolunteerData({ ...volunteerData, phone: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Vehicle Number"
                                className="w-full border p-2 rounded"
                                value={volunteerData.vehicle}
                                onChange={(e) => setVolunteerData({ ...volunteerData, vehicle: e.target.value })}
                                required
                            />
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowVolunteerModal(false)} className="flex-1 py-2 border rounded hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded font-bold hover:bg-primary/90">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
