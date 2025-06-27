import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminNotify } from "../context/AdminNotifyContext";
import "./AdminPanel.css";

// Улучшенный компонент уведомления с пульсацией и количеством
function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="notification-badge">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const { totalUnread } = useAdminNotify();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="admin-name">{user?.name}</div>
        </div>
        <nav className="admin-menu">
          <Link
            to="/admin/orders"
            className={location.pathname.includes("orders") ? "active" : ""}
            title="Заказы"
          >
            📦
          </Link>
          <Link
            to="/admin/chat"
            className={location.pathname.includes("chat") ? "active" : ""}
            title="Чат"
            style={{ position: "relative" }}
          >
            💬
            <UnreadBadge count={totalUnread} />
          </Link>
        </nav>
        <div className="admin-footer">
          <a
            className="go-to-site"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Перейти на сайт"
          >
            🌐
          </a>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
