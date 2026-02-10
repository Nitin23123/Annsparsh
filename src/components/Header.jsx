import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-icon">
          <span className="material-symbols-outlined">eco</span>
        </div>
        <h2 className="logo-text">AnnSparsh</h2>
      </div>

      <nav className="header-nav">
        <a href="#impact" className="nav-link">Impact</a>
        <a href="#how-it-works" className="nav-link">How it Works</a>
        <a href="#partners" className="nav-link">Partners</a>
      </nav>

      <div className="header-actions">
        <Link to="/auth" className="btn btn-secondary login-btn">Login</Link>
        <button className="btn btn-primary">Get Started</button>
      </div>
    </header>
  );
}
