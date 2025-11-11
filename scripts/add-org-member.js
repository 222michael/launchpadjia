const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) return;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

async function addOrgMember() {
  const email = process.argv[2];
  const name = process.argv[3];
  const orgName = process.argv[4] || 'White Cloak';

  if (!email || !name) {
    console.error('❌ Error: Please provide email and name');
    console.log('Usage: node scripts/add-org-member.js <email> <name> [orgName]');
    console.log('Example: node scripts/add-org-member.js user@example.com "John Doe" "White Cloak"');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Error: MONGODB_URI not found');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected\n');

    const db = client.db('jia-db');
    
    // Find the organization
    const org = await db.collection('organizations').findOne({ name: orgName });
    
    if (!org) {
      console.error(`❌ Organization "${orgName}" not found`);
      process.exit(1);
    }
    
    console.log(`📋 Found organization: ${org.name} (ID: ${org._id})`);
    
    // Check if member already exists
    const existingMember = await db.collection('members').findOne({ 
      email: email,
      orgID: org._id.toString()
    });
    
    if (existingMember) {
      console.log(`⚠️  Member already exists in ${orgName}`);
      console.log('Current role:', existingMember.role);
      return;
    }
    
    // Add member
    const newMember = {
      email: email,
      name: name,
      image: `https://api.dicebear.com/9.x/shapes/svg?seed=${email}`,
      orgID: org._id.toString(),
      role: 'admin', // Can be 'admin', 'member', or 'hiring_manager'
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    await db.collection('members').insertOne(newMember);
    
    console.log(`✅ Added ${email} as admin to ${orgName}`);
    console.log('\n🎉 You can now access the recruiter dashboard!');
    console.log(`   Visit: http://localhost:3000/recruiter-dashboard?orgID=${org._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

addOrgMember();
