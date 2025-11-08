const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key.trim()] = value;
      }
    }
  });
  
  return env;
}

const env = loadEnv();

async function updateOrgLogo() {
  const client = new MongoClient(env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(env.MONGODB_DB);
    
    // Update White Cloak organization with logo
    const result = await db.collection('organizations').updateOne(
      { name: 'White Cloak' },
      { 
        $set: { 
          image: '/wc-logo-black.png'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✓ Successfully updated White Cloak logo');
      
      // Verify the update
      const org = await db.collection('organizations').findOne({ name: 'White Cloak' });
      console.log('Updated organization:', {
        name: org.name,
        image: org.image
      });
    } else {
      console.log('✗ White Cloak organization not found');
    }
    
  } catch (error) {
    console.error('Error updating organization logo:', error);
  } finally {
    await client.close();
  }
}

updateOrgLogo();
