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

async function checkAdmin() {
  const email = process.argv[2] || 'caldomichael10@gmail.com';

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    // Check default database
    const defaultDb = client.db();
    console.log('Default database name:', defaultDb.databaseName);
    
    const adminInDefault = await defaultDb.collection('admins').findOne({ email: email });
    
    if (adminInDefault) {
      console.log('✅ Admin found in DEFAULT database:');
      console.log(JSON.stringify(adminInDefault, null, 2));
    } else {
      console.log('❌ No admin found in default database');
    }
    
    // Check jia-db database
    const jiaDb = client.db('jia-db');
    console.log('\nChecking jia-db database...');
    
    const adminInJiaDb = await jiaDb.collection('admins').findOne({ email: email });
    
    if (adminInJiaDb) {
      console.log('✅ Admin found in JIA-DB database:');
      console.log(JSON.stringify(adminInJiaDb, null, 2));
    } else {
      console.log('❌ No admin found in jia-db database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkAdmin();
