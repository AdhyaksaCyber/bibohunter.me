import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.get('/materials');
      setMaterials(data || []);
    } catch (err) {
      setError('Gagal memuat materi. Coba refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAVBAR */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1.5px solid var(--border)',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: 'var(--gold)' }}>
            Ultron Bimbel
          </span>
          <span style={{
            background: 'var(--gold-pale)',
            color: 'var(--gold)',
            padding: '2px 10px',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Siswa
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
            Hai, {user?.fullName || user?.username || 'Siswa'} 👋
          </span>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '0.8rem',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseOver={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
            onMouseOut={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px' }}>

        {/* WELCOME CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #0b1730, #152044)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(168, 96, 14, 0.12)',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Selamat datang kembali
          </p>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#fff', letterSpacing: '1px', marginBottom: '8px' }}>
            {user?.fullName || user?.username || 'Siswa'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
            Terus semangat belajar. Satu langkah lebih dekat ke CPNS impian kamu! 🎯
          </p>
        </div>

        {/* MATERI SECTION */}
        <div>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '1px', marginBottom: '20px' }}>
            Materi Belajar
          </h3>

          {error && (
            <div style={{
              background: 'var(--red-bg)',
              color: 'var(--red)',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: 'var(--surface)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1.5px solid var(--border)',
                  animation: 'pulse 1.5s infinite',
                  height: '120px',
                }} />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Belum ada materi tersedia. Hubungi admin untuk informasi lebih lanjut.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {materials.map(mat => (
                <div
                  key={mat.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '16px',
                    padding: '22px',
                    transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    background: 'var(--gold-pale)',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                    fontSize: '1.2rem',
                  }}>
                    {mat.type === 'video' ? '🎬' : mat.type === 'pdf' ? '📄' : '📖'}
                  </div>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--text)',
                    marginBottom: '6px',
                    lineHeight: 1.4,
                  }}>
                    {mat.title || mat.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    {mat.description || mat.category || 'Materi SKD'}
                  </p>
                  {mat.url && (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '14px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: 'var(--gold)',
                        textDecoration: 'none',
                      }}
                    >
                      Buka Materi →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
