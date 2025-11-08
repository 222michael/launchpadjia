#!/usr/bin/env node

/**
 * Fix Organization Status
 * Adds "status: active" to all organizations that don't have it
 */

const { MongoClient } = require('mongodb');
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

async function fixOrganizationStatus() {
  console.log('\n============================================================');
  console.log('FIX ORGANIZATION STATUS');
  console.log('============================================================\n');

  try {
    const mongoUri = env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ ERROR: MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('jia-db');
    console.log('✅ Connected to MongoDB\n');

    // Update all organizations without status field
    console.log('🔄 Updating organizations...');
    const result = await db.collection('organizations').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} organization(s)\n`);

    // Show all organizations
    const orgs = await db.collection('organizations').find({}).toArray();
    
    console.log('📋 Current Organizations:');
    orgs.forEach(org => {
      console.log(`   - ${org.name} (${org.status || 'NO STATUS'})`);
    });

    console.log('\n============================================================');
    console.log('✅ DONE!');
    console.log('============================================================\n');

    console.log('🎯 Next Steps:');
    console.log('   1. Clear browser cache: localStorage.clear()');
    console.log('   2. Go to: http://localhost:3000/login');
    console.log('   3. Sign in with Google');
    console.log('   4. You should now access the recruiter dashboard!\n');

    await client.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

fixOrganizationStatus();
