import './ImpactMap.css';

export default function ImpactMap() {
    const features = [
        {
            icon: 'check_circle',
            text: 'Fully Verified NGO Network'
        },
        {
            icon: 'check_circle',
            text: 'Temperature-Controlled Logistics'
        },
        {
            icon: 'check_circle',
            text: 'Tax Benefits for Business Donors'
        }
    ];

    return (
        <section className="impact-map-section">
            <div className="container">
                <div className="impact-grid">
                    <div className="map-container">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCry7S0BHTtsrwNnYRx914sRxcf51VZuCfdGpVzaJSVETAjiA21c0xucG45xKIQDmtH2zHH8dii1pfBhZzxnmxo2Ld1G2539TLXzeFdKkusAllgtDGorPCxQ_GzP_1jEQdjbLCA5g0xUGduAz5-jMZahrPoPddumnXxgANiCtjbfU1LmFQQsGVHiVnVePFmyOvHHRGiqo8AO1EZ6zC-rDZ1k7F_72GC2Ny2MzduV348Qd2Wn0PXDn3PUW3A9PpT-f3PqojRlSe7Y1Y"
                            alt="Service area map"
                            className="map-image"
                        />
                    </div>

                    <div className="map-content">
                        <h2 className="map-title">Real-time Impact Map</h2>
                        <p className="map-description">
                            Track the journey of your donation in real-time. We provide full transparency
                            from the moment you list surplus food to the moment it reaches a plate.
                        </p>

                        <ul className="features-list">
                            {features.map((feature, index) => (
                                <li key={index} className="feature-item">
                                    <span className="material-symbols-outlined feature-icon">{feature.icon}</span>
                                    {feature.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
