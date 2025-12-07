const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

async function initDb() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        console.log('Connected to MySQL...');

        // Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'indrive_clone'}\``);
        console.log('Database created or already exists.');

        await connection.changeUser({ database: process.env.DB_NAME || 'indrive_clone' });

        // Create Users Table
        const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        national_id VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('client', 'driver', 'admin') NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await connection.query(createUsersTable);
        console.log('Users table checked/created.');

        // Create Rides Table
        const createRidesTable = `
      CREATE TABLE IF NOT EXISTS rides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        driver_id INT,
        pickup_address VARCHAR(255) NOT NULL,
        dropoff_address VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        client_otp_code VARCHAR(10),
        driver_otp_code VARCHAR(10),
        client_confirmed BOOLEAN DEFAULT FALSE,
        driver_confirmed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (driver_id) REFERENCES users(id)
      )
    `;
        await connection.query(createRidesTable);
        console.log('Rides table checked/created.');

        // Create Admin User if not exists
        const [rows] = await connection.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
        if (rows.length === 0) {
            // NOTE: In production, hash this password! For demo, storing plain text temporarily or handled by auth logic.
            // I'll insert a dummy hash or plain for now to be handled by Login.
            // Let's assume the auth logic relies on hashing, so I should implement hashing. 
            // I'll skip inserting admin here to strictly follow auth flow or insert one for convenience.
            // I'll make a simple admin.
            // Password 'admin123' hashed (placeholder)
            // For now, I'll rely on registration to create users.
        }

        console.log('Database initialization complete.');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initDb();
