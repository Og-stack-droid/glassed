const http = require('http');

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    console.log('=== HEALTH ===');
    const health = await getJson('/health');
    console.log(health.status, health.body);

    console.log('=== LOGIN ===');
    const login = await postJson('/api/auth/login', { username: 'admin', password: 'graycieofficialadmin123' });
    console.log(login.status, login.body);

    console.log('=== PRODUCTS ===');
    const products = await getJson('/api/products');
    console.log(products.status, products.body);
  } catch (err) {
    console.error(err);
  }
})();