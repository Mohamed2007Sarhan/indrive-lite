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

async function checkLogin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.query('SELECT * FROM users WHERE phone = "00000"');

        if (users.length === 0) {
            console.log('User not found');
            process.exit(1);
        }

        const user = users[0];
        console.log('User found:', user.name);
        console.log('Stored Hash:', user.password);

        const isMatch = await bcrypt.compare('admin123', user.password);
        console.log('Password match for "admin123":', isMatch);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkLogin();
