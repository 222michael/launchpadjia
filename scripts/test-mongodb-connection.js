const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let uri = null;
for (const line of envLines) {
  if (line.startsWith('MONGODB_URI=')) {
    uri = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

async function testConnection() {
  console.log('Testing MongoDB connection...\n');
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    compressors: ['zlib'],
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas\n');

    const db = client.db('jia-db');
    
    // Test ping
    await db.admin().ping();
    console.log('✅ Ping successful\n');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Check connection pool stats
    console.log('🔌 Connection Pool Configuration:');
    console.log('   - Max Pool Size: 10');
    console.log('   - Min Pool Size: 2');
    console.log('   - Max Idle Time: 60 seconds');
    console.log('');

    console.log('✅ All tests passed! MongoDB is configured correctly.');
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

testConnection();
