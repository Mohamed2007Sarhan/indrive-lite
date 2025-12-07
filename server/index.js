const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to load
}));
app.use(bodyParser.json());

// Rate Limiter: 100 reqs per 10 mins
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Check DB Connection
db.getConnection()
    .then(connection => {
        console.log('Connected to MySQL Database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
        console.log('Please ensure MySQL is running and the database "indrive_clone" exists.');
    });

app.get('/', (req, res) => {
    res.send('InDrive Clone API is running');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
