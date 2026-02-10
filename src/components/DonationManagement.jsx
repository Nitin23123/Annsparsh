import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DonationManagement() {
    const [requests, setRequests] = useState([
        {
            id: 1,
            ngoName: 'City Shelter Foundation',
            ngoType: 'Homeless Shelter',
            foodItem: '50 Trays of Biryani',
            quantity: '50 servings',
            requestedTime: '10 mins ago',
            status: 'Pending',
            distance: '2.5 km',
            logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIyx_YNdNQsNqnPcGqVpmgktVux7Z4s2RDh7KeexlApg8m95oXacW1MSrRXYhrx0CNSb12iQEu7lCH22zSyFsruBZngrCl-t1hPhPyN1tNEcCLekMKHPhoevG71RRC_af5FHkrmTL9Th54dNsNrKrKQxIAaUb4X83OMdOC4pIiYsIUtMeN30rsezVsPhKzSceGQLPJzm8ndktmrODhxQnZZncFwKcbnnrhBT6PnQl1Y_ygqUzRxg1-yzgEe-DPObVfB7QrTCLXw1w'
        },
        {
            id: 2,
            ngoName: 'Community Kitchens',
            ngoType: 'Community Center',
            foodItem: 'Mixed Organic Vegetables',
            quantity: '15 kg',
            requestedTime: '45 mins ago',
            status: 'Pending',
            distance: '5.1 km',
            logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDOEBdUhm5R5lI1vh-BB9NY_mKAtWLW7CUyt62eNHlKKS2RNvBnpEkSiwQbaD6IHECgmgSe6668RelqJY_koaFZbi414Hq5DbYMuVE1XkqEwEQNW7bSHiDqgKOkEuzRnm2hnUnwlZIkWVwZ3BfwafABXwEziyFa_1oANJNIXohdN89Y6UCVvo-dVQEojwOvCl1q939LoILfAnYCM1yUiNwVkAh-5oTKHtdCa5nruCtW4w7GkhTtdtfxu1NmstDg3QVXUFvjG7ZlwA'
        }
    ]);

    const handleAction = (id, action) => {
        // In a real app, this would make an API call
        console.log(`Request ${id} ${action}`);
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: action === 'approve' ? 'Approved' : 'Rejected' } : req
        ));
        alert(`Request ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            {/* Simple Header */}
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Donation Requests</h2>
                </div>
                <div className="size-8 rounded-full border-2 border-primary/50 overflow-hidden bg-white/20">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7oEluXgX42m4Hu3lU371ao0xoIqymz8mMhVB5KKgqfHCgUXHaRs4lmWUjJUBNxphnG1bNFdnvLtfBiPkm6LD-8w7AMEFrC1dlRhJ9xJp0Hpi87YP8b0KTKZE6eYjw5wTN5CnrdRAKjoX9OTPAjJeUNMScEYmHMWrvzTlof-wEZ9rG9Okt-w4L6x1Eum-kQhxzbXDYChme_mYKu-5Mu9NwE4BTFmPCLNTUA_D_D778OiGsblpKLk2GHxmNA275mtPP8isSG3XtQhE" alt="Profile" />
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-brand-green dark:text-white">Pending Requests</h1>
                    <div className="flex gap-2">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">{requests.filter(r => r.status === 'Pending').length} Pending</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white dark:bg-white/5 rounded-xl p-6 border border-brand-green/10 shadow-sm transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* NGO Info */}
                                <div className="flex items-start gap-4 md:w-1/3">
                                    <img src={request.logo} alt={request.ngoName} className="size-16 rounded-xl object-cover border border-brand-green/10" />
                                    <div>
                                        <h3 className="font-bold text-lg text-brand-green dark:text-white">{request.ngoName}</h3>
                                        <p className="text-sm text-brand-green/60 dark:text-white/60">{request.ngoType}</p>
                                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-brand-green/70 bg-brand-green/5 px-2 py-1 rounded w-fit">
                                            <span className="material-symbols-outlined text-xs">location_on</span>
                                            {request.distance} away
                                        </div>
                                    </div>
                                </div>

                                {/* Request Details */}
                                <div className="flex-1 border-t md:border-t-0 md:border-l border-brand-green/10 pt-4 md:pt-0 md:pl-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs text-brand-green/50 uppercase font-bold">Requesting</p>
                                            <p className="font-bold text-brand-green dark:text-white text-lg">{request.foodItem}</p>
                                        </div>
                                        <span className="text-xs text-brand-green/50">{request.requestedTime}</span>
                                    </div>
                                    <p className="text-sm text-brand-green/70 mb-4">Quantity: <span className="font-bold">{request.quantity}</span></p>

                                    {request.status === 'Pending' ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAction(request.id, 'approve')}
                                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined">check</span>
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(request.id, 'reject')}
                                                className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`w-full py-2.5 rounded-lg font-bold text-center ${request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            Request {request.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center size-16 rounded-full bg-brand-green/5 text-brand-green/40 mb-4">
                                <span className="material-symbols-outlined text-3xl">inbox</span>
                            </div>
                            <p className="text-brand-green/60">No pending requests at the moment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
