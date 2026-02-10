import React from 'react';
import { Link } from 'react-router-dom';

export default function DonorDashboard() {
    return (
        <div className="bg-brand-cream dark:bg-background-dark text-deep-green font-display min-h-screen">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-brand-green text-white flex flex-col shrink-0">
                    <div className="p-6 flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl">eco</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">AnnSparsh</h1>
                    </div>
                    <nav className="mt-6 flex-1 px-3 space-y-1">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/20 text-primary border-r-4 border-primary transition-all group">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </a>
                        <Link to="/donation-requests" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-white/70 group-hover:text-white">volunteer_activism</span>
                            <span className="font-medium">My Donations</span>
                        </Link>
                        <Link to="/history" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-white/70 group-hover:text-white">leaderboard</span>
                            <span className="font-medium">Impact Report</span>
                        </Link>
                        <Link to="/shelters" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-white/70 group-hover:text-white">location_on</span>
                            <span className="font-medium">Find Shelters</span>
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-white/70 group-hover:text-white">settings</span>
                            <span className="font-medium">Settings</span>
                        </Link>

                        <div className="pt-4 mt-4 border-t border-white/10">
                            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white">
                                <span className="material-symbols-outlined text-white/70 group-hover:text-white">home</span>
                                <span className="font-medium">Back to AnnSparsh</span>
                            </Link>
                            <Link to="/auth" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all text-red-200 hover:text-red-100">
                                <span className="material-symbols-outlined text-red-300 group-hover:text-red-100">logout</span>
                                <span className="font-medium">Log Out</span>
                            </Link>
                        </div>
                    </nav>
                    <div className="p-4 mt-auto border-t border-white/10">
                        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7oEluXgX42m4Hu3lU371ao0xoIqymz8mMhVB5KKgqfHCgUXHaRs4lmWUjJUBNxphnG1bNFdnvLtfBiPkm6LD-8w7AMEFrC1dlRhJ9xJp0Hpi87YP8b0KTKZE6eYjw5wTN5CnrdRAKjoX9OTPAjJeUNMScEYmHMWrvzTlof-wEZ9rG9Okt-w4L6x1Eum-kQhxzbXDYChme_mYKu-5Mu9NwE4BTFmPCLNTUA_D_D778OiGsblpKLk2GHxmNA275mtPP8isSG3XtQhE')" }}></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold truncate">Royal Heritage Hotel</p>
                                <p className="text-xs text-white/60 truncate">Premium Partner</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-brand-cream dark:bg-background-dark">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-brand-cream/80 backdrop-blur-md dark:bg-background-dark/80">
                        <div>
                            <h2 className="text-2xl font-bold text-brand-green dark:text-warm-cream">Welcome back, Royal Heritage!</h2>
                            <p className="text-brand-green/70 dark:text-white/60 text-sm">Your donations have supported 450 people this week.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden lg:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40">search</span>
                                <input className="pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-brand-green/10 rounded-xl focus:ring-primary focus:border-primary w-64 text-sm outline-none" type="text" placeholder="Search donations..." />
                            </div>
                            <Link to="/create-donation" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined">add_circle</span>
                                <span>Add Food Donation</span>
                            </Link>
                            <Link to="/notifications" className="p-2 bg-white dark:bg-white/5 border border-brand-green/10 rounded-full text-brand-green/60 dark:text-white/60 relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                            </Link>
                        </div>
                    </header>

                    <div className="px-8 pb-10 space-y-8">
                        {/* Impact Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-brand-green/5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">restaurant</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                                </div>
                                <p className="text-brand-green/60 dark:text-white/60 text-sm font-medium">Meals Provided</p>
                                <h3 className="text-3xl font-bold mt-1 text-brand-green dark:text-white">1,240</h3>
                            </div>
                            <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-brand-green/5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                                        <span className="material-symbols-outlined">weight</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+5%</span>
                                </div>
                                <p className="text-brand-green/60 dark:text-white/60 text-sm font-medium">Total Weight</p>
                                <h3 className="text-3xl font-bold mt-1 text-brand-green dark:text-white">450 kg</h3>
                            </div>
                            <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-brand-green/5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+8%</span>
                                </div>
                                <p className="text-brand-green/60 dark:text-white/60 text-sm font-medium">People Fed</p>
                                <h3 className="text-3xl font-bold mt-1 text-brand-green dark:text-white">890</h3>
                            </div>
                            <div className="bg-brand-green text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-white/80 text-sm font-medium mb-1">Impact Level</p>
                                    <h3 className="text-2xl font-bold">Platinum Donor</h3>
                                    <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[75%] rounded-full"></div>
                                    </div>
                                    <p className="text-xs mt-2 text-white/70">125kg more for Diamond badge</p>
                                </div>
                                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5">military_tech</span>
                            </div>
                        </div>

                        {/* Active Donations and Recent Activity */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Active Donations List */}
                            <div className="xl:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-brand-green dark:text-white">Active Donations</h3>
                                    <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {/* Active Item 1 */}
                                    <div className="bg-white dark:bg-white/5 p-5 rounded-xl border border-brand-green/5 shadow-sm flex items-center gap-5 hover:border-primary/30 transition-all group">
                                        <div className="size-20 bg-cover bg-center rounded-lg flex-shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDenyJE-c9znB7pB2ksC3Vnql3czezZrOZ2FkXbzYBFUhPvg4KBauG13rL_rylY5DzYiIBObU8eAKjaH6QtSLO64lffEch31uvCTpJD61cQLspO7qN-XASbo5RfzgZGS_XA5Y81pRa7_AIHTu0EpIquVBhJ0jZp0Akd1jZwBN5I9FUGPJiU6lDy7rtE4natXW0mKI76-1yZg-ppGey63BTzxSyXr_xficn6JnEtdh_JMrGz2WlLUuZiy1jjQjMj-U8TXd1qWqjyhd0')" }}></div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-brand-green dark:text-white group-hover:text-primary transition-colors">50 Trays of Biryani</h4>
                                                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase">Pending Pickup</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-brand-green/60 dark:text-white/50">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 4h remaining</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_shipping</span> Driver assigned (Rajesh K.)</span>
                                            </div>
                                        </div>
                                        <Link to="/tracking" className="p-2 bg-brand-green/5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </Link>
                                    </div>
                                    {/* Active Item 2 */}
                                    <div className="bg-white dark:bg-white/5 p-5 rounded-xl border border-brand-green/5 shadow-sm flex items-center gap-5 hover:border-primary/30 transition-all group">
                                        <div className="size-20 bg-cover bg-center rounded-lg flex-shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuw4i_lbYKvelnSUclLYzu9TW2whrrklBj12Lws3lJ1su0V_k6mvhyRPL0XZ6wYqAPGUaDEdPeapRzPwek4bQzqnG48zKyyQYQ-VqZ2hZN34JfdLfpw4Rho9fgWyaWAKxhp1wPaZ_JR2DvGHJlr8cXA8ojHcPBxICGBvGtHXcBoNmjwpJghGaan4L2D_MBtEyn7lTgZbh0HXsv6OBhUMy0haCWpKZhwyBy0d6MIEfu43uetwCKhgYwKbNW9HJHkqiKcI24IrJoskM')" }}></div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-brand-green dark:text-white group-hover:text-primary transition-colors">Mixed Organic Vegetables</h4>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full uppercase">In Transit</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-brand-green/60 dark:text-white/50">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">inventory_2</span> 15 kg</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">near_me</span> 2.5 km away from destination</span>
                                            </div>
                                        </div>
                                        <button className="p-2 bg-brand-green/5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Donation History Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-brand-green/5 shadow-sm h-full">
                                    <h3 className="text-lg font-bold text-brand-green dark:text-white mb-6">Donation History</h3>
                                    <div className="space-y-6">
                                        <div className="flex gap-4 relative">
                                            <div className="absolute left-4 top-10 bottom-0 w-px bg-brand-green/10"></div>
                                            <div className="size-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-green-600">
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-brand-green dark:text-white">Pasta & Salad Buffet</p>
                                                <p className="text-xs text-brand-green/50 dark:text-white/40">Oct 24, 2023 • 25kg • City Shelter</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 relative">
                                            <div className="absolute left-4 top-10 bottom-0 w-px bg-brand-green/10"></div>
                                            <div className="size-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-green-600">
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-brand-green dark:text-white">Catering Surplus (Bread)</p>
                                                <p className="text-xs text-brand-green/50 dark:text-white/40">Oct 22, 2023 • 10kg • Community Kitchen</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 relative">
                                            <div className="size-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-red-600">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-brand-green dark:text-white">Dairy Items</p>
                                                <p className="text-xs text-brand-green/50 dark:text-white/40">Oct 20, 2023 • Cancelled by Donor</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full mt-8 py-3 bg-brand-green/5 text-brand-green dark:text-white/80 rounded-xl font-bold hover:bg-brand-green/10 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">history</span>
                                        <span>Full History</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Summary */}
                        <footer className="bg-primary/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border border-primary/10">
                            <div className="flex items-center gap-6 mb-4 md:mb-0">
                                <div className="size-16 bg-white rounded-xl shadow-inner flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-brand-green">Join the Zero Waste Campaign</h4>
                                    <p className="text-brand-green/70">Participate in our weekend drive and earn a special badge.</p>
                                </div>
                            </div>
                            <button className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-deep-green transition-all shadow-md">Learn More</button>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
