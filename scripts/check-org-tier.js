const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://launchpad_jia:launchpad_jia123@cluster0.zfjfq0e.mongodb.net/?appName=Cluster0';

async function checkOrgTier() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('jia-db'); // Database name from mongoDB.ts
    
    // Get all organizations
    const orgs = await db.collection('organizations').find({}).toArray();
    console.log('\n=== Organizations ===');
    orgs.forEach(org => {
      console.log(`\nOrg: ${org.name}`);
      console.log(`ID: ${org._id}`);
      console.log(`Tier: ${org.tier || 'NOT SET'}`);
    });
    
    // Get all careers
    const careers = await db.collection('careers').find({}).toArray();
    console.log('\n\n=== Careers ===');
    careers.forEach(career => {
      console.log(`\nJob: ${career.jobTitle}`);
      console.log(`OrgID: ${career.orgID}`);
      console.log(`Status: ${career.status || 'NOT SET'}`);
      console.log(`Created: ${new Date(career.createdAt)}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkOrgTier();
