import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './ChatWindow.css';

// Анимация "печатает..."
function TypingAnimation() {
  const [dots, setDots] = useState("...");
  useEffect(() => {
    const arr = ["...", "..", ".", ""];
    let i = 0;
    const timer = setInterval(() => {
      setDots(arr[i % arr.length]);
      i++;
    }, 350);
    return () => clearInterval(timer);
  }, []);
  return <span style={{ marginLeft: 3 }}>{dots}</span>;
}

// Голосовые сообщения
const VoiceMessage = ({ url }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setCurrent(audio.currentTime);
    const loaded = () => setDuration(audio.duration || 0);
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', loaded);
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('loadedmetadata', loaded);
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const bar = e.target.closest('.voice-bar2');
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const audio = audioRef.current;
    if (audio) audio.currentTime = percent * duration;
  };

  const renderWave = () => (
    <svg height="32" width="100%" viewBox="0 0 110 32" style={{ display: 'block' }}>
      <polyline
        points="0,16 5,8 10,18 15,8 20,16 25,6 30,26 35,16 40,20 45,12 50,16 55,8 60,26 65,16 70,20 75,12 80,26 85,18 90,12 95,24 100,16 110,16"
        stroke="#189eff"
        strokeWidth="3"
        fill="none"
        opacity="0.75"
        filter="drop-shadow(0 1px 3px #189eff33)"
      />
    </svg>
  );

  function formatTime(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  return (
    <div className="voice-modern-container">
      <audio ref={audioRef} src={url} preload="auto" style={{ display: 'none' }} />
      <button className={`voice-modern-btn ${playing ? 'pause' : 'play'}`} onClick={handlePlayPause}>
        {playing
          ? (<svg width="20" height="20" viewBox="0 0 20 20"><rect x="4" y="4" width="4" height="12" rx="2"/><rect x="12" y="4" width="4" height="12" rx="2"/></svg>)
          : (<svg width="20" height="20" viewBox="0 0 20 20"><polygon points="5,3 17,10 5,17" /></svg>)
        }
      </button>
      <div className="voice-bar2" onClick={handleSeek}>
        <div className="voice-bar-bg" />
        <div className="voice-bar2-progress" style={{ width: duration ? `${(current / duration) * 100}%` : 0 }} />
        <div className="voice-modern-wave">{renderWave()}</div>
      </div>
      <span className="voice-modern-time">
        {formatTime(current)}<span style={{ opacity: 0.7, fontWeight: 400 }}> / {formatTime(duration)}</span>
      </span>
    </div>
  );
};

const ChatWindow = ({ onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('chatToken'));
  const [images, setImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [error, setError] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const mediaRecorder = useRef(null);
  const shouldScrollToBottom = useRef(true);

  // userId/userName из токена
  let userId = null, userName = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
      userName = payload.name;
    } catch (e) {}
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    shouldScrollToBottom.current = (scrollTop + clientHeight >= scrollHeight - 10);
  };

  // Получение сообщений (с обработкой 401)
  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chat/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('chatToken');
        setToken(null);
        setMessages([]);
        return;
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  useEffect(() => { fetchMessages(); }, [token]);
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (shouldScrollToBottom.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  // ПОЛУЧЕНИЕ СТАТУСА ПЕЧАТАЕТ ОТ АДМИНА (с обработкой 401)
  useEffect(() => {
    if (!token || !userId) return;
    let interval;
    const fetchTyping = async () => {
      try {
        const res = await fetch('/api/chat/typing/statuses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('chatToken');
          setToken(null);
          setAdminTyping(false);
          return;
        }
        const map = await res.json();
        if (map && map[userId] && map[userId].fromAdmin && map[userId].isTyping) {
          setAdminTyping(true);
        } else {
          setAdminTyping(false);
        }
      } catch {}
    };
    fetchTyping();
    interval = setInterval(fetchTyping, 1200);
    return () => clearInterval(interval);
  }, [token, userId]);

  // Авторизация клиента
  const handleStart = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Введите имя и телефон!');
      setTimeout(() => setError(''), 2000);
      return;
    }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка авторизации');
      localStorage.setItem('chatToken', data.token);
      setToken(data.token);
    } catch (err) {
      setError('Ошибка входа в чат');
      setTimeout(() => setError(''), 2000);
    }
  };

  // === ОТПРАВКА СТАТУСА "ПЕЧАТАЕТ" ===
  function handleInput(e) {
    setMessage(e.target.value);
    if (!userId || !userName) return;
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        isTyping: !!e.target.value,
        name: userName,
        fromAdmin: false
      }),
    });
  }

  // Отправка сообщения
  const handleSend = async () => {
    if (!message.trim() && images.length === 0 && audioChunks.length === 0) return;

    const formData = new FormData();
    formData.append('text', message);

    images.forEach((img) => formData.append('images', img));
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      formData.append('audio', audioBlob);
    }

    if (!token) {
      formData.append('name', name);
      formData.append('phone', phone);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки сообщения');
      setMessage('');
      setImages([]);
      setAudioChunks([]);
      setShowEmoji(false);
      fetchMessages();
    } catch (err) {
      setError('Ошибка отправки сообщения');
      setTimeout(() => setError(''), 2000);
    }

    // Сбросить печатает
    if (userId && userName) {
      fetch('/api/chat/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          isTyping: false,
          name: userName,
          fromAdmin: false
        }),
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      setError('Максимум 3 изображения');
      setTimeout(() => setError(''), 2000);
      return;
    }
    setImages([...images, ...files]);
  };

  const handleEmojiClick = (emojiData) => setMessage((prev) => prev + emojiData.emoji);

  // Voice
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      setError('Браузер не поддерживает запись');
      setTimeout(() => setError(''), 2000);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setAudioChunks([]);
      mediaRecorder.current = recorder;
      recorder.ondataavailable = (e) => setAudioChunks((prev) => [...prev, e.data]);
      recorder.onstop = () => {};
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError('Не удалось начать запись');
      setTimeout(() => setError(''), 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-window" ref={chatRef}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-title">Чат с менеджером</div>
            <div className="chat-status online">Анна • Онлайн</div>
          </div>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>
        {!token ? (
          <div style={{ padding: 16 }}>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Телефон"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button className="chat-start-button" onClick={handleStart}>Начать</button>
            {error && <div className="chat-error">{error}</div>}
          </div>
        ) : (
          <>
            <div className="chat-messages" onScroll={handleScroll}>
              {messages.length === 0
                ? <p className="no-messages">Нет сообщений</p>
                : messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`chat-message ${msg.fromAdmin ? 'admin' : 'you'}`}
                  >
                    <div className="chat-bubble">
                      <div style={{
                        fontSize: 13,
                        marginBottom: 2,
                        color: '#888',
                        fontWeight: 500
                      }}>
                        {msg.fromAdmin ? 'Админ' : 'Вы'}
                      </div>
                      {msg.text && <div>{msg.text}</div>}
                      {msg.imageUrls?.length > 0 && msg.imageUrls.map((url, i) => (
                        <div className="chat-image-wrapper" key={i}>
                          <img
                            src={`http://localhost:3000${url}`}
                            alt="attachment"
                            className="chat-image"
                          />
                        </div>
                      ))}
                      {msg.audioUrl &&
                        <VoiceMessage url={`http://localhost:3000${msg.audioUrl}`} />
                      }
                    </div>
                    <div className="chat-time">
                      {msg.createdAt &&
                        new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </div>
                  </div>
                ))}
              {adminTyping && (
                <div
                  style={{
                    display: 'inline-block',
                    background: '#eaf4ff',
                    borderRadius: 14,
                    padding: '6px 18px',
                    margin: '8px 0 8px 4px',
                    color: '#189eff',
                    fontWeight: 500,
                    fontSize: 15,
                    boxShadow: '0 1px 6px #189eff12',
                    maxWidth: 220,
                  }}
                >
                  Менеджер печатает
                  <TypingAnimation />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <div className="chat-input-top">
                <input
                  type="text"
                  className="chat-text-input"
                  placeholder="Напишите свое сообщение..."
                  value={message}
                  onChange={handleInput}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button className="chat-send-button" onClick={handleSend}>➤</button>
              </div>
              {images.length > 0 && (
                <div className="chat-images-preview">
                  {images.map((img, idx) => (
                    <div key={idx} className="chat-preview-wrapper">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`preview-${idx}`}
                        className="chat-preview-image"
                      />
                    </div>
                  ))}
                </div>
              )}
              {error && <div className="chat-error">{error}</div>}
              <div className="chat-input-icons">
                <span
                  className="chat-icon"
                  title="Эмодзи"
                  onClick={() => setShowEmoji(!showEmoji)}
                >😊</span>
                <label className="chat-icon" title="Прикрепить файл">
                  📎
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="chat-file"
                  />
                </label>
                <span
                  className={`chat-icon ${isRecording ? 'recording' : ''}`}
                  title={isRecording ? 'Остановить запись' : 'Начать запись'}
                  onClick={isRecording ? stopRecording : startRecording}
                >🎤</span>
              </div>
              {showEmoji && (
                <div className="emoji-picker-wrapper">
                  <EmojiPicker
                    theme="light"
                    onEmojiClick={handleEmojiClick}
                    height={300}
                    width={280}
                    searchDisabled={true}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled={true}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
