import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "data.sqlite"))
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-change-me")
JWT_EXPIRES_DAYS = int(os.environ.get("JWT_EXPIRES_DAYS", "7"))

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "graycie2026")

SEED_PRODUCTS = [
    {"name": "Lagosian Gold Aviator", "list": "Sunglasses", "price": 189,
     "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80"},
    {"name": "Atelier Round — Tortoise", "list": "Sunglasses", "price": 165,
     "image_url": "https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80"},
    {"name": "Victoria Cat-Eye", "list": "Sunglasses", "price": 210,
     "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80"},
    {"name": "Adeola Square Frame", "list": "Eyeglasses", "price": 145,
     "image_url": "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80"},
    {"name": "Onyx Wraparound", "list": "Sunglasses", "price": 175,
     "image_url": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&q=80"},
    {"name": "Heritage Wire-Rim", "list": "Eyeglasses", "price": 132,
     "image_url": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80"},
]

app = Flask(__name__)
CORS(app)


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(BASE_DIR, exist_ok=True)
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("PRAGMA journal_mode = WAL")

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          list TEXT NOT NULL,
          price REAL NOT NULL CHECK(price >= 0),
          image_url TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )

    cur.execute("CREATE INDEX IF NOT EXISTS idx_products_list ON products(list)")

    # Seed admin
    cur.execute("SELECT id FROM admins WHERE username = ?", (ADMIN_USERNAME,))
    row = cur.fetchone()
    if row is None:
        pw_hash = generate_password_hash(ADMIN_PASSWORD)
        cur.execute(
            "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
            (ADMIN_USERNAME, pw_hash),
        )

    # Seed products if empty
    cur.execute("SELECT COUNT(*) as c FROM products")
    c = cur.fetchone()["c"]
    if c == 0:
        cur.executemany(
            "INSERT INTO products (name, list, price, image_url) VALUES (?, ?, ?, ?)",
            [(p["name"], p["list"], float(p["price"]), p.get("image_url")) for p in SEED_PRODUCTS],
        )

    conn.commit()
    conn.close()


def auth_required(fn):
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.split(" ", 1)[1] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            return fn(payload, *args, **kwargs)
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
    wrapper.__name__ = fn.__name__
    return wrapper


@app.get("/api/health")
def health():
    return jsonify({"ok": True})


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password_hash FROM admins WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    exp = datetime.utcnow() + timedelta(days=JWT_EXPIRES_DAYS)
    token = jwt.encode({"sub": row["id"], "username": row["username"], "exp": exp}, JWT_SECRET, algorithm="HS256")

    return jsonify({"token": token})


@app.get("/api/products")
def list_products():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, list, price, image_url FROM products ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()

    products = [
        {
            "id": r["id"],
            "name": r["name"],
            "list": r["list"],
            "price": r["price"],
            "imageUrl": r["image_url"],
        }
        for r in rows
    ]
    return jsonify({"products": products})


@app.post("/api/products")
@auth_required
def create_product(payload):
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    list_name = (data.get("list") or "").strip()
    price = data.get("price")
    image_url = data.get("imageUrl") or data.get("image_url")

    if not name or not list_name:
        return jsonify({"error": "name and list are required"}), 400

    try:
        price_f = float(price)
    except Exception:
        return jsonify({"error": "price must be a number"}), 400

    if price_f < 0:
        return jsonify({"error": "price must be >= 0"}), 400

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO products (name, list, price, image_url) VALUES (?, ?, ?, ?)",
        (name, list_name, price_f, image_url)
    )
    new_id = cur.lastrowid
    cur.execute("SELECT id, name, list, price, image_url FROM products WHERE id = ?", (new_id,))
    r = cur.fetchone()
    conn.commit()
    conn.close()

    product = {
        "id": r["id"],
        "name": r["name"],
        "list": r["list"],
        "price": r["price"],
        "imageUrl": r["image_url"],
    }
    return jsonify({"product": product}), 201


@app.delete("/api/products/<int:product_id>")
@auth_required
def delete_product(payload, product_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM products WHERE id = ?", (product_id,))
    changes = cur.rowcount
    conn.commit()
    conn.close()

    if changes == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "3001"))
    app.run(host="0.0.0.0", port=port, debug=False)

