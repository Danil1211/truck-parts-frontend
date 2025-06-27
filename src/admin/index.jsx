import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminOrdersPage from './AdminOrdersPage';
import AdminChatPage from './AdminChatPage';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="chat"   element={<AdminChatPage />} />
      </Route>
    </Routes>
  );
}
