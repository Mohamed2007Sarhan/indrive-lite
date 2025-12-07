import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import GlassCard from '../../components/UI/GlassCard';
import AnimatedLayout from '../../components/UI/AnimatedLayout';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: [], rides: [], reports: [] });
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, rides
    const [loading, setLoading] = useState(false);

    const loadStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 5000); // Live updates
        return () => clearInterval(interval);
    }, []);

    const toggleUserStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus ? 0 : 1;
            await api.put(`/admin/users/${id}/status`, { is_active: newStatus });
            loadStats();
        } catch (e) { alert('Error updating status'); }
    };

    // Sidebar Component
    const Sidebar = () => (
        <GlassCard style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', borderRadius: '20px 0 0 20px' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '20px' }}>Admin Panel</h2>
            {['Overview', 'Users', 'Rides'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    style={{
                        background: activeTab === tab.toLowerCase() ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === tab.toLowerCase() ? 'black' : 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        transition: '0.3s'
                    }}
                >
                    {tab}
                </button>
            ))}
        </GlassCard>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', padding: '20px', gap: '20px', background: '#0f0f11', color: 'white' }}>
            <Sidebar />

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <AnimatedLayout>
                    <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <button className="btn-secondary" onClick={loadStats}>↻ Refresh</button>
                    </header>

                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <GlassCard>
                                <h3>Total Users</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.users.length}</p>
                            </GlassCard>
                            <GlassCard>
                                <h3>Total Rides</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{stats.rides.length}</p>
                            </GlassCard>
                            <GlassCard>
                                <h3>Reports</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.reports.length}</p>
                            </GlassCard>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <GlassCard>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}>Name</th>
                                        <th>Role</th>
                                        <th>Phone</th>
                                        <th>National ID</th>
                                        <th>Image</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px' }}>{u.name}</td>
                                            <td><span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: u.role === 'admin' ? 'red' : u.role === 'driver' ? '#fbbf24' : '#3b82f6',
                                                color: 'black', fontWeight: 'bold', fontSize: '0.8rem'
                                            }}>{u.role.toUpperCase()}</span></td>
                                            <td>{u.phone}</td>
                                            <td>{u.national_id || 'N/A'}</td>
                                            <td>
                                                {u.national_id_image ? (
                                                    <a href={`http://localhost:3000/uploads/${u.national_id_image}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View</a>
                                                ) : '-'}
                                            </td>
                                            <td>{u.is_active ? <span style={{ color: 'var(--success)' }}>Active</span> : <span style={{ color: 'var(--danger)' }}>Suspended</span>}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                                style={{
                                                                    background: u.is_active ? 'var(--danger)' : 'var(--success)',
                                                                    border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: 'white'
                                                                }}
                                                            >
                                                                {u.is_active ? 'Suspend' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                                                                        try {
                                                                            await api.delete(`/admin/users/${u.id}`);
                                                                            loadStats();
                                                                        } catch (e) { alert('Error deleting user'); }
                                                                    }
                                                                }}
                                                                style={{
                                                                    background: '#ef4444',
                                                                    border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: 'white'
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </GlassCard>
                    )}

                    {activeTab === 'rides' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {stats.rides.map(r => (
                                <GlassCard key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{r.pickup} ➔ {r.dropoff}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Client: {r.client_name} | Driver: {r.driver_name || 'Pending'}</div>
                                    </div>
                                    <div style={{
                                        padding: '5px 10px', borderRadius: '5px',
                                        background: r.status === 'completed' ? 'var(--success)' : r.status === 'cancelled' ? 'var(--danger)' : 'var(--primary)',
                                        color: 'black', fontWeight: 'bold'
                                    }}>
                                        {r.status.toUpperCase()}
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </AnimatedLayout>
            </div>
        </div>
    );
};

export default AdminDashboard;
