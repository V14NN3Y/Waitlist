# TrustLink Waitlist - Integration Guide

## 📋 What you got

1. **waitlist_schema.sql** - Database schema
2. **waitlist_routes.js** - API endpoints
3. **waitlist_admin.html** - Admin dashboard
4. **This guide** - Step-by-step integration

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Database Setup

```bash
# Apply the waitlist schema to your database
psql -d trustlink -f waitlist_schema.sql

# Or if using DATABASE_URL:
psql $DATABASE_URL -f waitlist_schema.sql
```

This creates:
- `waitlist` table
- `waitlist_stats` view
- `waitlist_by_city` view

### Step 2: Environment Variables

Add to your `.env` file:

```env
# Admin dashboard access key
ADMIN_KEY=your_super_secure_random_key_here
```

Generate a secure key:
```bash
openssl rand -hex 32
```

### Step 3: Integrate Routes

In your `server_complete.js`:

```javascript
// 1. Add at the top with other requires
const waitlistRoutes = require('./waitlist_routes');

// 2. Add after middleware setup (before error handlers)
app.use(waitlistRoutes);

// 3. Serve the admin dashboard (add this route)
app.get('/admin/waitlist', (req, res) => {
    res.sendFile(__dirname + '/waitlist_admin.html');
});
```

### Step 4: Test It!

```bash
# Restart your server
npm start

# Test the public endpoint
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "actor_type": "vendor",
    "city": "Lagos"
  }'

# Access admin dashboard
# Open: http://localhost:3000/admin/waitlist
# Enter your ADMIN_KEY when prompted
```

---

## 📡 API Endpoints

### Public Endpoint (for landing page)

**POST /api/waitlist**

Join the waitlist.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "actor_type": "vendor",  // "vendor", "buyer", or "rider"
  "city": "Lagos",         // optional
  "referral_source": "Twitter"  // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "actor_type": "vendor",
    "created_at": "2024-02-17T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing/invalid fields
- `409` - Email already registered
- `500` - Server error

### Admin Endpoints (requires X-Admin-Key header)

**GET /api/admin/waitlist**

Get all entries with optional filters.

Query params:
- `actor_type` - Filter by vendor/buyer/rider
- `city` - Filter by city (partial match)
- `notified` - Filter by notification status (true/false)
- `limit` - Max results (default: 100)
- `offset` - Pagination offset (default: 0)

**GET /api/admin/waitlist/stats**

Get statistics and insights.

**PATCH /api/admin/waitlist/:id/notify**

Mark an entry as notified.

**GET /api/admin/waitlist/export**

Download CSV export.

Query params:
- `actor_type` - Export only specific type (optional)

---

## 🎨 For Your Landing Page Developer

Give them this contract:

```javascript
// Endpoint to call
const API_ENDPOINT = 'https://your-api.com/api/waitlist';

// Example integration
async function joinWaitlist(formData) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      actor_type: formData.type,  // "vendor", "buyer", or "rider"
      city: formData.city,
      referral_source: formData.source
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    // Success! Show thank you message
    console.log('Joined waitlist:', data);
    return { success: true };
  } else {
    // Handle error
    if (response.status === 409) {
      // Email already registered
      alert('This email is already on our waitlist!');
    } else {
      // Other error
      alert(data.message || 'Failed to join waitlist');
    }
    return { success: false, error: data };
  }
}
```

### Required Fields
- `name` - Full name
- `email` - Valid email address
- `phone` - Phone number (format flexible)
- `actor_type` - Must be "vendor", "buyer", or "rider"

### Optional Fields
- `city` - Location
- `referral_source` - How they heard about TrustLink

---

## 🔒 Security Notes

1. **Admin Key**: Keep `ADMIN_KEY` secret! Don't commit to git.

2. **Production Improvements**:
   ```javascript
   // In production, add rate limiting
   const rateLimit = require('express-rate-limit');
   
   const waitlistLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 requests per IP
     message: 'Too many signups, please try again later'
   });
   
   app.post('/api/waitlist', waitlistLimiter, ...);
   ```

3. **Email Validation**: Consider adding email verification (send confirmation email).

4. **CORS**: If landing page is on different domain:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: 'https://your-landing-page.com'
   }));
   ```

---

## 📊 Database Views Explained

### waitlist_stats
Quick overview by actor type:
```sql
SELECT * FROM waitlist_stats;
```

Returns:
- `total_count` - Total signups per type
- `notified_count` - How many contacted
- `last_7_days` - Recent signups
- `last_24_hours` - Today's signups

### waitlist_by_city
Geographic distribution:
```sql
SELECT * FROM waitlist_by_city;
```

Returns top cities by signup count.

---

## 🧪 Testing Checklist

- [ ] Database schema applied
- [ ] Environment variables set
- [ ] Routes integrated in server
- [ ] Admin dashboard accessible
- [ ] Can POST to /api/waitlist
- [ ] Duplicate email rejected (409)
- [ ] Admin stats loading
- [ ] Export CSV works
- [ ] Landing page can connect

---

## 🆘 Troubleshooting

**"relation waitlist does not exist"**
→ Run the schema file: `psql $DATABASE_URL -f waitlist_schema.sql`

**"Unauthorized" on admin endpoints**
→ Check X-Admin-Key header matches ADMIN_KEY in .env

**CORS errors from landing page**
→ Add CORS middleware (see security notes above)

**Duplicate key error**
→ This is expected! Email already exists in waitlist

---

## 🎯 Next Steps

1. **Email Notifications**: Set up automated welcome emails
2. **Analytics**: Track conversion rates
3. **Invite System**: Send launch invites to waitlist
4. **Referral Program**: Track who refers the most people

---

## 📞 Support

Questions? Check the main TrustLink README or contact the team.

Good luck with the pre-launch! 🚀