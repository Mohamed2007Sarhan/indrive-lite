import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/Map/Map';
import AnimatedLayout from '../../components/UI/AnimatedLayout';
import GlassCard from '../../components/UI/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [availableRides, setAvailableRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [mapCenter, setMapCenter] = useState([30.0444, 31.2357]);
    const [markers, setMarkers] = useState([]);
    const [offerAmounts, setOfferAmounts] = useState({});
    const [currentRoute, setCurrentRoute] = useState(null);

    const [hiddenRides, setHiddenRides] = useState([]);

    const loadData = async () => {
        try {
            const available = await api.get('/rides/available');
            setAvailableRides(available.data);
            const mine = await api.get(`/rides/my-rides/${user.id}/driver`);
            setMyRides(mine.data);

            const newMarkers = available.data
                .filter(r => !hiddenRides.includes(r.id)) // Filter hidden
                .map(r => ({
                    position: [r.pickup_lat || 30.0444, r.pickup_lng || 31.2357],
                    label: `Pickup: ${r.pickup_address}`
                }));
            setMarkers(newMarkers);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [user.id, hiddenRides]); // Re-render on hiddenRides change

    const submitOffer = async (rideId) => {
        const amount = offerAmounts[rideId];
        if (!amount) return alert('Enter an amount');
        try {
            await api.post('/rides/offer', {
                ride_id: rideId,
                driver_id: user.id,
                amount: amount
            });
            alert('Offer sent!');
            setHiddenRides(prev => [...prev, rideId]); // Hide locally
            setOfferAmounts(prev => ({ ...prev, [rideId]: '' }));
        } catch (e) {
            alert('Error sending offer');
        }
    };

    const handleVerify = async (rideId, code) => {
        try {
            const { data } = await api.post('/rides/verify-otp', {
                ride_id: rideId,
                role: 'driver',
                otp: code
            });
            alert(data.message);
            loadData();
        } catch (e) {
            alert(e.response?.data?.message || 'Verification failed');
        }
    };

    const finishRide = async (rideId) => {
        if (!confirm('End this ride?')) return;
        try {
            await api.post('/rides/finish', { ride_id: rideId });
            alert('Ride Completed');
            loadData();
        } catch (e) { alert('Error ending ride'); }
    };

    const showRoute = (ride) => {
        if (ride.pickup_lat && ride.dropoff_lat) {
            setCurrentRoute([
                [ride.pickup_lat, ride.pickup_lng],
                [ride.dropoff_lat, ride.dropoff_lng]
            ]);
            setMapCenter([ride.pickup_lat, ride.pickup_lng]); // Focus on pickup
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <MapComponent markers={markers} center={mapCenter} routePoints={currentRoute} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, padding: '20px', pointerEvents: 'none', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', marginTop: '10px' }}>
                    <GlassCard style={{ padding: '10px 20px', borderRadius: '50px' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>InDrive Driver</h3>
                    </GlassCard>
                    <GlassCard style={{ padding: '5px 15px', cursor: 'pointer', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => window.location.href = '/settings'}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{user.name}</span>
                        {user.avatar_url ? (
                            <img src={`http://localhost:3000/uploads/${user.avatar_url}`} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                        ) : (
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</div>
                        )}
                    </GlassCard>
                </div>

                <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '100%', maxWidth: '400px', pointerEvents: 'auto', maxHeight: '80vh', overflowY: 'auto' }}>
                    <AnimatePresence>
                        {/* Active Jobs */}
                        {myRides.map(ride => {
                            if (!['accepted', 'in_progress'].includes(ride.status)) return null;
                            return (
                                <GlassCard key={ride.id} className="mb-4" style={{ marginBottom: '10px', borderColor: 'var(--primary)', borderWidth: '2px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Active Job ({ride.final_price} EGP)</h4>
                                    <div onClick={() => showRoute(ride)} style={{ cursor: 'pointer' }}>
                                        <div>📍 <b>Pickup:</b> {ride.pickup_address}</div>
                                        <div>🏁 <b>Drop:</b> {ride.dropoff_address}</div>
                                    </div>
                                    <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                                        {/* Driver Flow: 1. Give Code to Client. 2. Get Code from Client. */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <span style={{ color: '#text-dim', fontSize: '0.85rem' }}>Give this code to Client first:</span><br />
                                            <b style={{ fontSize: '1.2rem', color: '#fbbf24' }}>{ride.driver_otp_code}</b>
                                        </div>

                                        {!ride.driver_confirmed ? (
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                                <input id={`dotp-${ride.id}`} className="input-field" placeholder="Enter Client Code" />
                                                <button className="btn-primary" onClick={() => handleVerify(ride.id, document.getElementById(`dotp-${ride.id}`).value)}>Verify</button>
                                            </div>
                                        ) : (
                                            <button className="btn-primary" style={{ width: '100%', background: 'var(--danger)', marginTop: '10px' }} onClick={() => finishRide(ride.id)}>🏁 End Ride</button>
                                        )}

                                        <button className="btn-secondary" style={{ marginTop: '10px', width: '100%', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={async () => {
                                            const reason = prompt('Problem reason?');
                                            if (reason) {
                                                await api.post('/rides/report', { ride_id: ride.id, reporter_id: user.id, reason });
                                                alert('Report sent.');
                                            }
                                        }}>Report Problem</button>
                                    </div>
                                </GlassCard>
                            );
                        })}

                        {/* Available Requests */}
                        <GlassCard>
                            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Requests Nearby</h3>
                            {availableRides.filter(r => !hiddenRides.includes(r.id)).length === 0 && <p className="text-center">No requests nearby...</p>}
                            {availableRides.filter(r => !hiddenRides.includes(r.id)).map(ride => (
                                <motion.div
                                    key={ride.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => showRoute(ride)}
                                    style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
                                >
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>📍 {ride.pickup_address}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '10px' }}>🏁 To: {ride.dropoff_address}</div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <input
                                            type="number"
                                            placeholder="Your Offer (EGP)"
                                            className="input-field"
                                            style={{ padding: '10px' }}
                                            value={offerAmounts[ride.id] || ''}
                                            onChange={(e) => setOfferAmounts({ ...offerAmounts, [ride.id]: e.target.value })}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); submitOffer(ride.id); }}>Bid</button>
                                    </div>
                                </motion.div>
                            ))}
                        </GlassCard>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
