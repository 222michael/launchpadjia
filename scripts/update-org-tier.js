const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://launchpad_jia:launchpad_jia123@cluster0.zfjfq0e.mongodb.net/?appName=Cluster0';

async function updateOrgTier() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('jia-db');
    
    // Update White Cloak organization tier to enterprise
    const result = await db.collection('organizations').updateOne(
      { _id: new ObjectId('690e874de934f295a5abfb2b') },
      { $set: { tier: 'enterprise' } }
    );
    
    console.log('Update result:', result);
    console.log('Organization tier updated to "enterprise"');
    
    // Verify the update
    const org = await db.collection('organizations').findOne({ _id: new ObjectId('690e874de934f295a5abfb2b') });
    console.log('\nUpdated organization:', org);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateOrgTier();
