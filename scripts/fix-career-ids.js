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
    
    // Find careers without id field
    const careersWithoutId = await db.collection('careers').find({ id: { $exists: false } }).toArray();
    
    console.log(`Found ${careersWithoutId.length} careers without id field`);
    
    if (careersWithoutId.length > 0) {
      for (const career of careersWithoutId) {
        const careerId = `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.collection('careers').updateOne(
          { _id: career._id },
          { $set: { id: careerId } }
        );
        
        console.log(`Updated career "${career.jobTitle}" with id: ${careerId}`);
      }
      
      console.log('\nAll careers updated successfully!');
    } else {
      console.log('All careers already have id field');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
})();
