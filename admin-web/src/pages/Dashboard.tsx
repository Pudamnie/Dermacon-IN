import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:8000/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.detail || "Failed to fetch analytics. Please check your connection or log in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="main-content">Loading analytics...</div>;

  if (error) {
    return (
      <div className="main-content">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Activity size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h3>Error Loading Dashboard</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={fetchStats}>Try Again</button>
            <button className="btn" onClick={() => { localStorage.removeItem('adminToken'); window.location.reload(); }}>Log Out</button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="main-content">No data available.</div>;

  const chartData = [
    { name: 'Mon', reports: 12, users: 4 },
    { name: 'Tue', reports: 19, users: 7 },
    { name: 'Wed', reports: 15, users: 5 },
    { name: 'Thu', reports: 22, users: 10 },
    { name: 'Fri', reports: 30, users: 12 },
    { name: 'Sat', reports: 25, users: 15 },
    { name: 'Sun', reports: 32, users: 18 },
  ];

  return (
    <main className="main-content">
      <header className="header">
        <h1 className="page-title">Analytics Overview</h1>
        <div className="btn btn-primary">
          <Activity size={18} />
          <span>Real-time Status</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div style={{ color: 'var(--success)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            <TrendingUp size={12} inline /> +{stats.recentGrowth} this week
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Reports</div>
          <div className="stat-value">{stats.totalReports}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pharmacy Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">Rs. {stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Growth Trends</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card chart-card">
          <h3 style={{ marginBottom: '1.5rem' }}>User Distribution</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { role: 'Patients', count: stats.totalPatients },
                { role: 'Doctors', count: stats.totalDoctors },
                { role: 'Pharmacies', count: stats.totalPharmacies }
              ]}>
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
