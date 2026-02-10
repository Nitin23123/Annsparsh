import React from 'react';
import { Link } from 'react-router-dom';

export default function NGODashboard() {
    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display">
            {/* Top Navigation Bar */}
            <header className="bg-brand-green text-white px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-white text-2xl">eco</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">AnnSparsh</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/ngo-dashboard" className="text-sm font-semibold border-b-2 border-primary pb-1">Dashboard</Link>
                        <Link to="/tracking" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Track Delivery</Link>
                        <Link to="/history" className="text-sm font-medium text-white/80 hover:text-white transition-colors">History</Link>
                        <Link to="/profile" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Profile</Link>
                        <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Back to Home</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-xl">search</span>
                        <input className="bg-white/10 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 placeholder:text-white/60 text-white outline-none" type="text" placeholder="Search food..." />
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-brand-green"></span>
                    </button>
                    <div className="size-10 rounded-full border-2 border-primary/50 overflow-hidden bg-white/20">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6S4tZprmr1blsZAM1wbhLuesyVqas5gcfv5KzKLhomeKzBAm0-GxW9R22wPAEf2oeXccOHugdpxb_B0GYFDdhf3bfDHA03YvGRNkc5cNmJ35RiXfC31e1ttR2sRpRU0Fudr5e6JU1ew_gSLDZHpBp_TEGsyMxQPNDRABwSlI5JcP-tWCdhrpOcveen0KhNDIyAXmZYxEnTNAVxVcMSmTs-3ZEKACAaio-CgoCbE22vdM0HoUTAHfX7fNgGdSj-628egpVRZlnAIE" alt="Profile" />
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Lives Impacted</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-1">1,240</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                            <span className="material-symbols-outlined text-3xl">restaurant</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Meals Saved Today</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-1">45</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <span className="material-symbols-outlined text-3xl">schedule</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Requests</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-1">3</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content: Available Food */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-brand-green dark:text-white">Available Food</h2>
                            <div className="flex gap-2">
                                <button className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">filter_list</span> Filters
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                            {/* Food Card 1 */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow group">
                                <div className="h-48 relative overflow-hidden">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACzYhe7g2QKCxafiwUiOIdnUaJZoSVfO0JjyE1L3sNoxq-0eyRvL5_2yZqrV9dKbm_n7KWH3XZPG3chWozE1kmy3_0T1Knezu96nu2TZeh86Ozea3Ea8ZfUOmMU7iTJuXKKHF2kC60-ioB7HB1x2K6BLOj3b6kPLRt--S4QQDqD2_-Rnc8Yp7g2YgotUeIcEpEujv1NrQJ0CymLZ7Bjl8Y_ugKqYCqMDb7N2hCNZjR1ZILpBLAnUoIjZIRcPj73iQiRG4-Cm6NmrE" alt="Vegetable Biryani" />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-brand-green">COOKED MEAL</div>
                                    <div className="absolute bottom-3 right-3 bg-brand-green text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span> 2.4 km away
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Vegetable Biryani</h3>
                                        <div className="text-right">
                                            <span className="block text-primary text-sm font-bold">Expires in:</span>
                                            <span className="text-primary font-mono font-bold text-lg">00:45:00</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-lg">inventory_2</span> 15kg - Feeds 20 people
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-lg">business</span> Downtown Shelter Kitchen
                                        </div>
                                    </div>
                                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined">add_shopping_cart</span> Request Food
                                    </button>
                                </div>
                            </div>
                            {/* Food Card 2 */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow group">
                                <div className="h-48 relative overflow-hidden">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDOEBdUhm5R5lI1vh-BB9NY_mKAtWLW7CUyt62eNHlKKS2RNvBnpEkSiwQbaD6IHECgmgSe6668RelqJY_koaFZbi414Hq5DbYMuVE1XkqEwEQNW7bSHiDqgKOkEuzRnm2hnUnwlZIkWVwZ3BfwafABXwEziyFa_1oANJNIXohdN89Y6UCVvo-dVQEojwOvCl1q939LoILfAnYCM1yUiNwVkAh-5oTKHtdCa5nruCtW4w7GkhTtdtfxu1NmstDg3QVXUFvjG7ZlwA" alt="Bread and Pastries" />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-brand-green">BAKERY</div>
                                    <div className="absolute bottom-3 right-3 bg-brand-green text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span> 0.8 km away
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Bread & Pastries</h3>
                                        <div className="text-right">
                                            <span className="block text-primary text-sm font-bold">Expires in:</span>
                                            <span className="text-primary font-mono font-bold text-lg">02:15:00</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-lg">inventory_2</span> 5kg - Mixed Bag
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-lg">business</span> Sunrise Bakery
                                        </div>
                                    </div>
                                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined">add_shopping_cart</span> Request Food
                                    </button>
                                </div>
                            </div>
                            {/* Food Card 3 */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow group">
                                <div className="h-48 relative overflow-hidden">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIyx_YNdNQsNqnPcGqVpmgktVux7Z4s2RDh7KeexlApg8m95oXacW1MSrRXYhrx0CNSb12iQEu7lCH22zSyFsruBZngrCl-t1hPhPyN1tNEcCLekMKHPhoevG71RRC_af5FHkrmTL9Th54dNsNrKrKQxIAaUb4X83OMdOC4pIiYsIUtMeN30rsezVsPhKzSceGQLPJzm8ndktmrODhxQnZZncFwKcbnnrhBT6PnQl1Y_ygqUzRxg1-yzgEe-DPObVfB7QrTCLXw1w" alt="Fruits" />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-brand-green">PRODUCE</div>
                                    <div className="absolute bottom-3 right-3 bg-brand-green text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span> 4.1 km away
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Assorted Fruits</h3>
                                        <div className="text-right">
                                            <span className="block text-primary text-sm font-bold">Expires in:</span>
                                            <span className="text-primary font-mono font-bold text-lg">05:00:00</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-lg">inventory_2</span> 8kg - Seasonal Mix
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-lg">business</span> Green Grocers Hub
                                        </div>
                                    </div>
                                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined">add_shopping_cart</span> Request Food
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Sidebar: My Requests */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-brand-green/5">
                                <h3 className="font-bold text-brand-green dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined">list_alt</span> My Requests
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {/* Request Item 1 */}
                                <div className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#REQ-402</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white uppercase tracking-tighter">Ready for Pickup</span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">Paneer Tikka Masala</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                            <span className="material-symbols-outlined text-xs">schedule</span> Pickup in 20 mins
                                        </div>
                                        <button className="text-primary text-xs font-bold flex items-center gap-0.5">
                                            Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Request Item 2 */}
                                <div className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#REQ-398</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600 uppercase tracking-tighter border border-blue-200">Confirmed</span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">Sandwiches & Salads</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                            <span className="material-symbols-outlined text-xs">restaurant</span> Prep in progress
                                        </div>
                                        <button className="text-primary text-xs font-bold flex items-center gap-0.5">
                                            Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Request Item 3 */}
                                <div className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#REQ-395</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-tighter border border-amber-200">Pending</span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">Dairy Surplus Bag</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                            <span className="material-symbols-outlined text-xs">hourglass_empty</span> Awaiting Donor
                                        </div>
                                        <button className="text-primary text-xs font-bold flex items-center gap-0.5">
                                            Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50">
                                <button className="w-full text-center text-sm font-bold text-brand-green dark:text-white hover:underline">View All History</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="mt-12 py-8 px-6 border-t border-gray-200 dark:border-zinc-800 text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <div className="bg-brand-green p-1.5 rounded-lg size-8 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-lg">eco</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-green">AnnSparsh</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Together, making sure no meal goes to waste.</p>
                <div className="mt-6 flex justify-center gap-8 text-sm text-gray-400 font-medium">
                    <a className="hover:text-primary" href="#">Help Center</a>
                    <a className="hover:text-primary" href="#">Privacy Policy</a>
                    <a className="hover:text-primary" href="#">Contact Donor Support</a>
                </div>
            </footer>
        </div>
    );
}
