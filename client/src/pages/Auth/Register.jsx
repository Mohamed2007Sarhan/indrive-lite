import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedLayout from '../../components/UI/AnimatedLayout';
import GlassCard from '../../components/UI/GlassCard';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        national_id: '',
        password: '',
        role: 'client',
        vehicle_type: '', // for driver
        device_type: ''   // for client
    });
    const [idImage, setIdImage] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setIdImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (idImage) data.append('national_id_image', idImage);

            await register(data);
            navigate('/login'); // Redirect to login after success
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        }
        setLoading(false);
    };

    return (
        <AnimatedLayout className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <GlassCard style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}>Join InDrive</h2>
                    <p style={{ color: 'var(--text-dim)' }}>Create your account to get started</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid var(--danger)' }}>
                        {error}
                    </div>
                )}

                <div className="role-toggle" style={{ marginBottom: '30px' }}>
                    <div
                        className={`role-btn ${formData.role === 'client' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'client' })}
                    >
                        Passenger
                    </div>
                    <div
                        className={`role-btn ${formData.role === 'driver' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'driver' })}
                    >
                        Driver
                    </div>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" name="name" className="input-field" placeholder="John Doe" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" className="input-field" placeholder="+20 1xxxxxxxxx" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>National ID Number</label>
                        <input type="text" name="national_id" className="input-field" placeholder="14 Digit ID" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>National ID Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="input-field"
                            required
                            onChange={handleFileChange}
                            style={{ paddingTop: '10px' }}
                        />
                    </div>

                    {formData.role === 'driver' && (
                        <div className="input-group">
                            <label>Vehicle Type (Car Model)</label>
                            <input type="text" name="vehicle_type" className="input-field" placeholder="e.g. Hyundai Elantra 2020" required onChange={handleChange} />
                        </div>
                    )}

                    {formData.role === 'client' && (
                        <div className="input-group">
                            <label>Phone / Device Model</label>
                            <input type="text" name="device_type" className="input-field" placeholder="e.g. iPhone 13" onChange={handleChange} />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" name="password" className="input-field" placeholder="••••••••" required onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', fontSize: '1.1rem' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Log in</Link>
                </p>
            </GlassCard>
        </AnimatedLayout>
    );
};

export default Register;
