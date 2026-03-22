import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
    const [meals, setMeals] = useState(1240);

    useEffect(() => {
        const iv = setInterval(() => setMeals(p => p + Math.floor(Math.random() * 3)), 5000);
        return () => clearInterval(iv);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center bg-brand-cream dark:bg-zinc-950 overflow-hidden pt-16">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/15 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                        <span className="material-symbols-outlined text-base">volunteer_activism</span>
                        Social Impact Platform
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-brand-green dark:text-white leading-tight tracking-tight">
                        Reducing Waste,{' '}
                        <span className="text-primary">Feeding</span>{' '}
                        Communities
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                        Connecting surplus food from donors to those who need it most.
                        Join AnnSparsh in bridging the gap between waste and hunger.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/auth" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 text-sm">
                            <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                            Donate Food
                        </Link>
                        <Link to="/auth" className="inline-flex items-center gap-2 border border-brand-green/20 dark:border-white/10 text-brand-green dark:text-white hover:bg-brand-green/5 dark:hover:bg-white/5 font-bold px-6 py-3.5 rounded-2xl transition-all text-sm">
                            <span className="material-symbols-outlined text-xl">handshake</span>
                            Join as NGO
                        </Link>
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                        {[{ icon: 'verified', text: '500+ NGOs' }, { icon: 'location_on', text: '15+ cities' }, { icon: 'favorite', text: '50k+ meals' }].map(b => (
                            <div key={b.text} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-primary text-base">{b.icon}</span>
                                {b.text}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-green/20 aspect-[4/3]">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAyEFGPRA45ivjUjsP21WZ3IeGMXdAjumuWw1aN4pGLvkzZNNnnvjRbh8imjuKVRSjVUPPsMl2RaYbVnPeWdOXPMLzYrws6M031BR5s_NmIsZbyE6gViSSftO8e9LqTZ8vDMtv5az1wt6ypCwE4qQJGCSqw08aHgRwtz1F5qbe3M3wuT_0Ik6VwLhvvKJjV6Ozs7yS9OiR-ScoiI7cf93mxibETI9a-TOkx1Jw97KjpuMDmicDjqWe_YRt_MVyEOAmbIYf4bnDlcw" alt="People sharing food" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-green/40 via-transparent to-transparent" />
                    </div>
                    <div className="absolute -bottom-5 -left-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 px-5 py-4 flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-2xl">restaurant</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Meals Served Today</p>
                            <p className="text-xl font-black text-brand-green dark:text-white">{meals.toLocaleString()}+</p>
                        </div>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-xs font-bold text-gray-800 dark:text-white">Live donations active</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
