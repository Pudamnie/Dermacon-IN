import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });
      
      const { user, access_token } = res.data;
      
      if (user.role !== 'admin') {
        alert('Access denied. You are not an administrator.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('adminToken', access_token);
      window.location.href = '/';
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ShieldCheck size={64} color="#3B82F6" />
        </div>
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-subtitle">Welcome back! Please sign in.</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
              <input 
                type="email" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="admin@skincare.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
              <input 
                type="password" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
