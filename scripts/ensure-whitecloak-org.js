const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read MongoDB URI from .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
const uri = uriMatch ? uriMatch[1].trim() : null;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function ensureWhiteCloakOrg() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('jia');
    
    // Check if White Cloak organization exists
    const existingOrg = await db.collection('organizations').findOne({ 
      name: 'White Cloak' 
    });

    if (existingOrg) {
      console.log('✅ White Cloak organization already exists');
      
      // Update the organization with the logo if it doesn't have one
      if (!existingOrg.image) {
        await db.collection('organizations').updateOne(
          { _id: existingOrg._id },
          { 
            $set: { 
              image: '/whitecloak_logo.png',
              tier: 'enterprise',
              updatedAt: new Date()
            } 
          }
        );
        console.log('✅ Updated White Cloak organization with logo and tier');
      } else {
        console.log('Organization already has an image:', existingOrg.image);
      }
    } else {
      // Create White Cloak organization
      const newOrg = {
        name: 'White Cloak',
        description: 'White Cloak Technologies, Inc.',
        website: 'https://whitecloak.com',
        industry: 'Software Development',
        size: '50-200',
        location: 'Pasig City, Metro Manila, Philippines',
        tier: 'enterprise',
        image: '/whitecloak_logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('organizations').insertOne(newOrg);
      console.log('✅ White Cloak organization created successfully!');
      console.log('Organization ID:', result.insertedId);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

ensureWhiteCloakOrg();
