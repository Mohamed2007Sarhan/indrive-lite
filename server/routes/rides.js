const express = require('express');
const db = require('../db');

const router = express.Router();

// Create Ride Request (Client)
router.post('/create', async (req, res) => {
    const { client_id, pickup, dropoff, price } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO rides (client_id, pickup_address, dropoff_address, price, status) VALUES (?, ?, ?, ?, ?)',
            [client_id, pickup, dropoff, price, 'pending']
        );
        res.status(201).json({ message: 'Ride requested', rideId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating ride' });
    }
});

// Cancel Ride (Client)
router.post('/cancel', async (req, res) => {
    const { ride_id } = req.body;
    try {
        await db.query('UPDATE rides SET status = "cancelled" WHERE id = ?', [ride_id]);
        res.json({ message: 'Ride cancelled' });
    } catch (e) {
        res.status(500).json({ message: 'Error cancelling ride' });
    }
});

// Get Available Rides (Driver)
router.get('/available', async (req, res) => {
    try {
        // Exclude rides older than 5 minutes
        const [rides] = await db.query('SELECT r.*, u.name as client_name FROM rides r JOIN users u ON r.client_id = u.id WHERE r.status = "pending" AND r.created_at > NOW() - INTERVAL 5 MINUTE');
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rides' });
    }
});

// Report Problem
router.post('/report', async (req, res) => {
    const { ride_id, reporter_id, reason } = req.body;
    try {
        await db.query('INSERT INTO reports (ride_id, reporter_id, reason) VALUES (?, ?, ?)', [ride_id, reporter_id, reason]);
        // Also update ride status if needed, or notify admin
        res.status(201).json({ message: 'Report submitted. Support will contact you.' });
    } catch (e) {
        console.error('Report Error:', e);
        // If table doesn't exist, we might fail. For now assume it logic exists or create table later.
        // Actually, let's create table dynamically if failing? No, better to stick to simple response if DB fails.
        res.status(500).json({ message: 'Error submitting report' });
    }
});

// Finish Ride (Driver)
router.post('/finish', async (req, res) => {
    const { ride_id } = req.body;
    try {
        await db.query('UPDATE rides SET status = "completed" WHERE id = ?', [ride_id]);
        res.json({ message: 'Ride finished successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Error finishing ride' });
    }
});

// Get My Rides (Client/Driver)
router.get('/my-rides/:userId/:role', async (req, res) => {
    const { userId, role } = req.params;
    try {
        let query = '';
        if (role === 'client') {
            query = 'SELECT * FROM rides WHERE client_id = ? ORDER BY created_at DESC';
        } else {
            query = 'SELECT * FROM rides WHERE driver_id = ? ORDER BY created_at DESC';
        }
        const [rides] = await db.query(query, [userId]);
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
});

// Driver Accepts Ride
router.post('/accept', async (req, res) => {
    const { ride_id, driver_id } = req.body;
    try {
        // Generate OTPs
        const client_otp = Math.floor(1000 + Math.random() * 9000).toString(); // Code displayed to Client
        const driver_otp = Math.floor(1000 + Math.random() * 9000).toString(); // Code displayed to Driver

        await db.query(
            'UPDATE rides SET driver_id = ?, status = "accepted", client_otp_code = ?, driver_otp_code = ? WHERE id = ?',
            [driver_id, client_otp, driver_otp, ride_id]
        );

        res.json({ message: 'Ride accepted', client_otp, driver_otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error accepting ride' });
    }
});

// Verify OTP
// User submits the "other person's" OTP.
router.post('/verify-otp', async (req, res) => {
    const { ride_id, role, otp } = req.body;
    try {
        const [rides] = await db.query('SELECT * FROM rides WHERE id = ?', [ride_id]);
        if (rides.length === 0) return res.status(404).json({ message: 'Ride not found' });
        const ride = rides[0];

        if (role === 'client') {
            // Client is entering Driver's OTP (to prove they met driver? or vice versa?)
            // Requirement: "Each should enter the other's OTP address"
            // Let's assume: Client holds 'client_otp'. Driver holds 'driver_otp'.
            // If Client enters 'driver_otp', it means Client verifies Driver.
            // Wait, if I (Client) see '1234' on my screen, I should tell Driver "1234". Driver enters "1234".
            // So if I am Client, I enter the code the Driver GIVES me. Driver has 'driver_otp' on their screen? 
            // Let's stick to the generated fields:
            // client_otp_code: Code for Client side (e.g. displayed to client or verified by client?)
            // Let's implement: Client enters `driver_otp_code`. Driver enters `client_otp_code`.

            if (otp === ride.driver_otp_code) {
                await db.query('UPDATE rides SET client_confirmed = TRUE WHERE id = ?', [ride_id]);
                checkCompletion(ride_id, res);
            } else {
                res.status(400).json({ message: 'Invalid OTP' });
            }
        } else if (role === 'driver') {
            // Driver enters Client's OTP
            if (otp === ride.client_otp_code) {
                await db.query('UPDATE rides SET driver_confirmed = TRUE WHERE id = ?', [ride_id]);
                checkCompletion(ride_id, res);
            } else {
                res.status(400).json({ message: 'Invalid OTP' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// Make an Offer (Driver)
router.post('/offer', async (req, res) => {
    const { ride_id, driver_id, amount } = req.body;
    try {
        await db.query('INSERT INTO offers (ride_id, driver_id, offer_amount) VALUES (?, ?, ?)', [ride_id, driver_id, amount]);
        res.status(201).json({ message: 'Offer sent' });
    } catch (e) {
        console.error('Offer Error:', e);
        res.status(500).json({ message: 'Error sending offer: ' + e.message });
    }
});

// Get Offers for a Ride (Client)
router.get('/:rideId/offers', async (req, res) => {
    const { rideId } = req.params;
    try {
        const [offers] = await db.query(
            'SELECT o.*, u.name as driver_name FROM offers o JOIN users u ON o.driver_id = u.id WHERE o.ride_id = ? AND o.status = "pending"',
            [rideId]
        );
        res.json(offers);
    } catch (e) {
        res.status(500).json({ message: 'Error loading offers' });
    }
});

// Accept Offer (Client)
router.post('/accept-offer', async (req, res) => {
    const { offer_id } = req.body;
    try {
        // Get offer details
        const [offers] = await db.query('SELECT * FROM offers WHERE id = ?', [offer_id]);
        if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });
        const offer = offers[0];

        // Update Ride: Assign Driver, Set Price, Set Status, Generate OTPs
        const client_otp = Math.floor(1000 + Math.random() * 9000).toString();
        const driver_otp = Math.floor(1000 + Math.random() * 9000).toString();

        await db.query(
            'UPDATE rides SET driver_id = ?, status = "accepted", final_price = ?, client_otp_code = ?, driver_otp_code = ? WHERE id = ?',
            [offer.driver_id, offer.offer_amount, client_otp, driver_otp, offer.ride_id]
        );

        // Update Offer status
        await db.query('UPDATE offers SET status = "accepted" WHERE id = ?', [offer_id]);

        // Reject other offers? Optional.

        res.json({ message: 'Offer accepted', client_otp, driver_otp });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error accepting offer' });
    }
});

async function checkCompletion(rideId, res) {
    // Check if both confirmed
    const [rides] = await db.query('SELECT * FROM rides WHERE id = ?', [rideId]);
    const ride = rides[0];
    if (ride.client_confirmed && ride.driver_confirmed) {
        await db.query('UPDATE rides SET status = "completed" WHERE id = ?', [rideId]);
        return res.json({ message: 'OTP Verified. Ride Completed!', status: 'completed' });
    }
    return res.json({ message: 'OTP Verified. Waiting for other party...', status: 'waiting' });
}

module.exports = router;
