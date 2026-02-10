import './HowItWorks.css';

export default function HowItWorks() {
    const steps = [
        {
            icon: 'inventory_2',
            title: '1. Donate',
            description: 'List your surplus food in seconds through our easy-to-use dashboard. Specify quantity and pickup time.',
            color: 'primary'
        },
        {
            icon: 'map',
            title: '2. Connect',
            description: 'Our platform automatically notifies nearby verified NGO partners and volunteers about your donation.',
            color: 'green'
        },
        {
            icon: 'favorite',
            title: '3. Distribute',
            description: 'Food is collected by volunteers and delivered directly to local communities, minimizing waste and hunger.',
            color: 'red'
        }
    ];

    return (
        <section className="how-it-works-section" id="how-it-works">
            <div className="container">
                <div className="section-header">
                    <p className="section-tag">Process</p>
                    <h2 className="section-title">How AnnSparsh Works</h2>
                    <p className="section-description">
                        Our platform makes it easy to donate surplus food and ensure it reaches
                        those in need efficiently and safely.
                    </p>
                </div>

                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`step-card hover-lift animate-fade-in-up delay-${(index + 1) * 100}`}
                            style={{ animationDelay: `${(index + 1) * 200}ms` }}
                        >
                            <div className={`step-icon icon-${step.color} hover-scale`}>
                                <span className="material-symbols-outlined">{step.icon}</span>
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
