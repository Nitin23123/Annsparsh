import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CreateDonation() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        foodItem: '',
        foodType: 'cooked',
        quantity: '',
        expiryTime: '',
        description: '',
        pickupAddress: 'Royal Heritage Hotel, MG Road', // Default for demo
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to submit data would go here
        console.log('Donation Submitted:', formData);
        // Redirect back to dashboard with success (simulated)
        alert('Donation listed successfully!');
        navigate('/donor-dashboard');
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
            {/* Simple Header */}
            <header className="bg-brand-green text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link to="/donor-dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Create Donation</h2>
                </div>
                <div className="size-8 rounded-full border-2 border-primary/50 overflow-hidden bg-white/20">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7oEluXgX42m4Hu3lU371ao0xoIqymz8mMhVB5KKgqfHCgUXHaRs4lmWUjJUBNxphnG1bNFdnvLtfBiPkm6LD-8w7AMEFrC1dlRhJ9xJp0Hpi87YP8b0KTKZE6eYjw5wTN5CnrdRAKjoX9OTPAjJeUNMScEYmHMWrvzTlof-wEZ9rG9Okt-w4L6x1Eum-kQhxzbXDYChme_mYKu-5Mu9NwE4BTFmPCLNTUA_D_D778OiGsblpKLk2GHxmNA275mtPP8isSG3XtQhE" alt="Profile" />
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6">
                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-brand-green/10 p-8">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4">
                            <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                        </div>
                        <h1 className="text-2xl font-bold text-brand-green dark:text-white">List Food for Donation</h1>
                        <p className="text-brand-green/60 dark:text-white/60 mt-2">Share your surplus food with those in need. Details help NGOs respond faster.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="foodItem" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Food Title</label>
                            <input
                                type="text"
                                id="foodItem"
                                name="foodItem"
                                value={formData.foodItem}
                                onChange={handleChange}
                                placeholder="e.g. 50 Trays of Mixed Veg Curry"
                                className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="foodType" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Food Type</label>
                                <select
                                    id="foodType"
                                    name="foodType"
                                    value={formData.foodType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                >
                                    <option value="cooked">Cooked Meal</option>
                                    <option value="raw">Raw Ingredients</option>
                                    <option value="bakery">Bakery Items</option>
                                    <option value="packaged">Packaged Food</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Quantity (Approx)</label>
                                <input
                                    type="text"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="e.g. 15 kg or 50 servings"
                                    className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="expiryTime" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Must be picked up by</label>
                            <input
                                type="datetime-local"
                                id="expiryTime"
                                name="expiryTime"
                                value={formData.expiryTime}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                required
                            />
                            <p className="text-xs text-brand-green/50 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">info</span>
                                NGOs usually need at least 2 hours to arrange pickup.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Description / Instructions</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Any allergens? Special pickup instructions?"
                                className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-brand-green/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Upload Photo (Optional)</label>
                            <div className="border-2 border-dashed border-brand-green/20 rounded-xl p-8 text-center hover:bg-brand-green/5 transition-all cursor-pointer group">
                                <span className="material-symbols-outlined text-4xl text-brand-green/40 group-hover:text-primary transition-colors">add_a_photo</span>
                                <p className="text-sm text-brand-green/60 mt-2">Click to upload or drag and drop</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">publish</span>
                                List Donation
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
