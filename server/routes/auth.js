const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'secret_key_123';

// Configure Multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'id-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Register
router.post('/register', upload.single('national_id_image'), async (req, res) => {
    const { name, phone, national_id, password, role, vehicle_type, device_type } = req.body;
    const national_id_image = req.file ? req.file.filename : null;

    if (!name || !phone || !national_id || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE phone = ? OR national_id = ?', [phone, national_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User with this phone or National ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert with new fields
        const [result] = await db.query(
            'INSERT INTO users (name, phone, national_id, national_id_image, password, role, vehicle_type, device_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, phone, national_id, national_id_image, hashedPassword, role, vehicle_type, device_type]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    console.log('[DEBUG] Login Request Body:', req.body);

    try {
        const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
        console.log(`[DEBUG] DB Query Result for ${phone}:`, users.length, 'users found');

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials (User not found)' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[Login Check] User: ${user.name}, Hash Match: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials (Password mismatch)' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                balance: user.balance,
                avatar_url: user.avatar_url
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Current User (for persistence)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const [users] = await db.query('SELECT id, name, role, balance, avatar_url, vehicle_type, device_type FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update Profile
router.put('/update', upload.single('avatar'), async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { name, email, vehicle_type, device_type } = req.body;
        const avatar_url = req.file ? req.file.filename : undefined;

        let query = 'UPDATE users SET name = ?, email = ?, vehicle_type = ?, device_type = ?';
        const params = [name, email, vehicle_type, device_type];

        if (avatar_url) {
            query += ', avatar_url = ?';
            params.push(avatar_url);
        }

        query += ' WHERE id = ?';
        params.push(decoded.id);

        await db.query(query, params);

        // Fetch updated user
        const [users] = await db.query('SELECT id, name, email, phone, role, balance, vehicle_type, device_type, avatar_url FROM users WHERE id = ?', [decoded.id]);
        res.json(users[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

module.exports = router;
