const bcrypt = require('bcryptjs');
const hash = '$2a$10$nFnVMuEo4.9mafjSFFQ3a.JJMr/fT88opJXwKKJ.rPJrAj.6ZKRGm';
const candidates = ['graycieofficialadmin123', 'GraycieApp2026!', 'graycie2026', 'admin', 'password', 'admin123', 'hello@graycieglasses.com'];
(async () => {
  for (const p of candidates) {
    const ok = await bcrypt.compare(p, hash);
    console.log(p, ok);
  }
})();