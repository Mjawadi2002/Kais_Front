import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ManageDeliveries from './pages/admin/ManageDeliveries';
import ClientDashboard from './pages/client/ClientDashboard';
import AddProduct from './pages/client/AddProduct';
import MyProducts from './pages/client/MyProducts';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AssignedDeliveries from './pages/delivery/AssignedDeliveries';
import SettingsPanel from './components/SettingsPanel';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/layout/Layout';

import './i18n';

function ProtectedRoute({ children, roles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Checking authentication...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              toastClassName="!rounded-xl !shadow-lg !text-sm"
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/*" element={
                <ProtectedRoute roles={["admin"]}>
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute roles={["admin"]}>
                  <Layout><AdminProducts /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/deliveries" element={
                <ProtectedRoute roles={["admin"]}>
                  <Layout><ManageDeliveries /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/client/*" element={
                <ProtectedRoute roles={["client"]}>
                  <Layout><ClientDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/client/add-product" element={
                <ProtectedRoute roles={["client"]}>
                  <Layout><AddProduct /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/client/products" element={
                <ProtectedRoute roles={["client"]}>
                  <Layout><MyProducts /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/delivery/*" element={
                <ProtectedRoute roles={["delivery"]}>
                  <Layout><DeliveryDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/delivery/assigned" element={
                <ProtectedRoute roles={["delivery"]}>
                  <Layout><AssignedDeliveries /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute roles={["admin", "client", "delivery"]}>
                  <Layout><SettingsPanel /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
