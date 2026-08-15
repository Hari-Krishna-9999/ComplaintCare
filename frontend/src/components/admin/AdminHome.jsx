import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import FooterC from '../common/FooterC';
import './AdminHome.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState({});
  const [assignedMap, setAssignedMap] = useState({});

  useEffect(() => {
    const fetchAdmin = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userType === "Admin") {
        setUserName(user.name);
      } else {
        navigate('/');
      }
    };
    fetchAdmin();
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [complaintRes, agentRes, userRes] = await Promise.all([
        API.get('/complaints'),
        API.get('/admin/agents'),
        API.get('/admin/users'),
      ]);
      setComplaints(complaintRes.data.data);
      setAgents(agentRes.data.data);
      setUsers(userRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const assignComplaint = async (complaintId) => {
    const agentId = selectedAgent[complaintId];
    const agentObj = agents.find(a => a._id === agentId);
    if (!agentId || !agentObj) return alert("Please select an agent");

    try {
      await API.post('/admin/assign', {
        agentId,
        complaintId,
        status: "Assigned",
        agentName: agentObj.name
      });

      setAssignedMap(prev => ({
        ...prev,
        [complaintId]: agentObj.name
      }));

      alert(`✅ Assigned complaint to ${agentObj.name}`);
      fetchAllData();
    } catch (err) {
      console.error('Assignment error:', err);
      alert(err.response?.data?.message || '❌ Failed to assign complaint.');
    }
  };

  const LogOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <header className="admin-header">
        <div className="admin-brand">Welcome Admin, {userName}</div>
        <nav className="admin-nav">
          <button
            className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'agents' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('agents')}
          >
            Agents
          </button>
        </nav>
        <button className="logout-btn" onClick={LogOut}>Log Out</button>
      </header>

      <div className="admin-content">
        <h2 className="section-title">
          {activeTab === 'dashboard' && 'Dashboard'}
          {activeTab === 'users' && 'Users'}
          {activeTab === 'agents' && 'Agents'}
        </h2>

        {activeTab === 'dashboard' && (
          <div className="complaint-list">
            {complaints.length > 0 ? (
              complaints.map((c) => (
                <div key={c._id} className="complaint-item">
                  <p><strong>Name:</strong> {c.name}</p>
                  <p><strong>Address:</strong> {c.address}</p>
                  <p><strong>City:</strong> {c.city}</p>
                  <p><strong>State:</strong> {c.state}</p>
                  <p><strong>Pincode:</strong> {c.pincode}</p>
                  <p><strong>Status:</strong> <span style={{ color: '#FFD700' }}>{c.status}</span></p>

                  {c.status !== 'Resolved' && (
                    <div style={{ marginTop: '10px' }}>
                      {assignedMap[c._id] ? (
                        <p style={{ color: '#00ff00', fontWeight: 'bold' }}>
                          ✅ Assigned to {assignedMap[c._id]}
                        </p>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <select
                            value={selectedAgent[c._id] || ''}
                            onChange={(e) => setSelectedAgent({ ...selectedAgent, [c._id]: e.target.value })}
                            className="complaint-status"
                          >
                            <option value="">-- Select Agent --</option>
                            {agents.map((agent) => (
                              <option key={agent._id} value={agent._id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>

                          <button
                            className="new-complaint-btn"
                            onClick={() => assignComplaint(c._id)}
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#ccc' }}>No complaints to show.</p>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="user-stats">
            {users.length > 0 ? users.map((user) => (
              <div key={user._id} className="stat-card">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Type:</strong> {user.userType}</p>
              </div>
            )) : (
              <p style={{ color: '#aaa' }}>No users found.</p>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="user-stats">
            {agents.length > 0 ? agents.map((agent) => (
              <div key={agent._id} className="stat-card">
                <p><strong>Name:</strong> {agent.name}</p>
                <p><strong>Email:</strong> {agent.email}</p>
              </div>
            )) : (
              <p style={{ color: '#aaa' }}>No agents found.</p>
            )}
          </div>
        )}
      </div>

      <FooterC />
    </>
  );
};

export default AdminHome;
