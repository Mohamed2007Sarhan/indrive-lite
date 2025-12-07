import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AnimatedLayout from '../components/UI/AnimatedLayout';
import GlassCard from '../components/UI/GlassCard';

const Settings = () => {
    const { user, login } = useAuth(); // We might need a way to update user in context without re-login
    // Actually, let's update local user state if successful.

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        vehicle_type: '',
        device_type: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                vehicle_type: user.vehicle_type || '',
                device_type: user.device_type || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setAvatar(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('vehicle_type', formData.vehicle_type);
            data.append('device_type', formData.device_type);
            if (avatar) data.append('avatar', avatar);

            const res = await api.put('/auth/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Profile updated!');
            // Ideally update context, but for now user can refresh.
            // We can reload the page to refresh context
            window.location.reload();
        } catch (e) {
            alert('Error updating profile');
        }
        setLoading(false);
    };

    return (
        <AnimatedLayout className="page-container" style={{ padding: '20px', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
            <GlassCard style={{ maxWidth: '600px', width: '100%' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Account Settings</h2>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {user?.avatar_url ? (
                        <img
                            src={`http://localhost:3000/uploads/${user.avatar_url}`}
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                        />
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            No Photo
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Profile Picture</label>
                        <input type="file" onChange={handleFileChange} className="input-field" style={{ paddingTop: '8px' }} />
                    </div>

                    {user?.role === 'driver' && (
                        <div className="input-group">
                            <label>Vehicle Type</label>
                            <select name="vehicle_type" className="input-field" value={formData.vehicle_type} onChange={handleChange}>
                                <option value="">Select Vehicle</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Motorcycle">Motorcycle</option>
                                <option value="Van">Van</option>
                            </select>
                        </div>
                    )}

                    {user?.role === 'client' && (
                        <div className="input-group">
                            <label>Phone Model / Device</label>
                            <input type="text" name="device_type" className="input-field" value={formData.device_type} onChange={handleChange} placeholder="e.g. iPhone 14, Samsung S23" />
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </GlassCard>
        </AnimatedLayout>
    );
};

export default Settings;
