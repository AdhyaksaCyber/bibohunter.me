import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg)',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '1.5rem',
        color: 'var(--gold)',
        letterSpacing: '2px',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page — publik */}
      <Route path="/" element={<HomePage />} />

      {/* Login — redirect ke dashboard kalau sudah login */}
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />}
      />

      {/* Admin — hanya role admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Dashboard siswa — semua role yang sudah login */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={['admin', 'viewer', 'user', 'mentor']}>
            <UserDashboard />
          </PrivateRoute>
        }
      />

      {/* Catch-all → ke home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;