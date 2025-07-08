const db = require("./db");
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('=== Create Admin User ===');
    console.log('This script will create the first admin user for FlashDash.');
    console.log('Since signup is disabled, this is the only way to create users initially.\n');

    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    if (!name || !email || !password) {
      console.log('All fields are required!');
      rl.close();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the admin user
    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, 'admin']
    );

    const user = result.rows[0];
    console.log('\n✅ Admin user created successfully!');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log('\nYou can now log in to the admin panel and create additional users.');

  } catch (error) {
    if (error.code === '23505') {
      console.log('❌ Error: Email already exists!');
    } else {
      console.log('❌ Error creating admin user:', error.message);
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdminUser(); 