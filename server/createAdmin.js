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

async function createAdmin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const password = await bcrypt.hash('admin123', 10);

        // Check if admin exists
        const [exists] = await connection.query('SELECT * FROM users WHERE phone = "00000"');
        if (exists.length > 0) {
            await connection.query('UPDATE users SET password = ? WHERE phone = "00000"', [password]);
            console.log('Admin password reset to: admin123');
            process.exit(0);
        }

        await connection.query(
            'INSERT INTO users (name, phone, national_id, password, role) VALUES (?, ?, ?, ?, ?)',
            ['Super Admin', '00000', 'ADMIN001', password, 'admin']
        );
        console.log('Admin created successfully.');
        console.log('Login with -> Phone: 00000, Password: admin123');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

createAdmin();
