import React from 'react';
import { Link } from 'react-router-dom';

export default function ShelterFinder() {
    const shelters = [
        { id: 1, name: 'Hope Foundation', type: 'Orphanage', distance: '1.2 km', address: '42, Civil Lines' },
        { id: 2, name: 'City Animal Shelter', type: 'Animal Shelter', distance: '3.5 km', address: 'Sector 15, Noida' },
        { id: 3, name: 'Grace Community Kitchen', type: 'Homeless Shelter', distance: '5.0 km', address: 'Old Delhi Road' },
    ];

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold tracking-tight">Find Shelters</h2>
                    </div>
                </div>
                <div className="bg-white/10 p-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/70">search</span>
                    <input type="text" placeholder="Search area..." className="bg-transparent border-none text-white placeholder:text-white/50 text-sm focus:ring-0 outline-none w-32 md:w-48" />
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)]">
                {/* List View */}
                <div className="w-full md:w-96 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-white/10 overflow-y-auto">
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-white/10">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{shelters.length} Results Nearby</p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {shelters.map((shelter) => (
                            <div key={shelter.id} className="p-4 hover:bg-brand-green/5 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-brand-green dark:text-white group-hover:text-primary transition-colors">{shelter.name}</h3>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{shelter.distance}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{shelter.type}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {shelter.address}
                                </p>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 rounded border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">Call</button>
                                    <button className="flex-1 py-1.5 rounded bg-brand-green text-white text-xs font-bold hover:bg-brand-green/90 transition-all">Directions</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map View Placeholder */}
                <div className="flex-1 bg-gray-200 relative">
                    <img src="https://static.googleusercontent.com/media/www.google.com/en//maps/about/images/mymaps/mymaps-desktop-1x.png" className="w-full h-full object-cover grayscale opacity-50" alt="Map" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span>
                            <span className="font-bold text-gray-700">Map Integration Coming Soon</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
