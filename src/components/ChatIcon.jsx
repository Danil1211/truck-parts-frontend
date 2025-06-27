import React from 'react';
import './ChatIcon.css';

function ChatIcon({ hasUnread, onClick }) {
  return (
    <div className="chat-icon-container" onClick={onClick}>
      <div className="chat-launch-icon">💬</div>
      {hasUnread && <div className="chat-notification" />}
    </div>
  );
}

export default ChatIcon;
