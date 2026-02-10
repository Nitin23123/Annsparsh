import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Tracking() {
    const [currentStep, setCurrentStep] = useState(2); // Mocking step 2 (In Transit)

    const steps = [
        { id: 1, title: 'Request Approved', time: '10:30 AM', icon: 'check_circle' },
        { id: 2, title: 'Driver Assigned', time: '10:45 AM', icon: 'local_shipping' },
        { id: 3, title: 'Picked Up', time: '11:15 AM', icon: 'package_2' },
        { id: 4, title: 'Delivered', time: 'Estimated 11:45 AM', icon: 'location_on' },
    ];

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            {/* Simple Header */}
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Track Donation #REQ-402</h2>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6">
                {/* Map Placeholder */}
                <div className="bg-gray-200 dark:bg-white/5 rounded-2xl h-64 w-full mb-8 relative overflow-hidden border border-brand-green/10">
                    <img src="https://static.googleusercontent.com/media/www.google.com/en//maps/about/images/mymaps/mymaps-desktop-1x.png" className="w-full h-full object-cover opacity-60" alt="Map Placeholder" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg border border-brand-green/10 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl animate-bounce">local_shipping</span>
                            <div>
                                <p className="font-bold text-brand-green dark:text-white">Driver is on the way</p>
                                <p className="text-xs text-brand-green/60 dark:text-white/60">Arriving in 15 mins</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/10 p-8">
                    <h2 className="text-xl font-bold text-brand-green dark:text-white mb-6">Delivery Status</h2>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-4 bottom-4 w-1 bg-brand-green/10 rounded-full"></div>
                        <div className="absolute left-6 top-4 w-1 bg-primary rounded-full transition-all duration-1000" style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>

                        <div className="space-y-8 relative z-10">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-6">
                                    <div
                                        className={`size-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 flex-shrink-0 ${index <= currentStep
                                                ? 'bg-primary border-white dark:border-zinc-800 text-white shadow-lg shadow-primary/30'
                                                : 'bg-white dark:bg-zinc-800 border-brand-green/10 text-brand-green/30'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">{step.icon}</span>
                                    </div>
                                    <div className={`transition-all duration-500 ${index <= currentStep ? 'opacity-100' : 'opacity-50'}`}>
                                        <h3 className="font-bold text-lg text-brand-green dark:text-white">{step.title}</h3>
                                        <p className="text-sm text-brand-green/60 dark:text-white/60">{step.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Driver Info */}
                    <div className="mt-10 pt-8 border-t border-brand-green/10 flex items-center gap-4">
                        <div className="size-14 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green overflow-hidden">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDOEBdUhm5R5lI1vh-BB9NY_mKAtWLW7CUyt62eNHlKKS2RNvBnpEkSiwQbaD6IHECgmgSe6668RelqJY_koaFZbi414Hq5DbYMuVE1XkqEwEQNW7bSHiDqgKOkEuzRnm2hnUnwlZIkWVwZ3BfwafABXwEziyFa_1oANJNIXohdN89Y6UCVvo-dVQEojwOvCl1q939LoILfAnYCM1yUiNwVkAh-5oTKHtdCa5nruCtW4w7GkhTtdtfxu1NmstDg3QVXUFvjG7ZlwA" className="w-full h-full object-cover" alt="Driver" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-brand-green dark:text-white">Rajesh Kumar</p>
                            <p className="text-xs text-brand-green/60 dark:text-white/60">Delivery Partner (+91 98765 43210)</p>
                        </div>
                        <button className="p-3 bg-brand-green/5 hover:bg-brand-green/10 rounded-full text-brand-green transition-colors">
                            <span className="material-symbols-outlined">call</span>
                        </button>
                        <button className="p-3 bg-brand-green/5 hover:bg-brand-green/10 rounded-full text-brand-green transition-colors">
                            <span className="material-symbols-outlined">message</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
