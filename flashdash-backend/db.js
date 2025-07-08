const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.dxrbrhfhpzurrjwbhxhw:DBpass%40123456%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 20, // maximum number of clients in the pool
  min: 2, // minimum number of clients in the pool
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to Supabase database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
