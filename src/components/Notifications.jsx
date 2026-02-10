import React from 'react';
import { Link } from 'react-router-dom';

export default function Notifications() {
    const notifications = [
        { id: 1, title: 'Donation Request Approved', message: 'Your donation of 50 Trays of Biryani has been accepted by City Shelter.', time: '2 mins ago', read: false, icon: 'check_circle', color: 'text-green-500', bg: 'bg-green-100' },
        { id: 2, title: 'Driver Arriving', message: 'Rajesh Kumar is 5 mins away from pickup location.', time: '1 hour ago', read: true, icon: 'local_shipping', color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 3, title: 'New Feature Alert', message: 'You can now track your impact in real-time!', time: '1 day ago', read: true, icon: 'campaign', color: 'text-purple-500', bg: 'bg-purple-100' },
    ];

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
                </div>
                <button className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider">Mark all as read</button>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6">
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 rounded-xl border transition-all hover:shadow-md flex gap-4 ${notif.read ? 'bg-white dark:bg-white/5 border-transparent' : 'bg-white dark:bg-white/5 border-primary/50 shadow-sm'}`}>
                            <div className={`size-12 rounded-full flex-shrink-0 flex items-center justify-center ${notif.bg} ${notif.color}`}>
                                <span className="material-symbols-outlined">{notif.icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-base font-bold ${notif.read ? 'text-gray-700 dark:text-gray-200' : 'text-brand-green dark:text-white'}`}>{notif.title}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{notif.message}</p>
                            </div>
                            {!notif.read && (
                                <div className="self-center">
                                    <div className="size-2 rounded-full bg-primary"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
