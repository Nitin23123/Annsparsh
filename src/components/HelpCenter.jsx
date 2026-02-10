import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HelpCenter() {
    const [activeTab, setActiveTab] = useState('faq');

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">home</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Help Center</h2>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-white/5 p-1 rounded-xl flex shadow-sm">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'faq' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-brand-green'}`}
                        >
                            FAQs
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-brand-green'}`}
                        >
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'contact' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-brand-green'}`}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/5 p-8 min-h-[400px]">
                    {activeTab === 'faq' && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold text-brand-green dark:text-white mb-6">Frequently Asked Questions</h1>
                            {[
                                { q: "How do I list a food donation?", a: "Go to your dashboard and click 'Add Food Donation'. Fill in the details about the food type, quantity, and pickup time." },
                                { q: "Is the detailed pickup address shared publicly?", a: "No, your exact address is only shared with the verified NGO once they accept your donation request." },
                                { q: "Can I donate cooked food?", a: "Yes! We accept cooked food, raw ingredients, and packaged items. Please ensure cooked food is fresh and hygienic." }
                            ].map((item, i) => (
                                <div key={i} className="border-b border-gray-100 dark:border-white/5 pb-4 last:border-0">
                                    <h3 className="font-bold text-lg text-brand-green dark:text-white mb-2">{item.q}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="prose dark:prose-invert">
                            <h1 className="text-2xl font-bold text-brand-green dark:text-white mb-6">Privacy Policy</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                At AnnSparsh, we take your privacy seriously. This policy describes how we collect and use your data.
                            </p>
                            <h3 className="font-bold text-brand-green dark:text-white mt-4 mb-2">Data Collection</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                We collect information necessary to facilitate food donations, including your name, contact details, and location.
                            </p>
                            <h3 className="font-bold text-brand-green dark:text-white mt-4 mb-2">Data Usage</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Your data is used solely for the purpose of connecting donors with NGOs and ensuring safe food delivery. We do not sell your data to third parties.
                            </p>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div>
                            <h1 className="text-2xl font-bold text-brand-green dark:text-white mb-6">Contact Support</h1>
                            <form className="max-w-md space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-1">Subject</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-primary" placeholder="How can we help?" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-green dark:text-white mb-1">Message</label>
                                    <textarea rows="4" className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-primary" placeholder="Describe your issue..."></textarea>
                                </div>
                                <button className="bg-brand-green text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
