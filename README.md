# Graycie Glasses - Backend Setup & Integration Guide

## 📋 Overview

This package contains:
- **Backend**: Node.js + Express API server with MySQL database
- **Frontend**: Updated HTML with backend integration
- **Database**: MySQL schema with admin credentials and products

### Key Changes Made

✅ **Backend Created**
- Express.js server on port 3001
- JWT authentication for admin login
- RESTful API endpoints for products
- MySQL database integration

✅ **Frontend Modified**
- Removed hardcoded admin password
- Removed hardcoded product list (now loads from API)
- All data now fetches from backend API
- Admin token stored in localStorage after authentication

---

## 🚀 Quick Start

### 1. **Install Node.js Dependencies**

```bash
npm install
```

This installs:
- express (web framework)
- mysql2 (database driver)
- bcryptjs (password hashing)
- jsonwebtoken (auth tokens)
- cors (cross-origin requests)
- dotenv (environment variables)

### 2. **Setup MySQL Database**

#### Option A: Using MySQL Command Line

```bash
mysql -u root -p < database.sql
```

Then enter your MySQL password when prompted.

#### Option B: Using MySQL Workbench or phpMyAdmin

1. Open your MySQL client
2. Copy the entire content of `database.sql`
3. Paste and execute it

#### Option C: Using a GUI Tool

1. Create a new database named `graycie_glasses`
2. Import the `database.sql` file

---

### 3. **Configure Environment Variables**

Create or edit `.env` file:

```env
PORT=3001
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=graycie_glasses
DB_PORT=3306

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Admin Contact Details
ADMIN_WHATSAPP_NUMBER=2348000000000
ADMIN_EMAIL=hello@graycieglasses.com
ADMIN_TIKTOK=@graycieglasses
ADMIN_INSTAGRAM=@graycieglasses
```

**Important**: Update `DB_PASSWORD` with your actual MySQL password.

---

### 4. **Start the Backend Server**

```bash
node server.js
```

You should see:
```
🎯 Graycie Glasses Backend running on http://localhost:3001
Environment: development
Database: graycie_glasses
```

---

### 5. **Serve the Frontend**

Open `index.html` in a web browser or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js http-server
npx http-server
```

Then visit: `http://localhost:8000`

---

## 🔐 Admin Access

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `graycieofficialadmin123`

### Change Admin Password

To change the admin password:

1. Generate a new bcrypt hash:

```javascript
const bcryptjs = require('bcryptjs');
const password = 'your_new_password';
bcryptjs.hash(password, 10, (err, hash) => {
  console.log(hash);
});
```

2. Update the MySQL database:

```sql
UPDATE admins 
SET password = '$2a$10/YOUR_NEW_HASH_HERE' 
WHERE username = 'admin';
```

---

## 📡 API Endpoints

### Authentication

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "graycieofficialadmin123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

---

### Products

**GET** `/api/products`
- Fetch all products
- No authentication required

Response:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Lagosian Gold Aviator",
      "list": "Sunglasses",
      "price": 189,
      "imageUrl": "data:image/jpeg;base64,..."
    }
  ]
}
```

**GET** `/api/products/:id`
- Fetch single product
- No authentication required

**POST** `/api/products`
- Create new product (requires authentication)
- Header: `Authorization: Bearer TOKEN`

Request:
```json
{
  "name": "New Frame",
  "list": "Sunglasses",
  "price": 199,
  "imageUrl": "data:image/jpeg;base64,..."
}
```

**PUT** `/api/products/:id`
- Update product (requires authentication)
- Header: `Authorization: Bearer TOKEN`

**DELETE** `/api/products/:id`
- Delete product (requires authentication)
- Header: `Authorization: Bearer TOKEN`

---

## 📂 File Structure

```
graycie-glasses-backend/
├── server.js              # Express backend server
├── database.sql           # MySQL schema & sample data
├── .env                   # Environment variables (not in git)
├── package.json           # Node dependencies
├── index.html             # Modified frontend
└── README.md              # This file
```

---

## 🔗 Frontend to Backend Connection

The frontend is already configured to connect to the backend at `http://localhost:3001`.

### Key Changes in Frontend

1. **Removed**: Hardcoded password `ADMIN_PASSWORD`
2. **Removed**: `SEED_PRODUCTS` array
3. **Added**: `CONFIG` object with contact details only
4. **Updated**: All API calls to use the backend

### Frontend API Integration

```javascript
// Login API
const token = await apiLoginAdmin(password);
localStorage.setItem("adminToken", token);

// Get Products API
const products = await apiGetProducts();

// Add Product API
await apiAddProduct(name, category, price, imageData, token);

// Delete Product API
await apiDeleteProduct(id, token);
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
- MySQL server is not running
- Check your `DB_HOST` and `DB_PORT` in `.env`

### Error: "Access denied for user 'root'@'localhost'"
- Update `DB_PASSWORD` in `.env` with correct MySQL password

### Products not loading on frontend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify database is imported correctly

### Admin login fails
- Default credentials: `admin` / `graycieofficialadmin123`
- Check that admins table exists in database

---

## 📊 Database Schema

### `admins` table
```sql
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### `products` table
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  list VARCHAR(100),
  price DECIMAL(10, 2),
  imageUrl LONGTEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 🔒 Security Notes

### Before Production

1. **Change JWT_SECRET** in `.env` to a random, secure string
2. **Change MySQL password** for the database user
3. **Change admin password** (see "Change Admin Password" section)
4. **Use HTTPS** instead of HTTP
5. **Update API_BASE_URL** in frontend to production backend URL
6. **Add rate limiting** to prevent brute force attacks
7. **Add CORS restrictions** for specific domains

### Environment Variables

```env
# Production example
PORT=3001
NODE_ENV=production
DB_HOST=your-server.com
DB_USER=db_user
DB_PASSWORD=secure_password_here
DB_NAME=graycie_glasses
JWT_SECRET=generate_with_crypto.randomBytes(32).toString('hex')
```

---

## 📝 Adding Images

Images are stored as **base64 data URLs** in the database. This is suitable for small image collections. For production with many products, consider:

1. **Cloud Storage** (AWS S3, Cloudinary, Firebase)
2. **Local file server** with URL references
3. **CDN** for better performance

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup database: Run `database.sql`
3. ✅ Configure `.env` with your MySQL password
4. ✅ Start backend: `node server.js`
5. ✅ Open frontend: `index.html` in browser
6. ✅ Test admin login with default credentials
7. ✅ Add products through admin dashboard

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check server logs (terminal running `node server.js`)
4. Verify MySQL database is running

---

## 📜 License

© 2026 Graycie Glasses. All rights reserved.
