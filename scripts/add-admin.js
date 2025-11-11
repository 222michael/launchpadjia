const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || !trimmed) return;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
} else {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

async function addAdmin() {
  const email = process.argv[2];
  const name = process.argv[3] || email.split('@')[0];

  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('Usage: node scripts/add-admin.js <email> [name]');
    console.log('Example: node scripts/add-admin.js admin@example.com "Admin Name"');
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Error: Invalid email format');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('jia-db');
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins').findOne({ email: email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with this email:', email);
      console.log('Admin details:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        createdAt: existingAdmin.createdAt
      });
      return;
    }

    // Create new admin
    const newAdmin = {
      email: email,
      name: name,
      image: `https://api.dicebear.com/9.x/shapes/svg?seed=${email}`,
      createdAt: new Date(),
      lastSeen: new Date(),
      role: 'admin'
    };

    await db.collection('admins').insertOne(newAdmin);
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    console.log('🔑 Role: admin');
    console.log('\n🎉 You can now login with this email using Google Sign-In');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

addAdmin();
