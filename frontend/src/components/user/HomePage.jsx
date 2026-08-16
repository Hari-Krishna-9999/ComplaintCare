import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api/api';
import { Plus, FileText, Clock, CheckCircle, MessageSquare, Search } from 'lucide-react';
import FooterC from '../common/FooterC';
import './UserDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, clearUser } from '../../utils/auth';

const HomePage = () => {
  const user = useMemo(() => getUser() || { name: 'User' }, []);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: user.name || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    comment: '',
  });

  const [userComplaints, setUserComplaints] = useState([]);

  const handleLogout = () => {
    clearUser();
    window.location.href = '/login';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const complaintData = {
      ...formData,
      userId: user._id,
      status: 'Pending',
    };

    try {
      const response = await API.post('/complaints', complaintData);
      const result = response.data.data;
      setSuccessMsg('Complaint submitted successfully!');
      setShowForm(false);
      setFormData({
        name: user.name || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        comment: '',
      });
      setUserComplaints((prev) => [result, ...prev]);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to submit complaint. Please try again.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSubmitting(false);
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
        setLoading(true);
        const res = await API.get(`/complaints/user/${user._id}`);
        setUserComplaints(res.data.data);
      } catch (err) {
        console.error('Error loading complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchComplaints();
    else setLoading(false);
  }, [user._id]); // Use primitive _id, not the user object, to prevent infinite loop

  const handleHomeClick = () => {
    navigate('/user');
  };


  const filteredComplaints = useMemo(() => {
    if (!searchTerm.trim()) return userComplaints;
    const term = searchTerm.toLowerCase();
    return userComplaints.filter(
      (c) =>
        c._id?.toLowerCase().includes(term) ||
        c.comment?.toLowerCase().includes(term) ||
        c.city?.toLowerCase().includes(term) ||
        c.status?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term)
    );
  }, [userComplaints, searchTerm]);

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

        {successMsg && <div className="toast-success">{successMsg}</div>}
        {errorMsg && <div className="toast-error">{errorMsg}</div>}

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

        {loading ? (
          <p style={{ color: '#ccc', textAlign: 'center' }}>Loading complaints...</p>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} style={{ color: '#FFD700' }} />
            <p>{searchTerm ? 'No complaints match your search.' : 'No complaints yet. Click "New Complaint" to get started.'}</p>
          </div>
        ) : (
          <ul className="complaint-list">
            {filteredComplaints.map((c) => (
              <li key={c._id} className="complaint-item">
                <strong>Complaint ID:</strong> {c._id}<br/>
                <strong>Status:</strong> <span style={{ color: '#FFD700' }}>{c.status}</span> <br />
                <strong>Issue:</strong> {c.comment}
              </li>
            ))}
          </ul>
        )}

        {showForm && (
          <div className="form-card">
            <h2>Raise a Complaint</h2>
            <form className="complaint-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="text" name="name" value={formData.name} readOnly placeholder="Name" />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required maxLength={500} />
              </div>
              <div className="form-row">
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required maxLength={100} />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required maxLength={100} />
              </div>
              <div className="form-row">
                <input type="number" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required min={100000} max={999999} />
                <input type="text" name="status" value="Pending" readOnly />
              </div>
              <textarea
                name="comment"
                placeholder="Description"
                rows="4"
                value={formData.comment}
                onChange={handleChange}
                required
                maxLength={2000}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Register'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#555' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <FooterC />
    </div>
  );
};

export default HomePage;
