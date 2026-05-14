import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-bebas text-xl text-navy">Admin Panel</h2>
        <p className="text-xs text-muted">
          Selamat datang, {user?.fullName || user?.username}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="p-2 hover:bg-cream rounded-lg transition relative">
          <Bell size={20} className="text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-cream rounded-lg transition">
          <Settings size={20} className="text-muted" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-cream rounded-lg transition text-red-600 hover:text-red-700"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
