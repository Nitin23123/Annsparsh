import { useEffect, useState } from 'react';
import './Hero.css';

export default function Hero() {
    const [mealsServed, setMealsServed] = useState(1240);

    useEffect(() => {
        const interval = setInterval(() => {
            setMealsServed(prev => prev + Math.floor(Math.random() * 3));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-badge animate-fade-in-up">
                        <span className="material-symbols-outlined">volunteer_activism</span>
                        Social Impact Platform
                    </div>

                    <h1 className="hero-title animate-fade-in-up delay-100">
                        Reducing Waste, <br />
                        <span className="title-accent">Feeding Communities</span>
                    </h1>

                    <p className="hero-description animate-fade-in-up delay-200">
                        Connecting surplus food from donors to those who need it most.
                        Join AnnSparsh in bridging the gap between waste and hunger.
                    </p>

                    <div className="hero-actions animate-fade-in-up delay-300">
                        <button className="btn btn-primary btn-large hover-lift">Donate Food</button>
                        <button className="btn btn-secondary btn-large hover-lift">Join as NGO</button>
                    </div>
                </div>

                <div className="hero-visual animate-scale-in delay-200">
                    <div className="hero-image-wrapper">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAyEFGPRA45ivjUjsP21WZ3IeGMXdAjumuWw1aN4pGLvkzZNNnnvjRbh8imjuKVRSjVUPPsMl2RaYbVnPeWdOXPMLzYrws6M031BR5s_NmIsZbyE6gViSSftO8e9LqTZ8vDMtv5az1wt6ypCwE4qQJGCSqw08aHgRwtz1F5qbe3M3wuT_0Ik6VwLhvvKJjV6Ozs7yS9OiR-ScoiI7cf93mxibETI9a-TOkx1Jw97KjpuMDmicDjqWe_YRt_MVyEOAmbIYf4bnDlcw"
                            alt="People sharing food"
                            className="hero-image hover-scale"
                        />
                    </div>

                    <div className="floating-card hover-lift">
                        <div className="card-icon">
                            <span className="material-symbols-outlined">restaurant</span>
                        </div>
                        <div className="card-content">
                            <p className="card-label">Meals Served Today</p>
                            <p className="card-value">{mealsServed.toLocaleString()}+</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-bg-decoration"></div>
        </section>
    );
}
