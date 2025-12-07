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

async function checkUserAlt() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Try exact match and LIKE match
        const [users] = await connection.query('SELECT * FROM users WHERE phone LIKE "%1041922321%"');

        if (users.length === 0) {
            console.log('User still not found');
        } else {
            users.forEach(u => console.log(`Found: ${u.name}, Phone: ${u.phone}`));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUserAlt();
