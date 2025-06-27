import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./assets/style.css";

import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import ThanksPage from "./pages/ThanksPage";

import PrivateRoute from "./components/PrivateRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import AdminLayout from "./admin/AdminLayout";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import AdminChatPage from "./admin/AdminChatPage";
import { AdminNotifyProvider } from "./context/AdminNotifyContext";

// (Если ChatWidget на клиенте нужен — не убирай)
import ChatIcon from "./components/ChatIcon";
import ChatWindow from "./components/ChatWindow";

function ChatWidget() {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(false);
  return (
    <>
      {!chatOpen && <ChatIcon hasUnread={hasUnread} onClick={() => setChatOpen(true)} />}
      {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} />}
    </>
  );
}

function ChatWidgetWrapper() {
  const location = window.location;
  // Если у тебя используется useLocation — замени на хук из react-router-dom
  if (location.pathname.startsWith('/admin')) return null;
  return <ChatWidget />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <Router>
          <ChatWidgetWrapper />
          <Routes>
            {/* Клиентские страницы */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              }
            />
            <Route path="/thanks" element={<ThanksPage />} />

            {/* Админка */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminNotifyProvider>
                    <AdminLayout />
                  </AdminNotifyProvider>
                </PrivateRoute>
              }
            >
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="chat" element={<AdminChatPage />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
