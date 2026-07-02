const express = require("express");
const mysql = require("mysql2/promise");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ============================================================
   MIDDLEWARE
============================================================ */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ============================================================
   DATABASE CONNECTION POOL
============================================================ */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "graycie_app",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "graycie_glasses",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const ADMIN_USERNAME = process.env.GRAYCIE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.GRAYCIE_ADMIN_PASSWORD || "graycieofficialadmin123";

const ensureAdminAccount = async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, password FROM admins WHERE username = ?",
      [ADMIN_USERNAME]
    );

    if (rows.length === 0) {
      const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
      await conn.query(
        "INSERT INTO admins (username, password, email) VALUES (?, ?, ?)",
        [ADMIN_USERNAME, hashedPassword, process.env.ADMIN_EMAIL || "hello@graycieglasses.com"]
      );
      console.log(`Created default admin user '${ADMIN_USERNAME}'`);
    } else if (ADMIN_PASSWORD) {
      const admin = rows[0];
      const passwordMatches = await isPasswordValid(ADMIN_PASSWORD, admin.password);
      if (!passwordMatches) {
        const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
        await conn.query("UPDATE admins SET password = ? WHERE id = ?", [hashedPassword, admin.id]);
        console.log(`Updated password for admin user '${ADMIN_USERNAME}' from environment configuration.`);
      }
    }

    conn.release();
  } catch (err) {
    console.error("Admin account initialization failed:", err);
  }
};

/* ============================================================
   AUTHENTICATION MIDDLEWARE
============================================================ */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "graycie-dev-secret");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isPasswordValid = async (inputPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (storedPassword === inputPassword) return true;

  try {
    return await bcryptjs.compare(inputPassword, storedPassword);
  } catch (err) {
    return false;
  }
};

/* ============================================================
   AUTH ENDPOINTS
============================================================ */

/**
 * POST /api/auth/login
 * Login with username and password
 * Returns JWT token on success
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password required" });
    }

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, username, password FROM admins WHERE username = ?",
      [username]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = rows[0];
    const passwordMatches = await isPasswordValid(password, admin.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || "graycie-dev-secret",
      { expiresIn: "30d" }
    );

    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   PRODUCT ENDPOINTS
============================================================ */

/**
 * GET /api/products
 * Fetch all products
 */
app.get("/api/products", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, name, list, price, imageUrl FROM products ORDER BY created_at DESC"
    );
    conn.release();

    res.json({ products: rows });
  } catch (err) {
    console.error("GET products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:id
 * Fetch single product by ID
 */
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT id, name, list, price, imageUrl FROM products WHERE id = ?",
      [id]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product: rows[0] });
  } catch (err) {
    console.error("GET product error:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/**
 * POST /api/products
 * Create a new product (requires authentication)
 * Accepts image as base64 in imageUrl field
 */
app.post("/api/products", verifyToken, async (req, res) => {
  try {
    const { name, list, price, imageUrl } = req.body;

    if (!name || !list || !price || !imageUrl) {
      return res
        .status(400)
        .json({ error: "Name, category, price, and image are required" });
    }

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "INSERT INTO products (name, list, price, imageUrl) VALUES (?, ?, ?, ?)",
      [name, list, parseFloat(price), imageUrl]
    );
    conn.release();

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
    });
  } catch (err) {
    console.error("POST product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * PUT /api/products/:id
 * Update a product (requires authentication)
 */
app.put("/api/products/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, list, price, imageUrl } = req.body;

    if (!name || !list || !price) {
      return res
        .status(400)
        .json({ error: "Name, category, and price are required" });
    }

    const conn = await pool.getConnection();

    // Check if product exists
    const [existingProduct] = await conn.query(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Product not found" });
    }

    // Update product
    const updateQuery =
      "UPDATE products SET name = ?, list = ?, price = ?" +
      (imageUrl ? ", imageUrl = ?" : "") +
      " WHERE id = ?";

    const params = imageUrl
      ? [name, list, parseFloat(price), imageUrl, id]
      : [name, list, parseFloat(price), id];

    await conn.query(updateQuery, params);
    conn.release();

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("PUT product error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product (requires authentication)
 */
app.delete("/api/products/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();

    // Check if product exists
    const [existingProduct] = await conn.query(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Product not found" });
    }

    await conn.query("DELETE FROM products WHERE id = ?", [id]);
    conn.release();

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/* ============================================================
   HEALTH CHECK
============================================================ */
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

/* ============================================================
    404 HANDLER
============================================================ */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ============================================================
   ERROR HANDLER
============================================================ */
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* ============================================================
   START SERVER
============================================================ */
const startServer = async () => {
  await ensureAdminAccount();
  app.listen(PORT, () => {
    console.log(`Graycie Glasses Backend running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Database: ${process.env.DB_NAME}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

module.exports = app;