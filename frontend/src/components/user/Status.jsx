import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import FooterC from '../common/FooterC';
import ChatWindow from '../common/ChatWindow';
import { useNavigate, useLocation } from 'react-router-dom';

const Status = () => {
  const [complaints, setComplaints] = useState([]);
  const [openChats, setOpenChats] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get(`/complaints/user/${user._id}`);
        setComplaints(res.data.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
      }
    };

    if (user?._id) fetchComplaints();
  }, [user]);

  const handleStatusClick = () => navigate('/status');
  const handleHomeClick = () => navigate('/user');
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDelete = async (complaintId) => {
    try {
      await API.delete(`/complaints/${complaintId}`);
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint');
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

      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#FFD700' }}>Your Complaint Status</h2>

        {complaints.length === 0 ? (
          <p style={{ color: '#ccc' }}>No complaints found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
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

                  <button
                    onClick={() => toggleChat(c._id)}
                    style={{
                      marginTop: '10px',
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
                  <button
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'Red',
                      border: 'none',
                      padding: '8px 16px',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      float: 'right'
                    }}
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
                  </button>
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
