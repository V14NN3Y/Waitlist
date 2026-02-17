-- Waitlist table for TrustLink
-- Stores pre-launch sign-ups for vendors, buyers, and riders

CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('vendor', 'buyer', 'rider')),
    city VARCHAR(100),
    referral_source VARCHAR(100), -- How they heard about us (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified BOOLEAN DEFAULT FALSE, -- Track if they've been contacted
    notes TEXT, -- Admin notes
    
    -- Prevent duplicate emails
    CONSTRAINT unique_email UNIQUE (email)
);

-- Index for faster queries
CREATE INDEX idx_waitlist_actor_type ON waitlist(actor_type);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_city ON waitlist(city);

-- View for quick stats
CREATE OR REPLACE VIEW waitlist_stats AS
SELECT 
    actor_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN notified = true THEN 1 END) as notified_count,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24_hours
FROM waitlist
GROUP BY actor_type;

-- View for city distribution
CREATE OR REPLACE VIEW waitlist_by_city AS
SELECT 
    city,
    actor_type,
    COUNT(*) as count
FROM waitlist
WHERE city IS NOT NULL
GROUP BY city, actor_type
ORDER BY count DESC;
