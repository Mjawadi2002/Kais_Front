import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ClientDashboard from './pages/client/ClientDashboard';
import AddProduct from './pages/client/AddProduct';
import MyProducts from './pages/client/MyProducts';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AssignedDeliveries from './pages/delivery/AssignedDeliveries';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

function ProtectedRoute({ children, roles }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted">Checking authentication...</div>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AdminProducts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/*"
            element={
              <ProtectedRoute roles={["client"]}>
                <Layout>
                  <ClientDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/add-product"
            element={
              <ProtectedRoute roles={["client"]}>
                <Layout>
                  <AddProduct />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/products"
            element={
              <ProtectedRoute roles={["client"]}>
                <Layout>
                  <MyProducts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/*"
            element={
              <ProtectedRoute roles={["delivery"]}>
                <Layout>
                  <DeliveryDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/assigned"
            element={
              <ProtectedRoute roles={["delivery"]}>
                <Layout>
                  <AssignedDeliveries />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
