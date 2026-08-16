import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FooterC from '../common/FooterC';
import heroImage from '../../images/Image1.png'; 

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-wrapper">
      <header className="header">
        <div className="brand">COMPLAINTCARE</div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </nav>
      </header>
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-image">
            <img src={heroImage} alt="Complaint Management - streamline your team's workflow" />
          </div>
          <div className="hero-text">
            <h1>Empower Your Team</h1>
            <p>Streamline complaints and exceed customer expectations.</p>
            <div className="hero-buttons">
              <button onClick={() => handleNavigation('/login')} className="btn-login">Register Complaint</button>
              <button onClick={() => handleNavigation('/signup')} className="btn-login">Get Started</button>
            </div>
          </div>
        </div>
      </main>
      <FooterC />
    </div>
  );
};
export default Home;
