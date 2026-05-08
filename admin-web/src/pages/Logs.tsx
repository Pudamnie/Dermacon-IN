import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, UserPlus, ShoppingCart, Clock } from 'lucide-react';

const LogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:8000/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTRATION': return <UserPlus size={18} color="#3B82F6" />;
      case 'REPORT_CREATED': return <ShieldAlert size={18} color="#F59E0B" />;
      case 'ORDER_PLACED': return <ShoppingCart size={18} color="#10B981" />;
      default: return <Activity size={18} />;
    }
  };

  return (
    <main className="main-content">
      <header className="header">
        <div>
          <h1 className="page-title">System Health & Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time stream of system-wide activities</p>
        </div>
        <button className="btn btn-primary" onClick={fetchLogs}>
          <Clock size={18} />
          <span>Refresh Logs</span>
        </button>
      </header>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Activity Description</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Streaming logs...</td></tr>
              ) : logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                      {getIcon(log.type)}
                      <span style={{ fontSize: '0.75rem' }}>{log.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td>{log.message}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className={`status-pill status-${log.severity}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default LogsPage;
