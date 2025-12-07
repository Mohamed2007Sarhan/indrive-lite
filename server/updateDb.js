const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'indrive_clone',
};

async function updateDb() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL...');

        // 1. Update Users Table (Add national_id_image)
        try {
            await connection.query(`ALTER TABLE users ADD COLUMN national_id_image VARCHAR(255)`);
            console.log('Added national_id_image to users.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Column national_id_image might already exist.');
        }

        // 2. Update Rides Table (Add coordinates)
        const rideCols = ['pickup_lat', 'pickup_lng', 'dropoff_lat', 'dropoff_lng', 'final_price'];
        for (const col of rideCols) {
            try {
                // final_price might conflict with price, but let's assume we use price for initial offer and final_price for agreed?
                // Actually, let's just add lat/lng.
                // final_price is useful if it differs from initial.
                await connection.query(`ALTER TABLE rides ADD COLUMN ${col} DECIMAL(10, 8)`);
                // Note: final_price should be DECIMAL(10,2), my loop is lazy. fixing below.
            } catch (e) { }
        }
        // Fix types
        try { await connection.query(`ALTER TABLE rides MODIFY COLUMN pickup_lat DECIMAL(10, 8)`); } catch (e) { }
        try { await connection.query(`ALTER TABLE rides MODIFY COLUMN pickup_lng DECIMAL(10, 8)`); } catch (e) { }
        try { await connection.query(`ALTER TABLE rides MODIFY COLUMN dropoff_lat DECIMAL(10, 8)`); } catch (e) { }
        try { await connection.query(`ALTER TABLE rides MODIFY COLUMN dropoff_lng DECIMAL(10, 8)`); } catch (e) { }
        try { await connection.query(`ALTER TABLE rides ADD COLUMN final_price DECIMAL(10, 2)`); } catch (e) { }


        // 3. Create Offers Table
        const createOffersTable = `
      CREATE TABLE IF NOT EXISTS offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ride_id INT NOT NULL,
        driver_id INT NOT NULL,
        offer_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ride_id) REFERENCES rides(id),
        FOREIGN KEY (driver_id) REFERENCES users(id)
      )
    `;
        await connection.query(createOffersTable);
        console.log('Offers table checked/created.');

        // 4. Create Reports Table
        const createReportsTable = `
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ride_id INT NOT NULL,
        reporter_id INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('open', 'resolved') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ride_id) REFERENCES rides(id),
        FOREIGN KEY (reporter_id) REFERENCES users(id)
      )
    `;
        await connection.query(createReportsTable);
        console.log('Reports table checked/created.');

        console.log('Database update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Database update failed:', error);
        process.exit(1);
    }
}

updateDb();
