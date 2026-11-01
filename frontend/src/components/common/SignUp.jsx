import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/api';
import FooterC from './FooterC';

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const form = e.currentTarget;
    const name = (form.elements?.name?.value || formData.name || '').trim();
    const email = (form.elements?.email?.value || formData.email || '').trim();
    const password = form.elements?.password?.value || formData.password || '';
    const confirmPassword = form.elements?.confirmPassword?.value || formData.confirmPassword || '';

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMsg('Password must contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        userType: 'Ordinary',
      });
      if (response.data.success) {
        setSuccessMsg('Signup successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrorMsg(response.data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error(error.message);
      setErrorMsg(error.response?.data?.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="brand">COMPLAINTCARE</div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup" className="active">Signup</Link></li>
          </ul>
        </nav>
      </header>

      <div className="login-container">
        <div className="login-card">
          <h2>Create Account</h2>
          <p>Join us to raise and track complaints</p>

          {errorMsg && <p style={{ color: '#ff4444', marginBottom: '10px' }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: '#00c853', marginBottom: '10px' }}>{successMsg}</p>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={254}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            <div className="form-footer">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </form>
        </div>
      </div>

      <FooterC />
    </>
  );
}

export default SignUp;
