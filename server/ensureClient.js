const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'indrive_clone',
};

async function ensureClient() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const phone = '+201041922321';
        const rawPass = '123456789';
        const hash = await bcrypt.hash(rawPass, 10);

        // Check availability
        const [users] = await connection.query('SELECT * FROM users WHERE phone = ?', [phone]);

        if (users.length === 0) {
            console.log('Creating new client user...');
            await connection.query(
                'INSERT INTO users (name, phone, password, role, is_active) VALUES (?, ?, ?, ?, 1)',
                ['Valued Client', phone, hash, 'client']
            );
        } else {
            console.log('Updating existing user password...');
            await connection.query(
                'UPDATE users SET password = ?, is_active = 1 WHERE phone = ?',
                [hash, phone]
            );
        }
        console.log('User ready. Phone:', phone, 'Pass:', rawPass);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

ensureClient();
