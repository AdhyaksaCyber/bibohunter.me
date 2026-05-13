import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'user', active: true });
  const [stats, setStats] = useState({ total: 0, active: 0, admin: 0, inactive: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, logsData, materialsData] = await Promise.all([
        api.get('/users'),
        api.get('/logs'),
        api.get('/materials')
      ]);
      setUsers(usersData);
      setLogs(logsData.slice(0, 50));
      setMaterials(materialsData);

      const total = usersData.length;
      const active = usersData.filter(u => u.active).length;
      const admin = usersData.filter(u => u.role === 'admin').length;
      const inactive = total - active;
      setStats({ total, active, admin, inactive });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, form);
      } else {
        await api.post('/users', form);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setForm({ name: '', username: '', password: '', role: 'user', active: true });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Hapus user ini?')) {
      await api.delete(`/users/${id}`);
      loadData();
    }
  };

  const handleToggleStatus = async (id, currentActive) => {
    await api.put(`/users/${id}`, { active: !currentActive });
    loadData();
  };

  const handleClearLogs = async () => {
    if (confirm('Hapus semua log?')) {
      await api.delete('/logs');
      loadData();
    }
  };

  return (
    <div>
      <div style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', padding: '0 22px', height: '59px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: 'var(--gold)' }}>Ultron</span>
          <span style={{ background: 'var(--gold-pale)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.67rem', fontWeight: 900 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{user?.username}</span>
          <button onClick={logout} style={{ background: 'var(--red-bg)', border: '1.5px solid var(--red-b)', color: 'var(--red)', padding: '6px 13px', borderRadius: '9px', cursor: 'pointer' }}>Keluar</button>
        </div>
      </div>

      <div style={{ padding: '26px 22px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '22px' }}>Admin Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '26px' }}>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800 }}>{stats.total}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Total User</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800 }}>{stats.active}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>User Aktif</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800 }}>{stats.admin}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Admin</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800 }}>{stats.inactive}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Nonaktif</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', marginBottom: '26px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 900 }}>Kelola User</div>
            <button onClick={() => { setEditingUser(null); setForm({ name: '', username: '', password: '', role: 'user', active: true }); setShowUserModal(true); }} style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '9px', cursor: 'pointer' }}>+ Tambah User</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)' }}>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Nama</th>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Username</th>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Role</th>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Status</th>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 17px' }}>{u.name}</td>
                    <td style={{ padding: '12px 17px' }}>{u.username}</td>
                    <td style={{ padding: '12px 17px' }}>{u.role}</td>
                    <td style={{ padding: '12px 17px' }}><span style={{ background: u.active ? 'var(--green-bg)' : 'var(--red-bg)', color: u.active ? 'var(--green)' : 'var(--red)', padding: '3px 11px', borderRadius: '20px', fontSize: '0.7rem' }}>{u.active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td style={{ padding: '12px 17px' }}>
                      <button onClick={() => { setEditingUser(u); setForm({ name: u.name, username: u.username, password: '', role: u.role, active: u.active }); setShowUserModal(true); }} style={{ marginRight: '8px', padding: '5px 9px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleToggleStatus(u.id, u.active)} style={{ marginRight: '8px', padding: '5px 9px', cursor: 'pointer' }}>{u.active ? 'Nonaktif' : 'Aktifkan'}</button>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '5px 9px', cursor: 'pointer' }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 900 }}>Log Keamanan</div>
            <button onClick={handleClearLogs} style={{ padding: '5px 12px', cursor: 'pointer' }}>Hapus Log</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)' }}>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Waktu</th>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Aksi</th>
                  <th style={{ padding: '10px 17px', textAlign: 'left', fontSize: '0.7rem' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 17px', fontSize: '0.87rem' }}>{log.time}</td>
                    <td style={{ padding: '12px 17px', fontSize: '0.87rem' }}>{log.action}</td>
                    <td style={{ padding: '12px 17px', fontSize: '0.87rem' }}>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '34px 30px', width: '100%', maxWidth: '450px' }}>
            <h2>{editingUser ? 'Edit User' : 'Tambah User'}</h2>
            <div style={{ marginBottom: '14px' }}>
              <label>Nama Lengkap</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Username</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Password {editingUser && '(kosongkan jika tidak diubah)'}</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px' }}>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                Aktif
              </label>
            </div>
            <div style={{ display: 'flex', gap: '9px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowUserModal(false)} style={{ padding: '8px 16px' }}>Batal</button>
              <button onClick={handleSaveUser} style={{ background: 'var(--gold)', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '9px', cursor: 'pointer' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
