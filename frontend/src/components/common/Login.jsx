import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FooterC from './FooterC';
import API from '../../api/api';
import { saveUser } from '../../utils/auth';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await API.post('/auth/login', formData);
      const data = response.data.data;

      saveUser(data);
      const userType = data.userType;

      if (userType === 'Admin') {
        navigate('/admin');
      } else if (userType === 'Agent') {
        navigate('/agent');
      } else if (userType === 'Ordinary') {
        navigate('/user');
      } else {
        setErrorMsg('Unknown user role.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Error during login. Please try again.');
      }
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
            <li><Link to="/login" className="active">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </nav>
      </header>

      <div className="login-container">
        <div className="login-card">
          <h2>Welcome Back!</h2>
          <p>Please login to continue</p>

          {errorMsg && <p style={{ color: '#ff4444', marginBottom: '10px' }}>{errorMsg}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="form-footer">
              <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
              <Link to="/forgot-password" className="forgot">Forgot Password?</Link>
            </div>
          </form>
        </div>
      </div>

      <FooterC />
    </>
  );
}

export default Login;
