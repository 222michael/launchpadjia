const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  }
});
process.env.MONGODB_URI = envVars.MONGODB_URI;

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('test');
    
    // Get all careers
    const careers = await db.collection('careers').find({}).toArray();
    
    console.log('Total careers:', careers.length);
    
    if (careers.length > 0) {
      console.log('\nFirst career fields:', Object.keys(careers[0]));
      console.log('\nFirst career has id field:', !!careers[0].id);
      console.log('\nFirst career _id:', careers[0]._id);
      console.log('\nFirst career id:', careers[0].id);
      console.log('\nFirst career jobTitle:', careers[0].jobTitle);
      
      // Check if any careers have id field
      const careersWithId = careers.filter(c => c.id);
      const careersWithoutId = careers.filter(c => !c.id);
      
      console.log('\nCareers with id field:', careersWithId.length);
      console.log('Careers without id field:', careersWithoutId.length);
      
      if (careersWithoutId.length > 0) {
        console.log('\nCareers without id:');
        careersWithoutId.forEach(c => {
          console.log(`  - ${c.jobTitle} (_id: ${c._id})`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
})();
