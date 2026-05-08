import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Shield, UserX, UserCheck, Search, Filter } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.detail || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:8000/api/admin/users/${userId}?is_active=${!currentStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user permanently?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
      <header className="header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all roles and permissions</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} />
            <input
              style={{ paddingLeft: '2.5rem', width: 300 }}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </header>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}>Loading users...</td></tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button className="btn btn-primary" onClick={fetchUsers}>Retry</button>
                      <button className="btn" onClick={() => { localStorage.removeItem('adminToken'); window.location.reload(); }}>Log Out</button>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5}>No users found.</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn"
                        style={{ padding: 8, background: '#F1F5F9' }}
                        onClick={() => handleToggleStatus(user._id, user.is_active)}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <UserX size={16} color="#EF4444" /> : <UserCheck size={16} color="#10B981" />}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: 8 }}
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
    </main >
  );
};

export default UsersPage;
