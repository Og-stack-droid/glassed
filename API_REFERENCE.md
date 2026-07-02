# Graycie Glasses - API Reference & Quick Setup

## ⚡ 30-Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Import database (MySQL must be running)
mysql -u root -p < database.sql

# 3. Update .env with your MySQL password
# Edit .env and change DB_PASSWORD

# 4. Start backend
node server.js

# 5. Open frontend in browser
# Open index.html in your web browser
```

---

## 🔑 Default Admin Login

```
Username: admin
Password: graycieofficialadmin123
```

---

## 📡 Complete API Reference

### Base URL
```
http://localhost:3001/api
```

---

### 🔐 Authentication

#### POST `/auth/login`
Login with admin credentials

**Request:**
```json
{
  "username": "admin",
  "password": "graycieofficialadmin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**Error (401):**
```json
{ "error": "Invalid credentials" }
```

**Usage in Frontend:**
```javascript
const token = await apiLoginAdmin(password);
localStorage.setItem("adminToken", token);
```

---

### 📦 Products

#### GET `/products`
Get all products (public endpoint)

**Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Lagosian Gold Aviator",
      "list": "Sunglasses",
      "price": 189.00,
      "imageUrl": "data:image/jpeg;base64/9j/4AAQSkZJRg..."
    },
    {
      "id": 2,
      "name": "Atelier Round — Tortoise",
      "list": "Sunglasses",
      "price": 165.00,
      "imageUrl": "data:image/jpeg;base64/..."
    }
  ]
}
```

---

#### GET `/products/:id`
Get single product by ID

**URL:** `/api/products/1`

**Response (200):**
```json
{
  "product": {
    "id": 1,
    "name": "Lagosian Gold Aviator",
    "list": "Sunglasses",
    "price": 189.00,
    "imageUrl": "data:image/jpeg;base64/..."
  }
}
```

**Error (404):**
```json
{ "error": "Product not found" }
```

---

#### POST `/products`
Create new product (requires authentication)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Victoria Cat-Eye",
  "list": "Sunglasses",
  "price": 210,
  "imageUrl": "data:image/jpeg;base64/9j/4AAQSkZJRg..."
}
```

**Response (201):**
```json
{
  "message": "Product created successfully",
  "productId": 3
}
```

**Error (401):**
```json
{ "error": "No token provided" }
```

**Error (400):**
```json
{ "error": "Name, category, price, and image are required" }
```

**Frontend Usage:**
```javascript
const token = localStorage.getItem("adminToken");
await apiAddProduct(name, category, price, imageData, token);
```

---

#### PUT `/products/:id`
Update product (requires authentication)

**Headers:**
```
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Frame Name",
  "list": "Eyeglasses",
  "price": 175,
  "imageUrl": "data:image/jpeg;base64/..."
}
```

**Response (200):**
```json
{ "message": "Product updated successfully" }
```

**Note:** Image is optional. If not provided, only name, category, and price are updated.

---

#### DELETE `/products/:id`
Delete product (requires authentication)

**Headers:**
```
Authorization: Bearer TOKEN
```

**URL:** `/api/products/3`

**Response (200):**
```json
{ "message": "Product deleted successfully" }
```

**Error (404):**
```json
{ "error": "Product not found" }
```

**Frontend Usage:**
```javascript
const token = localStorage.getItem("adminToken");
await apiDeleteProduct(id, token);
```

---

### 🏥 Health Check

#### GET `/health`
Check if server is running

**Response (200):**
```json
{ "status": "Server is running" }
```

---

## 🔍 Test API with cURL

### Get All Products
```bash
curl http://localhost:3001/api/products
```

### Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"graycieofficialadmin123"}'
```

### Add Product (replace TOKEN)
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{
    "name": "New Glasses",
    "list": "Sunglasses",
    "price": 199,
    "imageUrl": "data:image/jpeg;base64/..."
  }'
```

### Delete Product (replace TOKEN and ID)
```bash
curl -X DELETE http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer TOKEN_HERE"
```

---

## 🗂️ Image Format

Images are stored as **Base64 Data URLs**:

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...
```

### When Adding Products:
1. User selects image in browser
2. Frontend converts to Base64 using FileReader
3. Sent to backend as `imageUrl` field
4. Stored in MySQL `LONGTEXT` field

### Pros:
- No separate file storage needed
- Images included in database
- Easy to backup

### Cons:
- Database gets large with many products
- Not ideal for very large collections

### Optimization (Future):
Switch to cloud storage (AWS S3, Cloudinary) for production.

---

## 🔧 Environment Variables Reference

```env
# Server
PORT=3001                              # Server port
NODE_ENV=development                   # development or production

# Database
DB_HOST=localhost                      # MySQL host
DB_USER=root                           # MySQL user
DB_PASSWORD=your_password              # MySQL password
DB_NAME=graycie_glasses                # Database name
DB_PORT=3306                           # MySQL port

# Security
JWT_SECRET=your_jwt_secret_here        # Change this in production!

# Admin Contact (used in frontend)
ADMIN_WHATSAPP_NUMBER=2348000000000   # WhatsApp number
ADMIN_EMAIL=hello@graycieglasses.com   # Email address
ADMIN_TIKTOK=@graycieglasses          # TikTok handle
ADMIN_INSTAGRAM=@graycieglasses       # Instagram handle
```

---

## 📋 Frontend Configuration

In `index.html`, update this section with your details:

```javascript
const CONFIG = {
  ADMIN_WHATSAPP_NUMBER: "2348000000000",
  ADMIN_EMAIL: "hello@graycieglasses.com",
  ADMIN_TIKTOK: "@graycieglasses",
  ADMIN_INSTAGRAM: "@graycieglasses"
};
```

---

## ⚙️ Database Queries

### View All Products
```sql
SELECT * FROM products;
```

### View Admin Details
```sql
SELECT username, email FROM admins;
```

### Delete All Products
```sql
DELETE FROM products;
```

### Reset Products to Seed Data
```sql
DELETE FROM products;
INSERT INTO products (name, list, price, imageUrl) VALUES
('Lagosian Gold Aviator', 'Sunglasses', 189, 'https://...'),
('Atelier Round — Tortoise', 'Sunglasses', 165, 'https://...'),
('Victoria Cat-Eye', 'Sunglasses', 210, 'https://...'),
('Adeola Square Frame', 'Eyeglasses', 145, 'https://...'),
('Onyx Wraparound', 'Sunglasses', 175, 'https://...'),
('Heritage Wire-Rim', 'Eyeglasses', 132, 'https://...');
```

---

## 🐛 Common Errors & Fixes

### Error: "No token provided"
- **Cause**: Admin not logged in
- **Fix**: Login first with correct credentials

### Error: "Invalid token"
- **Cause**: Token expired or malformed
- **Fix**: Login again to get new token

### Error: "Product not found"
- **Cause**: Product ID doesn't exist
- **Fix**: Check product ID, get list with GET /products

### Error: "Name, category, price, and image are required"
- **Cause**: Missing required fields
- **Fix**: Ensure all fields are provided

### Error: "connect ECONNREFUSED"
- **Cause**: Backend not running
- **Fix**: Start backend with `node server.js`

### Error: "Client does not support authentication protocol"
- **Cause**: MySQL password issue
- **Fix**: Check DB_PASSWORD in .env matches your MySQL password

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Change `JWT_SECRET` in .env
- [ ] Change `DB_PASSWORD` to secure password
- [ ] Change admin password
- [ ] Update `API_BASE_URL` in frontend to production URL
- [ ] Update WhatsApp, Email, TikTok, Instagram in CONFIG
- [ ] Enable HTTPS
- [ ] Setup automated backups for MySQL
- [ ] Add rate limiting to API
- [ ] Setup proper error logging
- [ ] Test all admin functions
- [ ] Test checkout flow
- [ ] Test wishlist/cart functionality

---

## 📞 Support Files

- `server.js` - Backend API
- `database.sql` - Database schema
- `.env` - Environment configuration
- `index.html` - Frontend with API integration
- `README.md` - Full setup guide
- This file - Quick reference

---

## 🎯 Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (index.html)            │
│  ✓ Products display                     │
│  ✓ Shopping cart                        │
│  ✓ Admin dashboard                      │
└────────────────┬────────────────────────┘
                 │ HTTP Requests
                 ↓
    ┌────────────────────────────┐
    │  Backend (server.js)       │
    │  Express.js API            │
    │  ✓ /api/products           │
    │  ✓ /api/auth/login         │
    └────────────────┬───────────┘
                     │ SQL Queries
                     ↓
       ┌─────────────────────────┐
       │  Database (MySQL)       │
       │  ✓ products table       │
       │  ✓ admins table         │
       └─────────────────────────┘
```

---

## 📚 Resources

- Express.js Docs: https://expressjs.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- JWT.io: https://jwt.io/
- bcryptjs: https://www.npmjs.com/package/bcryptjs

---

**Last Updated**: June 2026
**Version**: 1.0.0
