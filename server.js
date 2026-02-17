// TrustLink Waitlist - Test Server
// Minimal server to test waitlist functionality

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Database Connection =====
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected at:', res.rows[0].now);
});

// Make pool available globally for routes
global.pool = pool;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===== Static Files =====
app.use(express.static('public'));

// ===== Routes =====

// Import waitlist routes
const waitlistRoutes = require('./waitlist_routes');
app.use(waitlistRoutes);

// Serve admin dashboard
app.get('/admin/waitlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'waitlist_admin.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Root route - Serve modern landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 TrustLink Waitlist Test Server');
    console.log('='.repeat(50));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin/waitlist`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, closing server...');
    pool.end(() => {
        console.log('✅ Database pool closed');
        process.exit(0);
    });
});