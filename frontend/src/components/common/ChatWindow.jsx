import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/api';
import { getUser } from '../../utils/auth';

const ChatWindow = ({ complaintId, onClose }) => {
  const user = getUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);


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


  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const messageData = {
      complaintId,
      name: user?.name || 'User',
      message: input.trim(),
    };

    setSending(true);
    try {
      const res = await API.post('/messages', messageData);
      setMessages((prev) => [...prev, res.data.data]);
      setInput('');
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };


  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-modal" onClick={onClose}>
      <div className="chat-box" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h2>Chat</h2>
          <button onClick={onClose} aria-label="Close chat">✕</button>
        </div>
        <div className="chat-body">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={msg._id || idx} className="chat-message">
                <span className="sender">{msg.name}:</span>
                <span className="text"> {msg.message}</span>
                <div className="time">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            ))
          ) : (
            <p className="no-messages">No messages yet. Start the conversation!</p>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your message..."
            disabled={sending}
            maxLength={2000}
          />
          <button onClick={handleSend} disabled={sending || !input.trim()}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
