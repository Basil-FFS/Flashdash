require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.dxrbrhfhpzurrjwbhxhw:DBpass%40123456%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  console.log('Testing Supabase database connection...');
  console.log('Connection string:', connectionString.replace(/:[^:@]*@/, ':****@')); // Hide password
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result.rows[0]);
    
    // Check if users table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ Users table exists');
      
      // Count users
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log('✅ User count:', userCount.rows[0].count);
    } else {
      console.log('⚠️  Users table does not exist');
      console.log('Creating users table...');
      
      // Create the users table
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user'
        );
      `);
      console.log('✅ Users table created successfully');
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error code:', err.code);
    console.error('Error details:', err);
  } finally {
    await pool.end();
  }
}

testConnection(); 