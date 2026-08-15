import React, { useEffect, useState } from 'react';
import {
  Search, MessageSquare, CheckCircle, Clock, User,
  MapPin, FileText, RotateCcw
} from 'lucide-react';
import FooterC from '../common/FooterC';
import ChatWindow from '../common/ChatWindow';
import './AgentHome.css';
import API from '../../api/api';

const AgentHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [userName] = useState(user?.name || 'Agent');
  const [agentId] = useState(user?._id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [agentComplaintList, setAgentComplaintList] = useState([]);

  useEffect(() => {
    if (!user || user.userType !== 'Agent') {
      window.location.href = '/';
    } else {
      fetchAssignedComplaints();
    }
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      const res = await API.get(`/admin/assigned/${agentId}`);
      setAgentComplaintList(res.data.data);
    } catch (err) {
      console.error('Failed to fetch assigned complaints', err);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await API.put(`/admin/status/${complaintId}`, { status: newStatus });
      setAgentComplaintList(prev =>
        prev.map(complaint =>
          complaint._id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const toggleStatus = (currentStatus) => {
    return currentStatus === 'Pending' ? 'In Progress' : 'Pending';
  };

  const filteredComplaints = agentComplaintList.filter(complaint => {
    const matchSearch =
      complaint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'all' || complaint.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="agent-home">
      <header className="agent-header">
        <div className="agent-brand">ComplaintCare</div>
        <div className="agent-user">
          <div className="user-info">
            <div className="avatar"><User size={14} /></div>
            <span>{userName}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="agent-main">
        <h1>Welcome Agent, {userName}</h1>
        <div className="agent-stats">
          {[
            { icon: <FileText />, label: 'Total Complaints', value: agentComplaintList.length },
            { icon: <Clock />, label: 'Pending', value: agentComplaintList.filter(c => c.status === 'Pending').length },
            { icon: <MessageSquare />, label: 'In Progress', value: agentComplaintList.filter(c => c.status === 'In Progress').length },
            { icon: <CheckCircle />, label: 'Resolved', value: agentComplaintList.filter(c => c.status === 'Resolved').length },
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
              placeholder="Search by name or complaint ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', background: 'white', color: 'black', border: '1px solid #ccc' }}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

        </div>

        <div className="complaint-grid">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className={`complaint-card status-${complaint.status?.toLowerCase()}`}
                style={complaint.status === 'Pending' ? { backgroundColor: 'black' } : {}}
              >
                <div className="complaint-header">
                  <div>
                    <h3>{complaint.name}</h3>
                    <p>ID: {complaint._id}</p>
                  </div>
                  <div className="status-badge">{complaint.status}</div>
                </div>
                <div className="complaint-location">
                  <MapPin size={14} />
                  <div>
                    <p>{complaint.address}</p>
                    <p>{complaint.city}, {complaint.state} {complaint.pincode}</p>
                  </div>
                </div>
                <p className="complaint-comment">{complaint.comment}</p>
                <div className="complaint-actions">
                  {complaint.status !== 'Resolved' && (
                    <>
                      <button
                        className="status-btn"
                        onClick={() => handleStatusChange(complaint._id, 'Pending')}
                      >
                        Set to Pending
                      </button>

                      <button
                        className="status-btn"
                        onClick={() => handleStatusChange(complaint._id, 'In Progress')}
                      >
                        In Progress
                      </button>

                      <button
                        className="resolve-btn"
                        onClick={() => handleStatusChange(complaint._id, 'Resolved')}
                      >
                        Mark as Completed
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelectedComplaintId(complaint._id)}>
                    <MessageSquare size={14} /> Chat
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-complaints-msg">
              <FileText size={40} />
              <p>No complaints are assigned at the moment.</p>
            </div>
          )}
        </div>
      </main>

      {selectedComplaintId && (
        <ChatWindow
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}
      <FooterC />
    </div>
  );
};

export default AgentHome;
