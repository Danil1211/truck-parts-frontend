import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatIcon from './ChatIcon';

function ChatOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div style={{ position: 'fixed', bottom: '100px', right: '30px', zIndex: 1000 }}>
          <ChatWindow onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <ChatIcon hasUnread={true} onClick={() => setOpen(true)} />
      )}
    </>
  );
}

export default ChatOverlay;
