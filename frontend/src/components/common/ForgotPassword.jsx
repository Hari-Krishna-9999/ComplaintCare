import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import FooterC from './FooterC';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    try {
      const response = await API.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'If that email exists, you will receive reset instructions shortly.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Unable to send reset email. Please try again.');
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
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Signup</a></li>
          </ul>
        </nav>
      </header>

      <div className="login-container">
        <div className="login-card">
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send instructions to reset your password.</p>

          {message && <p style={{ color: 'green' }}>{message}</p>}
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="form-footer">
              <p>Remembered your password? <a href="/login">Login</a></p>
            </div>
          </form>
        </div>
      </div>

      <FooterC />
    </>
  );
}

export default ForgotPassword;
