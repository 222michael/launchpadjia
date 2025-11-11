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

async function checkConnections() {
  console.log('Checking MongoDB Atlas connections...\n');
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('jia-db');
    
    // Get current operations
    const currentOps = await db.admin().command({ currentOp: 1 });
    
    console.log('📊 Current MongoDB Operations:');
    console.log(`   Total operations: ${currentOps.inprog.length}`);
    
    // Count active connections
    const activeConnections = currentOps.inprog.filter(op => op.active);
    console.log(`   Active connections: ${activeConnections.length}`);
    
    // Get server status
    const serverStatus = await db.admin().command({ serverStatus: 1 });
    
    console.log('\n🔌 Connection Statistics:');
    console.log(`   Current connections: ${serverStatus.connections.current}`);
    console.log(`   Available connections: ${serverStatus.connections.available}`);
    console.log(`   Total created: ${serverStatus.connections.totalCreated}`);
    
    if (serverStatus.connections.current > 50) {
      console.log('\n⚠️  WARNING: High number of connections detected!');
      console.log('   Consider restarting your application to close idle connections.');
    } else {
      console.log('\n✅ Connection count is healthy');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

checkConnections();
