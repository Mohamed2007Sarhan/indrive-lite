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

async function resetPass() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        const hash = await bcrypt.hash('admin123', 10);

        // Check if admin exists
        const [users] = await connection.query('SELECT * FROM users WHERE phone = "00000"');
        if (users.length === 0) {
            console.log('Admin not found. Creating...');
            await connection.query('INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)', ['Admin', '00000', hash, 'admin']);
        } else {
            console.log('Admin found. Updating password...');
            await connection.query('UPDATE users SET password = ? WHERE phone = "00000"', [hash]);
        }

        console.log('Password set to: admin123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

resetPass();
