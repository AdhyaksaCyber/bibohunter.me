import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password, remember);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '22px', width: '100%', maxWidth: '400px', border: '1.5px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--gold)', textAlign: 'center', marginBottom: '8px' }}>Ultron Bimbel</h1>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '32px' }}>Admin Panel</p>

        {error && <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '12px', borderRadius: '9px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--muted)', marginBottom: '6px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '11px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px', color: 'var(--text)', outline: 'none' }}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--muted)', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px', color: 'var(--text)', outline: 'none' }}
              required
            />
          </div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted)' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ingat saya
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 900, cursor: 'pointer' }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
