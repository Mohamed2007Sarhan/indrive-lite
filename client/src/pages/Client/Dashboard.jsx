import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/Map/Map';

const ClientDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [request, setRequest] = useState({
        pickup: '',
        dropoff: '',
        price: ''
    });

    // Hardcoded for demo: Move map to these coordinates when typing? 
    // For now, static center or markers based on active ride.
    const [mapCenter, setMapCenter] = useState([30.0444, 31.2357]);
    const [markers, setMarkers] = useState([]);

    const loadRides = async () => {
        try {
            const { data } = await api.get(`/rides/my-rides/${user.id}/client`);
            setRides(data);

            // Update map based on active ride
            const active = data.find(r => ['accepted', 'in_progress'].includes(r.status));
            if (active) {
                // In a real app, we'd geocode the address. 
                // For demo, let's just place a marker at Cairo center for "Active"
                setMarkers([{ position: [30.0444, 31.2357], label: 'Current Ride' }]);
            } else {
                setMarkers([]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadRides();
        const interval = setInterval(loadRides, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rides/create', {
                client_id: user.id,
                ...request
            });
            setRequest({ pickup: '', dropoff: '', price: '' });
            loadRides();
            alert('Ride requested!');
        } catch (e) {
            alert('Error requesting ride');
        }
    };

    const handleVerify = async (rideId, code) => {
        try {
            const { data } = await api.post('/rides/verify-otp', {
                ride_id: rideId,
                role: 'client',
                otp: code
            });
            alert(data.message);
            loadRides();
        } catch (e) {
            alert(e.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="navbar">
                <div className="brand">InDrive</div>
                <div style={{ color: 'white' }}>{user.name}</div>
            </div>

            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                {/* Sidebar / Overlay */}
                <div style={{
                    width: '400px',
                    background: 'var(--bg-card)',
                    padding: '20px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {/* Request Form */}
                    <div className="card" style={{ border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                        <h3 style={{ marginBottom: '15px' }}>Request a Ride</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input type="text" placeholder="Pickup Location" className="input-field" required
                                    value={request.pickup} onChange={e => setRequest({ ...request, pickup: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <input type="text" placeholder="Dropoff Location" className="input-field" required
                                    value={request.dropoff} onChange={e => setRequest({ ...request, dropoff: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <input type="number" placeholder="Offer Price (EGP)" className="input-field" required
                                    value={request.price} onChange={e => setRequest({ ...request, price: e.target.value })} />
                            </div>
                            <button className="btn-primary" style={{ width: '100%' }}>Find Driver</button>
                        </form>
                    </div>

                    {/* Active Rides List */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Recent Activity</h4>
                        {rides.map(ride => (
                            <div key={ride.id} className="card" style={{ marginBottom: '10px', padding: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={`badge badge-${ride.status}`}>{ride.status}</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{ride.price} EGP</span>
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                                    <div>{ride.pickup_address} ➝ {ride.dropoff_address}</div>
                                </div>

                                {ride.status === 'accepted' || ride.status === 'in_progress' ? (
                                    <div style={{ marginTop: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                            Driver Code: <b style={{ color: 'white', fontSize: '1.2rem' }}>{ride.client_otp_code}</b>
                                        </p>
                                        {!ride.client_confirmed && (
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Driver's Code"
                                                    className="input-field"
                                                    style={{ padding: '8px' }}
                                                    id={`otp-${ride.id}`}
                                                />
                                                <button className="btn-primary" style={{ padding: '8px 12px' }} onClick={() => {
                                                    const input = document.getElementById(`otp-${ride.id}`);
                                                    handleVerify(ride.id, input.value);
                                                }}>OK</button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Area */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapComponent markers={markers} center={mapCenter} />
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
