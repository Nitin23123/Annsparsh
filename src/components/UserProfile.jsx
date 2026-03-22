import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function UserProfile() {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const dashboardLink = storedUser.role === 'NGO' ? '/ngo-dashboard' : '/donor-dashboard';

    const [user, setUser] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                toast.error('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', {
                name: user.name,
                address: user.address,
                phone: user.phone,
            });
            // Update localStorage with new name
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.user.name }));
            toast.success('Profile updated successfully!');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update profile.';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex items-center justify-center">
                <p className="text-brand-green animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to={dashboardLink} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Profile & Settings</h2>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/10 p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                            <div className="size-32 rounded-full border-4 border-brand-green/10 overflow-hidden bg-brand-green/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-5xl text-brand-green/40">person</span>
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
                                        <input
                                            type="text"
                                            name="name"
                                            value={user.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Email Address</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">mail</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={user.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-brand-green/10 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Phone Number</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">call</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={user.phone || ''}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Location</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">location_on</span>
                                        <input
                                            type="text"
                                            name="address"
                                            value={user.address || ''}
                                            onChange={handleChange}
                                            placeholder="Your address"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Link
                                    to={dashboardLink}
                                    className="px-6 py-2.5 rounded-xl border border-brand-green/20 text-brand-green font-bold hover:bg-brand-green/5 transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
