# Waitlist API Tests

## Test with cURL

### 1. Join Waitlist (Public - No Auth Required)

# Vendor signup
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chioma Adebayo",
    "email": "chioma@example.com",
    "phone": "+2348012345678",
    "actor_type": "vendor",
    "city": "Lagos",
    "referral_source": "Twitter"
  }'

# Buyer signup
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emeka Okonkwo",
    "email": "emeka@example.com",
    "phone": "+2348087654321",
    "actor_type": "buyer",
    "city": "Abuja"
  }'

# Rider signup
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aisha Mohammed",
    "email": "aisha@example.com",
    "phone": "+2348011111111",
    "actor_type": "rider",
    "city": "Port Harcourt"
  }'

### 2. Test Duplicate Email (Should return 409)
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chioma Adebayo",
    "email": "chioma@example.com",
    "phone": "+2348012345678",
    "actor_type": "vendor",
    "city": "Lagos"
  }'

### 3. Test Validation Errors

# Missing required field
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }'

# Invalid actor_type
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test2@example.com",
    "phone": "+2348011111111",
    "actor_type": "invalid_type"
  }'

# Invalid email format
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "not-an-email",
    "phone": "+2348011111111",
    "actor_type": "buyer"
  }'

---

## Admin Endpoints (Requires ADMIN_KEY)

# Replace YOUR_ADMIN_KEY with your actual key from .env

### Get All Entries
curl http://localhost:3000/api/admin/waitlist \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"

### Filter by Actor Type
curl "http://localhost:3000/api/admin/waitlist?actor_type=vendor" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"

### Filter by City
curl "http://localhost:3000/api/admin/waitlist?city=Lagos" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"

### Get Statistics
curl http://localhost:3000/api/admin/waitlist/stats \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"

### Mark as Notified
curl -X PATCH http://localhost:3000/api/admin/waitlist/1/notify \
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Sent launch invitation email"
  }'

### Export CSV
curl http://localhost:3000/api/admin/waitlist/export \
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \
  -o waitlist-export.csv

### Export Vendors Only
curl "http://localhost:3000/api/admin/waitlist/export?actor_type=vendor" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \
  -o vendors-export.csv

---

## Test with Postman

### Collection Setup

1. Create a new collection "TrustLink Waitlist"

2. Add environment variables:
   - `base_url`: http://localhost:3000
   - `admin_key`: your_admin_key_here

3. Import these requests:

**POST Join Waitlist**
- URL: `{{base_url}}/api/waitlist`
- Method: POST
- Headers: Content-Type: application/json
- Body:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+2348012345678",
  "actor_type": "vendor",
  "city": "Lagos"
}
```

**GET Admin Stats**
- URL: `{{base_url}}/api/admin/waitlist/stats`
- Method: GET
- Headers: X-Admin-Key: {{admin_key}}

**GET All Entries**
- URL: `{{base_url}}/api/admin/waitlist`
- Method: GET
- Headers: X-Admin-Key: {{admin_key}}

---

## Quick PostgreSQL Queries

### Check your waitlist
```sql
SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 10;
```

### Count by actor type
```sql
SELECT actor_type, COUNT(*) as count 
FROM waitlist 
GROUP BY actor_type;
```

### Recent signups (last 24 hours)
```sql
SELECT * FROM waitlist 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Top cities
```sql
SELECT city, COUNT(*) as count 
FROM waitlist 
WHERE city IS NOT NULL
GROUP BY city 
ORDER BY count DESC 
LIMIT 10;
```

### Not yet notified
```sql
SELECT * FROM waitlist 
WHERE notified = false
ORDER BY created_at ASC;
```

---

## Expected Responses

### Success (201)
```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "data": {
    "id": 1,
    "name": "Chioma Adebayo",
    "email": "chioma@example.com",
    "actor_type": "vendor",
    "created_at": "2024-02-17T10:30:00.000Z"
  }
}
```

### Duplicate Email (409)
```json
{
  "error": "Email already registered",
  "message": "This email is already on our waitlist!"
}
```

### Validation Error (400)
```json
{
  "error": "Invalid actor_type",
  "valid_types": ["vendor", "buyer", "rider"]
}
```

### Stats Response
```json
{
  "total": 42,
  "by_actor_type": [
    {
      "actor_type": "vendor",
      "total_count": "15",
      "notified_count": "3",
      "last_7_days": "10",
      "last_24_hours": "2"
    }
  ],
  "top_cities": [
    {
      "city": "Lagos",
      "actor_type": "vendor",
      "count": "8"
    }
  ]
}
```