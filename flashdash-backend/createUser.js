require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Use DATABASE_URL from your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.dxrbrhfhpzurrjwbhxhw:DBpass%40123456%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function questionAsync(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    const email = await questionAsync('Enter user email: ');
    const name = await questionAsync('Enter user name: ');
    const password = await questionAsync('Enter password: ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = 'admin'; // default role

    const query = `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [name.trim(), email.trim(), hashedPassword, role];

    const result = await pool.query(query, values);
    console.log(`User created with ID: ${result.rows[0].id}`);

  } catch (err) {
    console.error('Error creating user:', err);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
