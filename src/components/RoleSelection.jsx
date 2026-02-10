import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedRole === 'donor') {
            navigate('/donor-dashboard');
        } else if (selectedRole === 'ngo') {
            navigate('/ngo-dashboard');
        }
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen transition-colors duration-300 font-display">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* Navigation */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#115741]/10 px-6 md:px-20 py-4 bg-warm-cream dark:bg-background-dark">
                        <div className="flex items-center gap-3 text-brand-green dark:text-primary">
                            <div className="size-8 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl font-bold">eco</span>
                            </div>
                            <Link to="/" className="text-xl font-extrabold leading-tight tracking-tight">AnnSparsh</Link>
                        </div>
                        <div className="flex flex-1 justify-end gap-6 items-center">
                            <nav className="hidden md:flex items-center gap-8">
                                <Link to="/" className="text-brand-green dark:text-gray-200 text-sm font-semibold hover:text-primary transition-colors">Home</Link>
                                <a className="text-brand-green dark:text-gray-200 text-sm font-semibold hover:text-primary transition-colors" href="#">About</a>
                                <a className="text-brand-green dark:text-gray-200 text-sm font-semibold hover:text-primary transition-colors" href="#">Contact</a>
                            </nav>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwYW7qQymo7u9IoMhEOB7qzkIgMLDkBAosZLsRlEy4XrBCunljJcoROphNau7OCtKr2eQmQPOrpEsFedqG13CpkDTYUV0mGtfLdVJ8d0UkCO0mnf3nPzR1eaKtZI5r3BcWslJA131DjPVEI23MJvg1S61gU0jlQUbWbWQXPGWiM6wpaAC-bGbE6FbbUwUkmeDY-nbxn1WkWVOzwS7Ji37-6PBsv7iohPztIsG6XSGAc9bhSDb9cxQtqb3EM_WbPQZkdoMjgHLAYmk")' }}></div>
                        </div>
                    </header>
                    {/* Main Content */}
                    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                        <div className="max-w-[1000px] w-full flex flex-col items-center">
                            <div className="text-center mb-12">
                                <h1 className="text-brand-green dark:text-white tracking-tight text-4xl md:text-5xl font-extrabold leading-tight mb-4">Welcome to AnnSparsh</h1>
                                <p className="text-brand-green/70 dark:text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                                    Join our community to bridge the gap between food waste and hunger.
                                    How would you like to contribute today?
                                </p>
                            </div>
                            {/* Role Selection Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                                {/* Donor Card */}
                                <div
                                    onClick={() => setSelectedRole('donor')}
                                    className={`group relative flex flex-col items-center bg-white dark:bg-zinc-900/50 p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer shadow-sm ${selectedRole === 'donor'
                                        ? 'border-primary shadow-[0_10px_25px_-5px_rgba(242,142,2,0.2)]'
                                        : 'border-transparent hover:border-primary/50'
                                        }`}
                                >
                                    {selectedRole === 'donor' && (
                                        <div className="absolute top-4 right-4">
                                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                    )}
                                    <div className="mb-6 size-24 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-5xl text-primary font-light" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-green dark:text-white mb-3 text-center">Donate Food</h3>
                                    <p className="text-brand-green/60 dark:text-gray-400 text-center leading-relaxed mb-4">
                                        Share surplus food with those in need and reduce waste. Ideal for restaurants, households, and events.
                                    </p>
                                    <div className={`mt-auto pt-4 flex items-center text-primary font-bold text-sm uppercase tracking-wider transition-opacity ${selectedRole === 'donor' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {selectedRole === 'donor' ? 'Selected' : 'Select Role'} <span className={`material-symbols-outlined ml-2 text-base`}>{selectedRole === 'donor' ? 'task_alt' : 'arrow_forward'}</span>
                                    </div>
                                </div>
                                {/* NGO Card */}
                                <div
                                    onClick={() => setSelectedRole('ngo')}
                                    className={`group relative flex flex-col items-center bg-white dark:bg-zinc-900/50 p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer shadow-sm ${selectedRole === 'ngo'
                                        ? 'border-primary shadow-[0_10px_25px_-5px_rgba(242,142,2,0.2)]'
                                        : 'border-transparent hover:border-primary/50'
                                        }`}
                                >
                                    {selectedRole === 'ngo' && (
                                        <div className="absolute top-4 right-4">
                                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                    )}
                                    <div className="mb-6 size-24 bg-brand-green/10 rounded-full flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
                                        <span className="material-symbols-outlined text-5xl text-brand-green dark:text-primary font-light" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-green dark:text-white mb-3 text-center">Request Food (NGO)</h3>
                                    <p className="text-brand-green/60 dark:text-gray-400 text-center leading-relaxed mb-4">
                                        Connect with donors to collect food for your community. For registered non-profits and shelters.
                                    </p>
                                    <div className={`mt-auto pt-4 flex items-center text-primary font-bold text-sm uppercase tracking-wider transition-opacity ${selectedRole === 'ngo' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {selectedRole === 'ngo' ? 'Selected' : 'Select Role'} <span className={`material-symbols-outlined ml-2 text-base`}>{selectedRole === 'ngo' ? 'task_alt' : 'arrow_forward'}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Footer Action */}
                            <div className="mt-16 w-full max-w-sm px-4">
                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedRole}
                                    className="w-full flex items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-8 bg-primary text-white text-lg font-bold leading-normal tracking-wide shadow-lg hover:bg-primary/90 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <span>Continue</span>
                                    <span className="material-symbols-outlined">trending_flat</span>
                                </button>
                                <p className="text-center text-brand-green/40 dark:text-gray-500 text-xs mt-6">
                                    By continuing, you agree to our Terms of Service and Privacy Policy.
                                </p>

                                <div className="mt-8 text-center border-t border-brand-green/10 pt-6">
                                    <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green/50 hover:text-brand-green transition-colors px-4 py-2 rounded-lg hover:bg-brand-green/5">
                                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                        Login as Administrator
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </main>
                    {/* Bottom Illustration/Background Element */}
                    <div className="w-full h-32 opacity-10 pointer-events-none overflow-hidden relative">
                        <div className="absolute inset-0 flex items-end justify-center gap-12 text-brand-green">
                            <span className="material-symbols-outlined text-9xl">bakery_dining</span>
                            <span className="material-symbols-outlined text-9xl">restaurant</span>
                            <span className="material-symbols-outlined text-9xl">lunch_dining</span>
                            <span className="material-symbols-outlined text-9xl">local_pizza</span>
                            <span className="material-symbols-outlined text-9xl">shopping_cart_checkout</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
