# Graycie Glasses Backend (SQLite + JWT) — Flask

This folder contains the backend code for the Graycie Glasses demo.

## Setup
```bat
cd glassed\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run
```bat
python app.py
```

Server:
- http://localhost:3001

## Default admin
- username: `admin`
- password: `graycie2026`

## API
- `POST /api/auth/login` => `{ token }`
- `GET /api/products` => `{ products: [...] }`
- `POST /api/products` (Bearer token) => `{ product }`
- `DELETE /api/products/<id>` (Bearer token) => `{ ok: true }`

