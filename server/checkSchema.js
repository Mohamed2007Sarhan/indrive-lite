const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'indrive_clone',
};

async function checkSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        console.log('Columns in users table:');
        columns.forEach(c => console.log(`- ${c.Field} (${c.Type})`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
