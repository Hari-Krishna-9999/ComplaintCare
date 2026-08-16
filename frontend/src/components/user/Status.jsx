import React, { useEffect, useState, useMemo } from 'react';
import API from '../../api/api';
import FooterC from '../common/FooterC';
import ChatWindow from '../common/ChatWindow';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, clearUser } from '../../utils/auth';

const Status = () => {
  const [complaints, setComplaints] = useState([]);
  const [openChats, setOpenChats] = useState({});
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const user = useMemo(() => getUser(), []);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/complaints/user/${user._id}`);
        setComplaints(res.data.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchComplaints();
    else setLoading(false);
  }, [user?._id]); // Use primitive _id to prevent infinite loop

  const handleStatusClick = () => navigate('/status');
  const handleHomeClick = () => navigate('/user');
  const handleLogout = () => {
    clearUser();
    window.location.href = '/login';
  };

  const handleDelete = async (complaintId) => {

    const confirmed = window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await API.delete(`/complaints/${complaintId}`);
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
      setSuccessMsg('Complaint deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error deleting complaint:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete complaint.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const toggleChat = (complaintId) => {
    setOpenChats((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };
  
  return (
    <>
      <header className="homepage-header">
        <div className="brand">ComplaintCare</div>
        <div className="user-actions">  
          <button className={`complaint-status ${location.pathname === '/user' ? 'active' : ''}`} onClick={handleHomeClick}>Home</button>
          <button className={`complaint-status ${location.pathname === '/status' ? 'active' : ''}`} onClick={handleStatusClick}>Status</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ padding: '20px', minHeight: '80vh' }}>
        <h2 style={{ color: '#FFD700' }}>Your Complaint Status</h2>

        {successMsg && <div className="toast-success">{successMsg}</div>}
        {errorMsg && <div className="toast-error">{errorMsg}</div>}

        {loading ? (
          <p style={{ color: '#ccc', textAlign: 'center', marginTop: '40px' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found. Go to Home to create one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
            {complaints.map((c) => (
              <React.Fragment key={c._id}>
                <div
                  style={{
                    border: '1px solid #FFD700',
                    borderRadius: '10px',
                    padding: '15px',
                    backgroundColor: '#111',
                    color: '#fff',
                  }}
                >
                  <p><strong>Name:</strong> {c.name}</p>
                  <p><strong>Address:</strong> {c.address}</p>
                  <p><strong>City:</strong> {c.city}</p>
                  <p><strong>State:</strong> {c.state}</p>
                  <p><strong>Pincode:</strong> {c.pincode}</p>
                  <p><strong>Description:</strong> {c.comment}</p>
                  <p><strong>Status:</strong> <span style={{ color: '#FFD700' }}>{c.status}</span></p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleChat(c._id)}
                      style={{
                        backgroundColor: '#FFD700',
                        border: 'none',
                        padding: '8px 16px',
                        color: '#000',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {openChats[c._id] ? 'Close Chat' : 'Chat with Agent'}
                    </button>
                    {c.status === 'Pending' && (
                      <button
                        style={{
                          backgroundColor: '#dc3545',
                          border: 'none',
                          padding: '8px 16px',
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {openChats[c._id] && (
                  <ChatWindow
                    complaintId={c._id}
                    onClose={() => setOpenChats((prev) => ({ ...prev, [c._id]: false }))}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <FooterC />
      </div>
    </>
  );
};

export default Status;
