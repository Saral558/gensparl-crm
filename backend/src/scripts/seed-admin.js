require('dotenv').config({ path: '../../.env' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const name = 'Admin User';
  const email = 'admin@dineshcrm.com';
  const password = 'adminpassword123';
  const role = 'admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      [name, email, hashedPassword, role]
    );
    console.log(`✅ Admin user created: ${email} / ${password}`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
