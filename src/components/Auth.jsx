import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would handle authentication here
        navigate('/role-selection');
    };

    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen flex flex-col font-display">
            {/* Top Navigation - Custom for Auth Page as per design */}
            <header className="w-full px-6 lg:px-40 py-4 flex items-center justify-between bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-brand-green/10 sticky top-0 z-50">
                <div className="flex items-center gap-2 text-brand-green dark:text-primary">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">eco</span>
                    </div>
                    <Link to="/" className="text-xl font-bold tracking-tight">AnnSparsh</Link>
                </div>
                <div className="flex gap-4">
                    <button className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-semibold text-brand-green hover:text-primary transition-colors">
                        About Us
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 text-sm font-semibold border border-brand-green/20 rounded-lg text-brand-green hover:bg-brand-green/5 transition-colors">
                        Contact
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 w-full">
                <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                    {/* Left Side: Branding & Visual */}
                    <div className="hidden md:flex flex-col flex-1 space-y-8">
                        <div>
                            <h2 className="text-5xl font-extrabold text-brand-green dark:text-white leading-tight mb-4">
                                Reducing waste, <br /><span className="text-primary">feeding hope.</span>
                            </h2>
                            <p className="text-lg text-brand-green/70 dark:text-gray-400 max-w-md">
                                Join our community of donors and volunteers dedicated to making sure no meal goes to waste. Every contribution counts towards a hunger-free world.
                            </p>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
                            <img className="object-cover w-full h-full" alt="Fresh organic vegetables in a wooden crate" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm6N4a8W-AA_py815cc352I5HF0E6WiaMS30M6_UzXm7S0H13Qz8vTQ-RgCtpMEYikCAGMlvR1j0PeSbsRevXzpjE2E9PaNZv1HtCnqcdK2Jhq6YkxRipHNowrTANeVMGX2gHmdTgxak-egUXVn7fz2F6uit4vqZ9OtwP2y-V_v6LBnvGDBKJekgCadntEx443A1ZgT8NqnRMCBHJJ-iYpKHTN77qhdAmRCZ_jfhXWKO5yFqQjQf807Nz5vF26OaEZxmaje_nDZQY" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-green/60 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="font-bold text-xl italic">"Bringing surplus food to those in need."</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 py-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-brand-green dark:text-primary">12k+</span>
                                <span className="text-sm text-brand-green/60 dark:text-gray-400">Meals Saved</span>
                            </div>
                            <div className="w-px h-10 bg-brand-green/20"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-brand-green dark:text-primary">500+</span>
                                <span className="text-sm text-brand-green/60 dark:text-gray-400">Volunteers</span>
                            </div>
                            <div className="w-px h-10 bg-brand-green/20"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-brand-green dark:text-primary">85</span>
                                <span className="text-sm text-brand-green/60 dark:text-gray-400">Partner NGOs</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Auth Card */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-brand-green/5">
                            {/* Toggle Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${isLogin ? 'border-primary text-brand-green dark:text-white' : 'border-transparent text-gray-400 hover:text-brand-green'}`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${!isLogin ? 'border-primary text-brand-green dark:text-white' : 'border-transparent text-gray-400 hover:text-brand-green'}`}
                                >
                                    Register
                                </button>
                            </div>
                            <div className="p-8">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-brand-green dark:text-white">
                                        {isLogin ? 'Welcome Back' : 'Create Account'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {isLogin ? 'Please enter your details to sign in.' : 'Join us to make a difference.'}
                                    </p>
                                </div>
                                {/* Form */}
                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-brand-green dark:text-gray-300 block">Full Name</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                                                <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" type="text" placeholder="John Doe" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-brand-green dark:text-gray-300 block">Email Address</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                                            <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" type="email" placeholder="alex@example.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-semibold text-brand-green dark:text-gray-300 block">Password</label>
                                            {isLogin && <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot Password?</a>}
                                        </div>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                                            <input className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" type="password" placeholder="••••••••" />
                                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green">
                                                <span className="material-symbols-outlined text-xl">visibility</span>
                                            </button>
                                        </div>
                                    </div>
                                    {isLogin && (
                                        <div className="flex items-center">
                                            <input id="remember" type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">Keep me logged in</label>
                                        </div>
                                    )}
                                    <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 mt-8">
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </button>
                                    <div className="mt-6 text-center">
                                        <Link to="/verification-pending" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 hover:underline bg-primary/5 px-4 py-2 rounded-full transition-colors">
                                            <span className="material-symbols-outlined text-lg">hourglass_empty</span>
                                            Check Application Status
                                        </Link>
                                    </div>
                                </form>
                                {/* Divider */}
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-100 dark:border-zinc-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-zinc-900 px-3 text-gray-400">Or continue with</span>
                                    </div>
                                </div>
                                {/* Social Login */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                        <img className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG39GxqNRVMNmTEph9qeIOYvz9wNt3Pgb8YdsNVhKDK5DUFB9BQiXdR9s7nblJl2oZfHQVVk7tztTFmB2V6dKMevF3xCWd7UdhKMNyNmCJtDtIKt_IkRGZorJySpy6lREskDe65e8A3VCdeyNvKVv7ySub1PudyuyiZH75PWbUHRPZ2LRn2UB1bhijVyEEqJ26XUWuB0PSshaVOuhd58meL7-4VfZZyAj3I7bBlSEqIYoGiGbAEyPL3lEkDWEW6gGu6ggr5pKwEZg" alt="Google" data-alt="Google logo icon" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Google</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                        <img className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV9fV6yCeNGBzTX_Av-3VKrXcj2sZV_WkVSANgznqsfC2e7bmiiWR04d5otWgP9sh-0zlh1W15htKPS2fnwwuP2TBi_dUz3is2W8_ISD4vZaJNMc3t5pQ4hhdbLXt5laoQsV4clXcm04MRgwh_51DjMQ68XBc-elk8lNjiy8mcDILGbFOhV9Pv4ly4lHGpSSWZcQ6qSdHIb2N5l0z2Ol329e59_WnuV5p0O6Wf2OKoDdJl9u_84fiJtwLo4_IvaSpnkk3JVkBJvqw" alt="LinkedIn" data-alt="LinkedIn logo icon" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">LinkedIn</span>
                                    </button>
                                </div>
                            </div>
                            {/* Form Footer */}
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 text-center border-t border-gray-100 dark:border-zinc-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
                                        {isLogin ? "Start saving food today" : "Sign in here"}
                                    </button>
                                </p>
                            </div>
                        </div>
                        {/* Security Note */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-brand-green/40 dark:text-gray-500 text-xs">
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            <span>Secure SSL Encrypted Connection</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 px-6 text-center">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-brand-green/60 dark:text-gray-500 mb-4">
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-primary transition-colors">Cookies</a>
                    <a href="#" className="hover:text-primary transition-colors">Help Center</a>
                </div>
                <p className="text-xs text-brand-green/40 dark:text-gray-600">
                    © 2024 AnnSparsh. All rights reserved. Designed for impact.
                </p>
            </footer>
        </div>
    );
}
