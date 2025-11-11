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

async function updateAdminRoles() {
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

    const db = client.db('jia-db');
    
    // Update all super_admin to admin
    const result = await db.collection('admins').updateMany(
      { role: 'super_admin' },
      { $set: { role: 'admin' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} admin(s) from super_admin to admin\n`);
    
    // Ensure both emails have admin accounts
    const emails = [
      { email: 'caldomichael10@gmail.com', name: 'Mike Ladeza' },
      { email: 'mcaldo839@gmail.com', name: 'Michael Caldo' }
    ];
    
    for (const { email, name } of emails) {
      const existing = await db.collection('admins').findOne({ email });
      
      if (existing) {
        await db.collection('admins').updateOne(
          { email },
          { 
            $set: { 
              role: 'admin',
              lastSeen: new Date()
            } 
          }
        );
        console.log(`✅ Updated existing admin: ${email}`);
      } else {
        await db.collection('admins').insertOne({
          email,
          name,
          image: `https://api.dicebear.com/9.x/shapes/svg?seed=${email}`,
          createdAt: new Date(),
          lastSeen: new Date(),
          role: 'admin'
        });
        console.log(`✅ Created new admin: ${email}`);
      }
    }
    
    console.log('\n📋 Current admins:');
    const admins = await db.collection('admins').find({}).toArray();
    admins.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

updateAdminRoles();
