import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-white/5 border-r border-gray-200 dark:border-white/10 shrink-0 h-screen sticky top-0">
                <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-white/5">
                    <div className="size-8 bg-brand-green rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Admin</h1>
                </div>

                <nav className="p-4 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-green/10 text-brand-green font-medium">
                        <span className="material-symbols-outlined">dashboard</span>
                        Overview
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined">group</span>
                        Users & Verification
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined">inventory_2</span>
                        Donations
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined">local_shipping</span>
                        Deliveries
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined">gavel</span>
                        Disputes
                    </a>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-white/5">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Overview</h2>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium">
                            Today, Oct 24
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Users</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">2,543</h3>
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-2"><span className="material-symbols-outlined text-sm">trending_up</span> +12 this week</span>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium mb-1">Active Donations</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">142</h3>
                        <span className="text-xs text-primary font-bold flex items-center gap-1 mt-2">Live Now</span>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium mb-1">Meals Saved</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">15.2k</h3>
                        <span className="text-xs text-gray-400 mt-2">Total Impact</span>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium mb-1">Pending Verification</p>
                        <h3 className="text-3xl font-bold text-orange-600">8</h3>
                        <span className="text-xs text-orange-600/60 mt-2">Action Required</span>
                    </div>
                </div>

                {/* Pending Verifications Table */}
                <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Pending Verifications</h3>
                        <button className="text-brand-green text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Organization</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Reg. Document</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Helping Hands NGO</td>
                                    <td className="px-6 py-4">Non-Profit</td>
                                    <td className="px-6 py-4"><span className="text-primary underline cursor-pointer">View PDF</span></td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-bold text-xs">Pending</span></td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><span className="material-symbols-outlined text-lg">check</span></button>
                                        <button className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><span className="material-symbols-outlined text-lg">close</span></button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">City Grand Hotel</td>
                                    <td className="px-6 py-4">Donor (Business)</td>
                                    <td className="px-6 py-4"><span className="text-primary underline cursor-pointer">View License</span></td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-bold text-xs">Pending</span></td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><span className="material-symbols-outlined text-lg">check</span></button>
                                        <button className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><span className="material-symbols-outlined text-lg">close</span></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
