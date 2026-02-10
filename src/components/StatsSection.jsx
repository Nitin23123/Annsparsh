import { useEffect, useState, useRef } from 'react';
import './StatsSection.css';

export default function StatsSection() {
    const [stats, setStats] = useState({
        meals: 0,
        partners: 0,
        cities: 0,
        volunteers: 0
    });

    const [hasAnimated, setHasAnimated] = useState(false);
    const sectionRef = useRef(null);

    const finalStats = {
        meals: 50000,
        partners: 120,
        cities: 15,
        volunteers: 2000
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    animateStats();
                    setHasAnimated(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    const animateStats = () => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setStats({
                meals: Math.floor(finalStats.meals * progress),
                partners: Math.floor(finalStats.partners * progress),
                cities: Math.floor(finalStats.cities * progress),
                volunteers: Math.floor(finalStats.volunteers * progress)
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                setStats(finalStats);
            }
        }, interval);
    };

    return (
        <section className="stats-section" ref={sectionRef} id="impact">
            <div className={`stats-container ${hasAnimated ? 'animate-fade-in-up' : ''}`}>
                <div className="stat-item hover-scale">
                    <span className="stat-value">{(stats.meals / 1000).toFixed(0)}k+</span>
                    <span className="stat-label">Meals Saved</span>
                </div>

                <div className="stat-item hover-scale">
                    <span className="stat-value">{stats.partners}+</span>
                    <span className="stat-label">NGO Partners</span>
                </div>

                <div className="stat-item hover-scale">
                    <span className="stat-value">{stats.cities}+</span>
                    <span className="stat-label">Cities Covered</span>
                </div>

                <div className="stat-item hover-scale">
                    <span className="stat-value">{(stats.volunteers / 1000).toFixed(1)}k+</span>
                    <span className="stat-label">Volunteers</span>
                </div>
            </div>

            <svg className="stats-pattern" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </section>
    );
}
