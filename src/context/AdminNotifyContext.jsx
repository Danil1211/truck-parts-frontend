import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

// Badge для иконки чата
export function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span
      style={{
        background: "#f43f5e",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        borderRadius: "10px",
        padding: "1px 7px",
        marginLeft: 8,
        minWidth: 18,
        display: "inline-block",
        textAlign: "center",
        lineHeight: "20px",
        verticalAlign: "middle",
        boxShadow: "0 1px 5px #0002",
      }}
    >
      {count}
    </span>
  );
}

// Toast уведомление (как Telegram)
function Toast({ message, onClose }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHide(true), 2600);
    const close = setTimeout(() => onClose(), 3200);
    return () => {
      clearTimeout(timer);
      clearTimeout(close);
    };
  }, [onClose]);
  return (
    <div className={`tg-toast${hide ? " hide" : ""}`} onClick={onClose} tabIndex={0}>
      <span className="tg-toast-icon">💬</span>
      <span className="tg-toast-text">{message}</span>
      <style>{`
        .tg-toast {
          background: rgba(30,41,59,0.96);
          color: #fff;
          font-size: 16px;
          padding: 14px 28px 14px 18px;
          border-radius: 14px;
          box-shadow: 0 8px 36px #09142829, 0 1.5px 8px #1113;
          display: flex; align-items: center;
          min-width: 210px; max-width: 400px;
          cursor: pointer;
          animation: tgtoast-in 0.32s cubic-bezier(.8,1.5,.9,1) both;
          opacity: 1; transition: opacity .3s, transform .5s;
          margin-bottom: 8px;
        }
        .tg-toast.hide { opacity: 0; transform: translateY(-10px) scale(0.96); }
        .tg-toast-icon { font-size: 21px; margin-right: 12px; }
        @keyframes tgtoast-in { from {opacity:0;transform:translateY(-16px) scale(.93);} to {opacity:1;transform:translateY(0) scale(1);} }
      `}</style>
    </div>
  );
}

const AdminNotifyContext = createContext();

export function useAdminNotify() {
  return useContext(AdminNotifyContext);
}

export function AdminNotifyProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [unread, setUnread] = useState({}); // {userId: 1}
  const [lastUnreadChat, setLastUnreadChat] = useState(null);
  const audioRef = useRef();

  // Храним предыдущие чаты и ID последних сообщений для сравнения
  const prevChatsRef = useRef([]);
  const lastNotifiedMsgRef = useRef({});

  // Флаг, чтобы не показывать уведомления при первой загрузке
  const firstLoadRef = useRef(true);

  // --- Polling новых сообщений
  useEffect(() => {
    async function poll() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/chat/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const chats = Array.isArray(data)
          ? data.map((c) => ({
              ...c,
              lastMessageObj: c.lastMessage,
            }))
          : [];

        console.log("[AdminNotify] Чаты с сервера:", chats);

        // Если первая загрузка — просто обновим последний id сообщений, без уведомлений
        if (firstLoadRef.current) {
          chats.forEach((chat) => {
            if (
              chat.lastMessageObj &&
              !chat.lastMessageObj.fromAdmin &&
              !chat.lastMessageObj.read
            ) {
              lastNotifiedMsgRef.current[chat.userId] = chat.lastMessageObj._id;
            }
          });
          prevChatsRef.current = chats;
          firstLoadRef.current = false;
          console.log("[AdminNotify] Первая загрузка - уведомления не показываем");
          return; // не показываем уведомления при первом запросе
        }

        // Проверяем на новые сообщения и показываем уведомления
        chats.forEach((chat) => {
          if (
            chat.lastMessageObj &&
            !chat.lastMessageObj.fromAdmin &&
            !chat.lastMessageObj.read
          ) {
            const prevId = lastNotifiedMsgRef.current[chat.userId];
            // Если новое сообщение (ID отличается)
            if (prevId !== chat.lastMessageObj._id) {
              notify(`Новое сообщение от ${chat.name || chat.phone || "клиента"}`);
              incrementUnread(chat.userId);
              setLastUnreadChat(chat.userId);
              lastNotifiedMsgRef.current[chat.userId] = chat.lastMessageObj._id;
              console.log(`[AdminNotify] Уведомление: новое сообщение от ${chat.name || chat.phone}`);
            }
          }
        });

        prevChatsRef.current = chats;

        // Обновляем глобальный объект непрочитанных сообщений
        let unreadObj = {};
        chats.forEach((chat) => {
          if (
            chat.lastMessageObj &&
            !chat.lastMessageObj.fromAdmin &&
            !chat.lastMessageObj.read
          ) {
            unreadObj[chat.userId] = 1;
          }
        });
        setUnread(unreadObj);
      } catch (e) {
        console.error("[AdminNotify] Ошибка polling:", e);
      }
    }

    poll();
    const interval = setInterval(poll, 3500);
    return () => clearInterval(interval);
  }, []);

  // --- Звук + toast
  const notify = useCallback((msg) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), msg }]);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        audioRef.current.play();
      } catch {}
    }
  }, []);

  // --- Счётчик ---
  const incrementUnread = useCallback((userId) => {
    setUnread((u) => ({ ...u, [userId]: 1 }));
  }, []);
  const resetUnread = useCallback((userId) => {
    setUnread((u) => {
      const nu = { ...u };
      delete nu[userId];
      return nu;
    });
    sessionStorage.setItem("admin-selected-user", userId);
    setLastUnreadChat(null);
  }, []);

  // --- Общий счётчик ---
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <AdminNotifyContext.Provider
      value={{
        notify,
        incrementUnread,
        resetUnread,
        unread,
        totalUnread,
        lastUnreadChat,
      }}
    >
      {children}
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />
      <div style={{ position: "fixed", top: 32, right: 32, zIndex: 10000 }}>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.msg} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </AdminNotifyContext.Provider>
  );
}
