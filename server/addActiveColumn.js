const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'indrive_clone',
};

async function updateSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Add is_active column
        try {
            await connection.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
            console.log('Added "is_active" column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('"is_active" column already exists.');
            } else {
                console.error('Error adding column:', e);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error('Database connection failed:', e);
        process.exit(1);
    }
}

updateSchema();
