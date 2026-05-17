import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await api.get('/materials');
      setMaterials(data);
      const prog = {};
      data.forEach(m => { prog[m.id] = false; });
      setProgress(prog);
    } catch (err) {
      console.error(err);
    }
  };

  const markComplete = async (materialId) => {
    await api.post(`/materials/${materialId}/progress`, { completed: true });
    setProgress({ ...progress, [materialId]: true });
  };

  return (
    <div>
      <div style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', padding: '0 28px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.55rem', color: 'var(--gold)' }}>Ultron Bimbel</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{user?.username}</span>
          <button onClick={logout} style={{ background: 'var(--red-bg)', border: '1.5px solid var(--red-b)', color: 'var(--red)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>Keluar</button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--navy), #1a3060)', borderRadius: '14px', padding: '32px 36px', marginBottom: '28px' }}>
          <h1 style={{ color: '#fff', fontSize: '1.85rem', fontFamily: 'Bebas Neue' }}>Halo, {user?.username}!</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)' }}>Selamat belajar — semangat menuju SKD lulus!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '22px 20px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{materials.length}</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>Materi Tersedia</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '22px 20px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{Object.values(progress).filter(v => v).length}</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>Selesai</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '22px 20px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>—</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>Skor Rata-rata</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1.5px solid var(--border)' }}>
            <div style={{ fontWeight: 900 }}>📚 Materi SKD</div>
          </div>
          <div style={{ padding: '20px 22px' }}>
            {materials.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', background: 'var(--bg2)', borderRadius: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{m.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{m.description}</div>
                </div>
                <div>
                  {progress[m.id] ? (
                    <span style={{ color: 'var(--green)' }}>✓ Selesai</span>
                  ) : (
                    <button onClick={() => markComplete(m.id)} style={{ padding: '6px 12px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Tandai Selesai</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
