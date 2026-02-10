import React from 'react';
import { Link } from 'react-router-dom';

export default function History() {
    const pastDonations = [
        { id: 'DON-101', date: 'Oct 20, 2024', item: 'Rice & Curry', quantity: '20 kg', status: 'Completed', ngo: 'City Shelter' },
        { id: 'DON-098', date: 'Oct 15, 2024', item: 'Fresh Fruits', quantity: '10 kg', status: 'Completed', ngo: 'Kids Home' },
        { id: 'DON-092', date: 'Oct 10, 2024', item: 'Bread Packets', quantity: '50 units', status: 'Expired', ngo: '-' },
    ];

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            {/* Simple Header */}
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">History & Impact</h2>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6">
                {/* Impact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">volunteer_activism</span>
                            </div>
                            <span className="font-bold text-primary">Meals Provided</span>
                        </div>
                        <p className="text-3xl font-extrabold text-brand-green dark:text-white">450+</p>
                    </div>
                    <div className="bg-brand-green/10 p-6 rounded-2xl border border-brand-green/20">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-full bg-brand-green flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">co2</span>
                            </div>
                            <span className="font-bold text-brand-green dark:text-white">CO2 Prevented</span>
                        </div>
                        <p className="text-3xl font-extrabold text-brand-green dark:text-white">120 kg</p>
                    </div>
                    <div className="bg-orange-100 p-6 rounded-2xl border border-orange-200">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <span className="font-bold text-orange-700">People Helped</span>
                        </div>
                        <p className="text-3xl font-extrabold text-brand-green dark:text-white">320</p>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-brand-green/5 bg-brand-green/5">
                        <h3 className="font-bold text-brand-green dark:text-white">Donation History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {pastDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-brand-green/70">{donation.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{donation.date}</td>
                                        <td className="px-6 py-4 font-bold text-brand-green dark:text-white">{donation.item}</td>
                                        <td className="px-6 py-4 text-gray-600">{donation.quantity}</td>
                                        <td className="px-6 py-4 text-gray-600">{donation.ngo}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${donation.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary font-bold hover:underline text-xs">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
