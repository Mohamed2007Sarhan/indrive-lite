import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/Map/Map';
import GlassCard from '../../components/UI/GlassCard';
import Modal from '../../components/UI/Modal';
import { getCurrentLocation, reverseGeocode } from '../../utils/location';
import { motion, AnimatePresence } from 'framer-motion';

const ClientRequest = () => {
    const { user } = useAuth();
    const [request, setRequest] = useState({
        pickup: '',
        pickup_lat: null,
        pickup_lng: null,
        dropoff: '',
        dropoff_lat: null,
        dropoff_lng: null,
        price: ''
    });

    const [step, setStep] = useState('location'); // location, bidding, active
    const [activeRide, setActiveRide] = useState(null);
    const [offers, setOffers] = useState([]);

    // Modal State
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const showModal = (title, message, type = 'info') => setModal({ isOpen: true, title, message, type });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    // Auto-fill location on mount
    useEffect(() => {
        const initLocation = async () => {
            try {
                const coords = await getCurrentLocation();
                const address = await reverseGeocode(coords.lat, coords.lng);
                setRequest(prev => ({
                    ...prev,
                    pickup: address,
                    pickup_lat: coords.lat,
                    pickup_lng: coords.lng
                }));
            } catch (e) {
                console.error('Location error:', e);
            }
        };
        initLocation();
    }, []);

    const loadActiveRide = async () => {
        if (!user || !user.id) return;
        try {
            const { data } = await api.get(`/rides/my-rides/${user.id}/client`);
            if (Array.isArray(data)) {
                const active = data.find(r => ['pending', 'accepted', 'in_progress'].includes(r.status));
                if (active) {
                    // Only update if ID or Status changed to prevent infinite re-renders/thrashing
                    setActiveRide(prev => {
                        if (prev && prev.id === active.id && prev.status === active.status && prev.client_confirmed === active.client_confirmed) {
                            return prev;
                        }
                        return active;
                    });

                    if (active.status === 'pending') {
                        setStep('bidding');
                        loadOffers(active.id);
                    } else {
                        setStep('active');
                    }
                }
            }
        } catch (e) { console.error('Load Active Ride Error:', e); }
    };

    const loadOffers = async (rideId) => {
        try {
            const { data } = await api.get(`/rides/${rideId}/offers`);
            setOffers(data || []);
        } catch (e) { setOffers([]); }
    };

    useEffect(() => {
        loadActiveRide();
        const interval = setInterval(() => {
            if (step === 'bidding' && activeRide) loadOffers(activeRide.id);
            loadActiveRide();
        }, 3000);
        return () => clearInterval(interval);
    }, [step, activeRide?.id]);

    const handleMapClick = async (latlng) => {
        if (step !== 'location') return;

        try {
            const address = await reverseGeocode(latlng.lat, latlng.lng);

            if (!request.pickup || (request.pickup && request.dropoff)) {
                setRequest(prev => ({ ...prev, pickup: address, pickup_lat: latlng.lat, pickup_lng: latlng.lng, dropoff: '', dropoff_lat: null, dropoff_lng: null }));
            } else {
                setRequest(prev => ({ ...prev, dropoff: address, dropoff_lat: latlng.lat, dropoff_lng: latlng.lng }));
            }
        } catch (e) { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rides/create', {
                client_id: user.id,
                pickup: request.pickup,
                dropoff: request.dropoff,
                price: 0,
                pickup_lat: request.pickup_lat,
                pickup_lng: request.pickup_lng,
                dropoff_lat: request.dropoff_lat,
                dropoff_lng: request.dropoff_lng
            });
            showModal('Success', 'Request sent! Waiting for drivers...', 'success');
            loadActiveRide();
        } catch (e) {
            showModal('Error', 'Error sending request', 'error');
        }
    };

    const acceptOffer = async (offerId) => {
        try {
            await api.post('/rides/accept-offer', { offer_id: offerId });
            setStep('active');
        } catch (e) {
            showModal('Error', 'Error accepting offer', 'error');
        }
    };

    const cancelTrip = async () => {
        if (!activeRide) return;
        try {
            await api.post('/rides/cancel', { ride_id: activeRide.id });
            showModal('Cancelled', 'Ride cancelled successfully.', 'info');
            setActiveRide(null);
            setStep('location');
            setRequest(prev => ({ ...prev, pickup: '', dropoff: '', price: '' }));
        } catch (e) {
            showModal('Error', 'Could not cancel ride', 'error');
        }
    };

    const getRoutePoints = () => {
        if (request.pickup_lat && request.dropoff_lat) {
            return [
                [request.pickup_lat, request.pickup_lng],
                [request.dropoff_lat, request.dropoff_lng]
            ];
        }
        return null;
    };

    // Helper to validate coordinates
    const isValidCoord = (lat, lng) => !isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null;

    if (!user) {
        console.log('[DEBUG] Waiting for user...');
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading User Profile...</div>;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <MapComponent
                    center={isValidCoord(request.pickup_lat, request.pickup_lng) ? [request.pickup_lat, request.pickup_lng] : undefined}
                    onClick={handleMapClick}
                    markers={[
                        ...(isValidCoord(request.pickup_lat, request.pickup_lng) ? [{ position: [request.pickup_lat, request.pickup_lng], label: 'Pickup' }] : []),
                        ...(isValidCoord(request.dropoff_lat, request.dropoff_lng) ? [{ position: [request.dropoff_lat, request.dropoff_lng], label: 'Dropoff' }] : [])
                    ]}
                    routePoints={getRoutePoints()}
                />
            </div>

            <div style={{ position: 'relative', zIndex: 10, padding: '20px', pointerEvents: 'none', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', marginTop: '10px' }}>
                    <GlassCard style={{ padding: '10px 20px', borderRadius: '50px' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>InDrive</h3>
                    </GlassCard>

                    <GlassCard style={{ padding: '5px 15px', cursor: 'pointer', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => window.location.href = '/settings'}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{user?.name}</span>
                        {user?.avatar_url ? (
                            <img src={`http://localhost:3000/uploads/${user.avatar_url}`} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                        ) : (
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</div>
                        )}
                    </GlassCard>
                </div>

                <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '100%', maxWidth: '400px', pointerEvents: 'auto' }}>
                    <AnimatePresence mode="wait">
                        {step === 'location' && (
                            <GlassCard key="req-form">
                                <h3 style={{ marginBottom: '15px' }}>Where to?</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="input-group">
                                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Pickup (Auto-detected)</div>
                                        <input value={request.pickup} onChange={e => setRequest({ ...request, pickup: e.target.value })} className="input-field" placeholder="Detecting location..." />
                                    </div>
                                    <div className="input-group">
                                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Destination (Click map to set)</div>
                                        <input value={request.dropoff} onChange={e => setRequest({ ...request, dropoff: e.target.value })} className="input-field" placeholder="Enter Destination..." required />
                                    </div>
                                    <button className="btn-primary" style={{ width: '100%' }}>Find Drivers</button>
                                </form>
                            </GlassCard>
                        )}

                        {step === 'bidding' && (
                            <GlassCard key="bidding-list">
                                <h3>Offers for you</h3>
                                <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                    {(!offers || offers.length === 0) && <p className="text-center" style={{ padding: '20px' }}>Waiting for drivers...</p>}
                                    {offers && offers.map(offer => (
                                        <motion.div
                                            key={offer.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{offer.driver_name}</div>
                                                <div style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>{offer.offer_amount} EGP</div>
                                            </div>
                                            <button className="btn-primary" onClick={() => acceptOffer(offer.id)}>Accept</button>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {step === 'active' && activeRide && (
                            <GlassCard key="active-ride">
                                <h3>On the way!</h3>
                                <p>Driver: <b>{activeRide.driver_name}</b></p>
                                <p>Price: {activeRide.final_price || activeRide.price} EGP</p>
                                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }} />

                                {!activeRide.client_confirmed ? (
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#fbbf24', marginBottom: '10px' }}>⚠️ Security Check</p>
                                        <p style={{ fontSize: '0.9rem' }}>Ask driver for <b>HIS</b> code and enter it below to reveal <b>YOUR</b> code.</p>

                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input id="driver-code-input" className="input-field" placeholder="Enter Driver Code" />
                                            <button className="btn-primary" onClick={async () => {
                                                const code = document.getElementById('driver-code-input').value;
                                                try {
                                                    await api.post('/rides/verify-otp', { ride_id: activeRide.id, role: 'client', otp: code });
                                                    alert('Driver Verified! Share your code now.');
                                                    loadActiveRide();
                                                } catch (e) { alert('Invalid Code'); }
                                            }}>verify</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '12px', textAlign: 'center', marginTop: '15px', border: '1px solid var(--primary)' }}>
                                        <p style={{ margin: 0, color: '#86efac', fontWeight: 'bold' }}>✓ Driver Verified</p>
                                        <p style={{ margin: '10px 0 5px 0', fontSize: '0.9rem' }}>Share this code with Driver:</p>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '8px', textShadow: '0 0 10px var(--primary)' }}>{activeRide.client_otp_code}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-secondary" style={{ marginTop: '15px', width: '100%', color: 'var(--danger)' }} onClick={async () => {
                                        const reason = prompt('What is the problem?');
                                        if (reason) {
                                            await api.post('/rides/report', { ride_id: activeRide.id, reporter_id: user.id, reason });
                                            showModal('Reported', 'Report sent to admin.', 'info');
                                        }
                                    }}>Report Problem</button>

                                    <button className="btn-secondary" style={{ marginTop: '15px', width: '100%', color: '#fbbf24', borderColor: '#fbbf24' }} onClick={cancelTrip}>Cancel Trip</button>
                                </div>
                            </GlassCard>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default ClientRequest;
