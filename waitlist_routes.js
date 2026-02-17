// Waitlist API routes for TrustLink
// Add these routes to your server_complete.js

const express = require('express');
const router = express.Router();

// ===== PUBLIC ENDPOINT: Join waitlist =====
router.post('/api/waitlist', async (req, res) => {
    try {
        const { name, email, phone, actor_type, city, referral_source } = req.body;

        // Validation
        if (!name || !email || !phone || !actor_type) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['name', 'email', 'phone', 'actor_type']
            });
        }

        // Validate actor_type
        const validActorTypes = ['vendor', 'buyer', 'rider'];
        if (!validActorTypes.includes(actor_type)) {
            return res.status(400).json({ 
                error: 'Invalid actor_type',
                valid_types: validActorTypes
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Insert into database
        const result = await pool.query(
            `INSERT INTO waitlist (name, email, phone, actor_type, city, referral_source)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, actor_type, created_at`,
            [name, email.toLowerCase().trim(), phone, actor_type, city, referral_source]
        );

        console.log(`✅ New waitlist signup: ${email} (${actor_type})`);

        res.status(201).json({
            success: true,
            message: 'Successfully joined the waitlist!',
            data: result.rows[0]
        });

    } catch (error) {
        // Handle duplicate email
        if (error.code === '23505') { // PostgreSQL unique violation
            return res.status(409).json({ 
                error: 'Email already registered',
                message: 'This email is already on our waitlist!'
            });
        }

        console.error('❌ Waitlist signup error:', error);
        res.status(500).json({ 
            error: 'Failed to join waitlist',
            message: 'Please try again later'
        });
    }
});

// ===== ADMIN ENDPOINTS =====

// Simple admin auth middleware (improve this in production!)
const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
};

// Get all waitlist entries with filters
router.get('/api/admin/waitlist', adminAuth, async (req, res) => {
    try {
        const { actor_type, city, notified, limit = 100, offset = 0 } = req.query;

        let query = 'SELECT * FROM waitlist WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (actor_type) {
            query += ` AND actor_type = $${paramCount}`;
            params.push(actor_type);
            paramCount++;
        }

        if (city) {
            query += ` AND city ILIKE $${paramCount}`;
            params.push(`%${city}%`);
            paramCount++;
        }

        if (notified !== undefined) {
            query += ` AND notified = $${paramCount}`;
            params.push(notified === 'true');
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);
        const countResult = await pool.query('SELECT COUNT(*) FROM waitlist');

        res.json({
            total: parseInt(countResult.rows[0].count),
            count: result.rows.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: result.rows
        });

    } catch (error) {
        console.error('❌ Admin waitlist fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch waitlist' });
    }
});

// Get waitlist statistics
router.get('/api/admin/waitlist/stats', adminAuth, async (req, res) => {
    try {
        const stats = await pool.query('SELECT * FROM waitlist_stats');
        const cityStats = await pool.query('SELECT * FROM waitlist_by_city LIMIT 10');
        
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM waitlist');
        
        res.json({
            total: parseInt(totalResult.rows[0].total),
            by_actor_type: stats.rows,
            top_cities: cityStats.rows
        });

    } catch (error) {
        console.error('❌ Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Mark entry as notified
router.patch('/api/admin/waitlist/:id/notify', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const result = await pool.query(
            `UPDATE waitlist 
             SET notified = true, notes = COALESCE($2, notes)
             WHERE id = $1
             RETURNING *`,
            [id, notes]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Mark notified error:', error);
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

// Export CSV of waitlist
router.get('/api/admin/waitlist/export', adminAuth, async (req, res) => {
    try {
        const { actor_type } = req.query;

        let query = 'SELECT * FROM waitlist';
        const params = [];

        if (actor_type) {
            query += ' WHERE actor_type = $1';
            params.push(actor_type);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        // Generate CSV
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Actor Type', 'City', 'Referral Source', 'Created At', 'Notified', 'Notes'];
        const csv = [
            headers.join(','),
            ...result.rows.map(row => [
                row.id,
                `"${row.name}"`,
                row.email,
                row.phone,
                row.actor_type,
                row.city || '',
                row.referral_source || '',
                row.created_at,
                row.notified,
                `"${row.notes || ''}"`
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=trustlink-waitlist-${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('❌ Export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

module.exports = router;

// ===== INTEGRATION INSTRUCTIONS =====
// 
// In your server_complete.js, add:
// 
// 1. At the top with other requires:
//    const waitlistRoutes = require('./waitlist_routes');
// 
// 2. After your other middleware but before error handlers:
//    app.use(waitlistRoutes);
// 
// 3. In your .env file, add:
//    ADMIN_KEY=your_secure_random_key_here
// 
// 4. Run the schema:
//    psql -d trustlink -f waitlist_schema.sql
//