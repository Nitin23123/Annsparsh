import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const FOOD_TITLE_RE = /[a-zA-Z]/g;
const QUANTITY_NUM_RE = /\d+(\.\d+)?/;
const QUANTITY_VALID_CHARS_RE = /^[a-zA-Z0-9 .,/+\-()]+$/;

const MIN_PICKUP_MINUTES = 30;
const MAX_PICKUP_DAYS = 7;
const MS_PER_MIN = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const validators = {
    foodItem: (v) => {
        const s = v.trim();
        if (s.length < 3) return 'Title must be at least 3 characters';
        if (s.length > 80) return 'Title must be under 80 characters';
        if ((s.match(FOOD_TITLE_RE) || []).length < 2) return 'Title must contain real words (not just numbers/symbols)';
        return '';
    },
    quantity: (v) => {
        const s = v.trim();
        if (!s) return 'Quantity is required';
        if (s.length > 30) return 'Quantity must be under 30 characters';
        if (!QUANTITY_VALID_CHARS_RE.test(s)) return 'Use letters, numbers, and basic punctuation only';
        const match = s.match(QUANTITY_NUM_RE);
        if (!match) return "Must include a number, e.g. '12 servings' or '5 kg'";
        if (parseFloat(match[0]) <= 0) return 'Quantity must be greater than zero';
        return '';
    },
    pickupAddress: (v) => {
        const s = v.trim();
        if (s.length < 5) return 'Address must be at least 5 characters';
        if (s.length > 150) return 'Address must be under 150 characters';
        if ((s.match(FOOD_TITLE_RE) || []).length < 3) return 'Address must contain a street/area name';
        return '';
    },
    expiryTime: (v) => {
        if (!v) return 'Pickup time is required';
        const target = new Date(v).getTime();
        if (Number.isNaN(target)) return 'Invalid date';
        const now = Date.now();
        const diffMs = target - now;
        if (diffMs < MIN_PICKUP_MINUTES * MS_PER_MIN) {
            return `Pickup must be at least ${MIN_PICKUP_MINUTES} minutes from now`;
        }
        if (diffMs > MAX_PICKUP_DAYS * MS_PER_DAY) {
            return `Pickup must be within ${MAX_PICKUP_DAYS} days`;
        }
        return '';
    },
    description: (v) => {
        if (v.length > 500) return 'Description must be under 500 characters';
        return '';
    },
};

export default function CreateDonation() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        foodItem: '',
        foodType: 'cooked',
        quantity: '',
        expiryTime: '',
        description: '',
        pickupAddress: '',
    });
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const errors = useMemo(() => {
        const out = {};
        for (const [field, fn] of Object.entries(validators)) {
            out[field] = fn(formData[field] || '');
        }
        return out;
    }, [formData]);

    const hasErrors = Object.values(errors).some(Boolean);

    const showError = (field) => touched[field] && errors[field];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        setTouched(prev => ({ ...prev, [e.target.name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ foodItem: true, quantity: true, pickupAddress: true, expiryTime: true, description: true });
        if (hasErrors) {
            toast.error('Please fix the highlighted fields.');
            return;
        }
        setLoading(true);
        try {
            const hoursLeft = Math.ceil((new Date(formData.expiryTime) - Date.now()) / 3600000);
            await api.post('/donations', {
                food_type: `[${formData.foodType}] ${formData.foodItem.trim()}`,
                quantity: formData.quantity.trim(),
                address: formData.pickupAddress.trim(),
                best_before: hoursLeft,
                notes: formData.description.trim() || null,
            });
            toast.success('Donation listed successfully!');
            navigate('/donor-dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to list donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field, base = 'w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border focus:ring-1 outline-none transition-all') =>
        `${base} ${showError(field) ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-brand-green/10 focus:border-primary focus:ring-primary'}`;

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col">
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

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="foodItem" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Food Title</label>
                            <input
                                type="text"
                                id="foodItem"
                                name="foodItem"
                                value={formData.foodItem}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g. 50 Trays of Mixed Veg Curry"
                                maxLength={80}
                                className={inputClass('foodItem')}
                            />
                            {showError('foodItem') && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.foodItem}
                                </p>
                            )}
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
                                    onBlur={handleBlur}
                                    placeholder="e.g. 15 kg or 50 servings"
                                    maxLength={30}
                                    inputMode="text"
                                    className={inputClass('quantity')}
                                />
                                {showError('quantity') ? (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {errors.quantity}
                                    </p>
                                ) : (
                                    <p className="text-brand-green/40 text-xs mt-1">Must include a number (e.g. 12 servings)</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="pickupAddress" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Pickup Address</label>
                            <input
                                type="text"
                                id="pickupAddress"
                                name="pickupAddress"
                                value={formData.pickupAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g. 12 MG Road, New Delhi"
                                maxLength={150}
                                className={inputClass('pickupAddress')}
                            />
                            {showError('pickupAddress') && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.pickupAddress}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="expiryTime" className="block text-sm font-bold text-brand-green dark:text-white mb-2">Must be picked up by</label>
                            <input
                                type="datetime-local"
                                id="expiryTime"
                                name="expiryTime"
                                value={formData.expiryTime}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={inputClass('expiryTime')}
                            />
                            {showError('expiryTime') ? (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.expiryTime}
                                </p>
                            ) : (
                                <p className="text-xs text-brand-green/50 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">info</span>
                                    NGOs usually need at least 2 hours to arrange pickup.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-brand-green dark:text-white mb-2">
                                Description / Instructions
                                <span className="ml-2 text-xs font-normal text-brand-green/40">{formData.description.length}/500</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                rows="3"
                                maxLength={500}
                                placeholder="Any allergens? Special pickup instructions?"
                                className={inputClass('description', 'w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border focus:ring-1 outline-none transition-all resize-none')}
                            ></textarea>
                            {showError('description') && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-brand-green dark:text-white mb-2">Upload Photo (Optional)</label>
                            <div className="border-2 border-dashed border-brand-green/20 rounded-xl p-8 text-center hover:bg-brand-green/5 transition-all cursor-pointer group">
                                <span className="material-symbols-outlined text-4xl text-brand-green/40 group-hover:text-primary transition-colors">add_a_photo</span>
                                <p className="text-sm text-brand-green/60 mt-2">Click to upload or drag and drop</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || hasErrors}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <span className="material-symbols-outlined">publish</span>
                                {loading ? 'Listing...' : 'List Donation'}
                            </button>
                            {hasErrors && Object.values(touched).some(Boolean) && (
                                <p className="text-center text-red-500 text-xs mt-2">Fix the highlighted fields above to continue.</p>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
