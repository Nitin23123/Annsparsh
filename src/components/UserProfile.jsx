import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UserProfile() {
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        address: '123, Green Park, New Delhi',
        role: 'Donor (Individual)'
    });

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            {/* Simple Header */}
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Profile & Settings</h2>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/10 p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                            <div className="size-32 rounded-full border-4 border-brand-green/10 overflow-hidden relative group cursor-pointer">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7oEluXgX42m4Hu3lU371ao0xoIqymz8mMhVB5KKgqfHCgUXHaRs4lmWUjJUBNxphnG1bNFdnvLtfBiPkm6LD-8w7AMEFrC1dlRhJ9xJp0Hpi87YP8b0KTKZE6eYjw5wTN5CnrdRAKjoX9OTPAjJeUNMScEYmHMWrvzTlof-wEZ9rG9Okt-w4L6x1Eum-kQhxzbXDYChme_mYKu-5Mu9NwE4BTFmPCLNTUA_D_D778OiGsblpKLk2GHxmNA275mtPP8isSG3XtQhE" alt="Profile" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-3xl">edit</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">{user.role}</span>
                        </div>

                        {/* Form */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Full Name</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">person</span>
                                        <input type="text" name="name" value={user.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Email Address</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">mail</span>
                                        <input type="email" name="email" value={user.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Phone Number</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">call</span>
                                        <input type="tel" name="phone" value={user.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Location</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">location_on</span>
                                        <input type="text" name="address" value={user.address} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-brand-green/10">
                                <h3 className="text-lg font-bold text-brand-green dark:text-white mb-4">Notification Preferences</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="size-5 rounded text-primary focus:ring-primary border-gray-300" />
                                        <span className="text-brand-green dark:text-white">Email notifications for new requests</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="size-5 rounded text-primary focus:ring-primary border-gray-300" />
                                        <span className="text-brand-green dark:text-white">SMS alerts for delivery updates</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button className="px-6 py-2.5 rounded-xl border border-brand-green/20 text-brand-green font-bold hover:bg-brand-green/5 transition-all">Cancel</button>
                                <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
