import React, { useState, useEffect } from 'react';
import API from '../../api/api';
// Optional: for styling

const ChatWindow = ({ complaintId, onClose }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${complaintId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [complaintId]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const messageData = {
      complaintId,
      name: user.name,
      message: input,
      timestamp:new Date().toISOString()
    };


    try {
      const res = await API.post('/messages', messageData);
      setMessages((prev) => [...prev, res.data.data]);
      setInput('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-modal">
      <div className="chat-box">
        <div className="chat-header">
          <h2>Chat - {complaintId}</h2>
          <button onClick={onClose}>X</button>
        </div>
        <div className="chat-body">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="chat-message">
                <strong>{msg.name}:</strong> {msg.message}
                <div className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</div>

              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
