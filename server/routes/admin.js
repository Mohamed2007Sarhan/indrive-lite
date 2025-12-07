const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, phone, role, national_id, national_id_image, created_at, is_active FROM users ORDER BY created_at DESC LIMIT 50');
        const [rides] = await db.query('SELECT r.*, u.name as client_name, d.name as driver_name FROM rides r JOIN users u ON r.client_id = u.id LEFT JOIN users d ON r.driver_id = d.id ORDER BY r.created_at DESC LIMIT 50');
        const [reports] = await db.query('SELECT rep.*, u.name as reporter_name FROM reports rep JOIN users u ON rep.reporter_id = u.id ORDER BY rep.created_at DESC LIMIT 20');

        res.json({ users, rides, reports });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
});

router.put('/users/:id/status', async (req, res) => {
    const { is_active } = req.body;
    try {
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
        res.json({ message: 'User status updated' });
    } catch (e) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
