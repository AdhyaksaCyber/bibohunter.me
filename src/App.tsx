import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Pages - Public
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Pages - User
import DashboardPage from '@/pages/DashboardPage';
import MateriPage from '@/pages/MateriPage';
import MateriDetailPage from '@/pages/MateriDetailPage';
import TryoutListPage from '@/pages/TryoutListPage';
import TryoutDetailPage from '@/pages/TryoutDetailPage';
import ProfilePage from '@/pages/ProfilePage';

// Pages - Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminMateri from '@/pages/admin/AdminMateri';
import AdminTryout from '@/pages/admin/AdminTryout';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if user has valid token on app load
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout><DashboardPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/materi"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout><MateriPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/materi/:id"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout><MateriDetailPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tryout"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout><TryoutListPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tryout/:id"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout><TryoutDetailPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout><ProfilePage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
            <AdminLayout><AdminUsers /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materi"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
            <AdminLayout><AdminMateri /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tryout"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
            <AdminLayout><AdminTryout /></AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
