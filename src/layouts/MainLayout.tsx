import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TawkChat from '@/components/TawkChat';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <main className="flex-1 relative z-10">
        {children}
      </main>

      <Footer />

      {/* Chatbot */}
      <TawkChat />
    </div>
  );
};

export default MainLayout;
