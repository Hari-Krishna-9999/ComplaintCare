import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL;
import FooterC from './FooterC';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false); // Step 4: loading state
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        const authenticatedUser = data.user || data;
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        const userType = authenticatedUser.userType;

        if (userType === "Admin") {
          navigate("/admin");
        } else if (userType === "Agent") {
          navigate("/agent");
        } else if (userType === "Ordinary") {
          navigate("/user");
        } else {
          setErrorMsg("Unknown user role.");
        }
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error during login. Please try again.");
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

          {errorMsg && <p style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</p>}

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
              <p>Don't have an account?<Link to="/signup">Signup</Link> </p>
              <a href="#" className="forgot">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>

      <FooterC />
    </>
  );
}

export default Login;
