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

async function checkUser(phone, pass) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.query('SELECT * FROM users WHERE phone = ?', [phone]);

        if (users.length === 0) {
            console.log('User not found');
            process.exit(0);
        }

        const user = users[0];
        console.log(`User: ${user.name}, Role: ${user.role}, Active: ${user.is_active}`);

        const isMatch = await bcrypt.compare(pass, user.password);
        console.log(`Password match: ${isMatch}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

// User provided: +201041922321 / 123456789
checkUser('+201041922321', '123456789');
