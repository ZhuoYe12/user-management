const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.CORS_ORIGIN]
        : ['http://localhost:4200'],
    credentials: true
}));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// ... rest of the existing code ... 