import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedLayout from '../../components/UI/AnimatedLayout';
import GlassCard from '../../components/UI/GlassCard';

const Login = () => {
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(formData.phone, formData.password);

            if (user?.role === 'client') navigate('/client');
            else if (user?.role === 'driver') navigate('/driver');
            else if (user?.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <AnimatedLayout className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <GlassCard style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-dim)' }}>Login to continue</p>
                </div>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid var(--danger)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" className="input-field" placeholder="+20 1xxxxxxxxx" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" name="password" className="input-field" placeholder="••••••••" required onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', fontSize: '1.1rem' }}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </GlassCard>
        </AnimatedLayout>
    );
};

export default Login;
