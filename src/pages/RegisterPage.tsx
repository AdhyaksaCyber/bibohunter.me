import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="bg-white border-2 border-border rounded-2xl p-12 shadow-lg">
      <h1 className="font-bebas text-3xl text-navy mb-4">Daftar</h1>
      <p className="text-muted mb-6">Halaman registrasi akan diimplementasikan</p>
      <Link to="/login" className="text-gold hover:text-gold-light">← Kembali ke login</Link>
    </div>
  );
};
export default RegisterPage;
