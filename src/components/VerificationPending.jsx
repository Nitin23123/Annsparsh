import React from 'react';
import { Link } from 'react-router-dom';

export default function VerificationPending() {
    return (
        <div className="bg-brand-cream dark:bg-background-dark min-h-screen font-display flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-white/5 p-10 rounded-3xl shadow-xl max-w-lg w-full border border-brand-green/10">
                <div className="size-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl text-orange-600">hourglass_empty</span>
                </div>
                <h1 className="text-3xl font-bold text-brand-green dark:text-white mb-4">Verification Pending</h1>
                <p className="text-brand-green/70 dark:text-white/70 mb-8 text-lg">
                    Thanks for signing up! We're currently reviewing your documents to verify your organization. This usually takes 24-48 hours.
                </p>

                <div className="bg-background-light dark:bg-zinc-800/50 p-4 rounded-xl mb-8 text-left flex items-start gap-4">
                    <span className="material-symbols-outlined text-brand-green/60 mt-0.5">info</span>
                    <div>
                        <p className="font-bold text-brand-green dark:text-white text-sm">Why do we verify?</p>
                        <p className="text-xs text-brand-green/60 dark:text-white/60 mt-1">To ensure safety and food quality standards for all donations on our platform.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button className="w-full bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all">
                        Check Status
                    </button>
                    <Link to="/" className="block text-brand-green font-bold hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
            <p className="mt-8 text-brand-green/40 text-sm">Need help? <a href="#" className="underline hover:text-brand-green">Contact Support</a></p>
        </div>
    );
}
