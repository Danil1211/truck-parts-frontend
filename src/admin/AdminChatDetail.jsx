import React, { useState, useEffect, useRef } from 'react';
import './AdminPanel.css';

function AdminChatDetail({ userId, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/chat/admin/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Ошибка загрузки чата:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const msg = {
      text: input,
      fromAdmin: true,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, msg]);
    setInput('');

    try {
      await fetch(`http://localhost:3000/api/chat/admin/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      });
    } catch (err) {
      console.error('Ошибка отправки:', err);
    }
  };

  return (
    <div className="admin-chat-detail">
      <h3>Диалог с {userName || 'пользователем'}</h3>
      <div className="admin-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.fromAdmin ? 'admin' : 'user'}`}>
            {msg.text && <span>{msg.text}</span>}
            {msg.imageUrls?.map((url, idx) => (
              <div className="chat-image-wrapper" key={idx}>
                <img src={`http://localhost:3000${url}`} alt="img" className="chat-image" />
              </div>
            ))}
            <div className="chat-time">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ответить..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
}

export default AdminChatDetail;
