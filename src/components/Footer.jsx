import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-icon-small">
                                <span className="material-symbols-outlined">eco</span>
                            </div>
                            <h2 className="logo-text-footer">AnnSparsh</h2>
                        </div>
                        <p className="footer-tagline">
                            Ending food waste, one meal at a time. A community-led initiative to build a hunger-free world.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h5 className="footer-heading">Navigation</h5>
                        <ul className="link-list">
                            <li><a href="#mission">Our Mission</a></li>
                            <li><a href="#how-it-works">How it Works</a></li>
                            <li><a href="#partners">Partner with Us</a></li>
                            <li><a href="#stories">Success Stories</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h5 className="footer-heading">Resources</h5>
                        <ul className="link-list">
                            <li><a href="#guidelines">Food Safety Guidelines</a></li>
                            <li><a href="#help">Help Center</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#support">Contact Support</a></li>
                        </ul>
                    </div>

                    <div className="footer-newsletter">
                        <h5 className="footer-heading">Stay Updated</h5>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="email-input"
                            />
                            <button className="send-btn">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                        <div className="social-links">
                            <a href="#" className="social-link">
                                <span className="material-symbols-outlined">public</span>
                            </a>
                            <a href="#" className="social-link">
                                <span className="material-symbols-outlined">share</span>
                            </a>
                            <a href="#" className="social-link">
                                <span className="material-symbols-outlined">mail</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">© 2024 AnnSparsh Foundation. All rights reserved.</p>
                    <div className="legal-links">
                        <a href="#terms">Terms of Service</a>
                        <a href="#cookies">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
