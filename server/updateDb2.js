const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'indrive_clone',
};

async function updateDb2() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL...');

        // Users Table Updates
        const cols = [
            { name: 'email', type: 'VARCHAR(255)' },
            { name: 'vehicle_type', type: 'VARCHAR(100)' }, // For drivers
            { name: 'device_type', type: 'VARCHAR(100)' },  // "phone they want to install"
            { name: 'avatar_url', type: 'VARCHAR(255)' }    // Profile picture
        ];

        for (const col of cols) {
            try {
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
                console.log(`Added ${col.name} to users.`);
            } catch (e) {
                if (e.code !== 'ER_DUP_FIELDNAME') console.log(`${col.name} might already exist or error:`, e.message);
            }
        }

        console.log('Database update 2 complete.');
        process.exit(0);
    } catch (error) {
        console.error('Database update failed:', error);
        process.exit(1);
    }
}

updateDb2();
