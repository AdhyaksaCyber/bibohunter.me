import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
              <span className="font-bebas text-lg text-gold">UB</span>
            </div>
            <span className="font-bebas text-xl text-navy hidden sm:inline">Ultron</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-muted hover:text-gold transition font-semibold text-sm">
                  Dashboard
                </Link>
                <Link to="/materi" className="text-muted hover:text-gold transition font-semibold text-sm">
                  Materi
                </Link>
                <Link to="/tryout" className="text-muted hover:text-gold transition font-semibold text-sm">
                  Tryout
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-muted hover:text-gold transition font-semibold text-sm">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <a href="#keunggulan" className="text-muted hover:text-gold transition font-semibold text-sm">
                  Keunggulan
                </a>
                <a href="#alumni" className="text-muted hover:text-gold transition font-semibold text-sm">
                  Alumni
                </a>
                <a href="#mentor" className="text-muted hover:text-gold transition font-semibold text-sm">
                  Mentor
                </a>
              </>
            )}
          </div>

          {/* Auth Buttons / Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-sm font-semibold text-muted hover:text-gold transition">
                  {user?.fullName || user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-cream2 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut size={18} className="text-muted" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline px-6 py-2 font-bold rounded-lg border-2 border-border2 text-navy hover:border-gold hover:text-gold transition text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-gold to-gold-light text-white font-bold rounded-lg text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition"
                >
                  Daftar
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-navy hover:text-gold font-semibold py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/materi"
                  className="block text-navy hover:text-gold font-semibold py-2"
                >
                  Materi
                </Link>
                <Link
                  to="/tryout"
                  className="block text-navy hover:text-gold font-semibold py-2"
                >
                  Tryout
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-navy hover:text-gold font-semibold py-2"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 font-semibold py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="#keunggulan" className="block text-navy hover:text-gold font-semibold py-2">
                  Keunggulan
                </a>
                <a href="#alumni" className="block text-navy hover:text-gold font-semibold py-2">
                  Alumni
                </a>
                <a href="#mentor" className="block text-navy hover:text-gold font-semibold py-2">
                  Mentor
                </a>
                <Link
                  to="/login"
                  className="block text-navy hover:text-gold font-semibold py-2"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
