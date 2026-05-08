import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, ShieldCheck, LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <ShieldCheck size={32} color="#3B82F6" />
        <span>Admin Panel</span>
      </div>
      
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>User Control</span>
        </NavLink>
        
        <NavLink to="/system" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={20} />
          <span>System Logs</span>
        </NavLink>
      </nav>
      
      <div style={{ marginTop: 'auto' }}>
        <button 
          onClick={() => { localStorage.removeItem('adminToken'); window.location.href = '/login'; }}
          className="nav-item" 
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
