const db = require("./db");

async function testUser() {
  try {
    console.log('🔍 Testing user lookup...');
    
    const email = 'basil@flashfundingsolutions.com';
    console.log('Looking for email:', email);
    
    // Try exact match first
    let result = await db.query("SELECT id, name, email, role, password_hash FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found with exact email match');
      
      // Try case-insensitive match
      console.log('🔍 Trying case-insensitive search...');
      result = await db.query("SELECT id, name, email, role, password_hash FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      
      if (result.rows.length === 0) {
        console.log('❌ User not found with case-insensitive search either');
        
        // List all users to see what's in the database
        console.log('📋 Listing all users in database:');
        const allUsers = await db.query("SELECT id, name, email, role FROM users");
        allUsers.rows.forEach(user => {
          console.log(`  - ${user.email} (${user.name}, ${user.role})`);
        });
        
        return;
      }
    }
    
    const user = result.rows[0];
    console.log('✅ User found in database:');
    console.log('  ID:', user.id);
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Password Hash:', user.password_hash ? 'Present' : 'Missing');
    console.log('  Hash Length:', user.password_hash ? user.password_hash.length : 0);
    
    // Check if password hash looks like bcrypt
    if (user.password_hash && user.password_hash.startsWith('$2b$')) {
      console.log('✅ Password hash appears to be valid bcrypt format');
    } else {
      console.log('❌ Password hash does not appear to be bcrypt format');
    }
    
  } catch (error) {
    console.error('❌ Error testing user:', error);
  } finally {
    process.exit(0);
  }
}

testUser(); 