import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { Plus, FileText, Clock, CheckCircle, MessageSquare, Search } from 'lucide-react';
import FooterC from '../common/FooterC';
import './UserDashboard.css';
import { useNavigate , useLocation } from 'react-router-dom';

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: user.name,
    address: '',
    city: '',
    state: '',
    pincode: '',
    comment: '',
  });

  const [userComplaints, setUserComplaints] = useState([]); // Dummy array for now

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const complaintData = {
    ...formData,
    userId: user._id, 
    status: 'Pending',
  };

  try {
      const response = await API.post('/complaints', complaintData);
      const result = response.data.data;
    alert('Complaint submitted successfully!');
    
    setShowForm(false);
    setFormData({
      name: user.name,
      address: '',
      city: '',
      state: '',
      pincode: '',
      comment: '',
    });
    setUserComplaints(prev => [...prev, result]);
  } catch (error) {
    console.error('Error submitting complaint:', error);
    alert('Failed to submit complaint. Please try again.');
  }
};

  const navigate = useNavigate();
  const location = useLocation();

  const handleStatusClick = () => {
    navigate('/status');
  };
    useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get(`/complaints/user/${user._id}`);
        setUserComplaints(res.data.data);
      } catch (err) {
        console.error('Error loading complaints:', err);
      }
    };

    if (user?._id) fetchComplaints();
    }, [user]);
    const handleHomeClick = () => {
      navigate('/user');
    };

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="brand">ComplaintCare</div>
        <span className="welcome-text">Welcome, {user.name}</span>
        <div className="user-actions">  
          <button
            className={`complaint-status ${location.pathname === '/user' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            Home
          </button>
          <button className="complaint-status" onClick={handleStatusClick}>Status</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="homepage-main">
        <div className="top-actions">
          <h1>Your Complaints</h1>
          <button className="new-complaint-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Complaint
          </button>
        </div>

        <div className="user-stats">
          {[
            { icon: <FileText />, label: 'Total', value: userComplaints.length },
            { icon: <Clock />, label: 'Pending', value: userComplaints.filter(c => c.status === 'Pending').length },
            { icon: <MessageSquare />, label: 'In Progress', value: userComplaints.filter(c => c.status === 'In Progress').length },
            { icon: <CheckCircle />, label: 'Completed', value: userComplaints.filter(c => c.status === 'Resolved').length },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              {stat.icon}
              <div>
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <h1>Your Complaints</h1>
        <ul className="complaint-list">
          {userComplaints.map((c) => (
            <li key={c._id} className="complaint-item">
              <strong>Complaint ID:</strong> {c._id}<br/>
              <strong>Status:</strong> {c.status} <br />
              <strong>Issue:</strong> {c.comment}
            </li>
          ))}
        </ul>


        {showForm && (
          <div className="form-card">
            <h2>Raise a Complaint</h2>
            <form className="complaint-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="text" name="name" value={formData.name} readOnly placeholder="Name" />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <input type="number" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
                <input type="text" name="status" value="Pending" readOnly />
              </div>
              <textarea
                name="comment"
                placeholder="Description"
                rows="4"
                value={formData.comment}
                onChange={handleChange}
                required
              />
              <button type="submit">Register</button>
            </form>
          </div>
        )}
      </main>
        <FooterC />
    </div>
  );
};

export default HomePage;
