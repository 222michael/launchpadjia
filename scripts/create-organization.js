#!/usr/bin/env node

/**
 * Create Organization Script
 * Creates an organization and adds you as an admin member
 * Run with: node scripts/create-organization.js
 */

const { MongoClient } = require('mongodb');
const readline = require('readline');
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function createOrganization() {
  console.log('\n============================================================');
  console.log('CREATE ORGANIZATION - Setup Script');
  console.log('============================================================\n');

  try {
    // Get MongoDB URI from environment
    const mongoUri = env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ ERROR: MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('📝 Please provide the following information:\n');

    // Get user input
    const orgName = await question('Organization Name (e.g., "My Company"): ');
    const userEmail = await question('Your Email (used for Google login): ');
    const userName = await question('Your Name: ');
    const userImage = await question('Your Profile Image URL (or press Enter to use default): ');

    if (!orgName || !userEmail || !userName) {
      console.error('\n❌ ERROR: All fields are required!');
      process.exit(1);
    }

    console.log('\n🔄 Connecting to MongoDB...');

    // Connect to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('jia-db');
    
    console.log('✅ Connected to MongoDB\n');

    // Generate organization ID
    const orgID = generateGUID();
    
    // Create organization
    console.log('🏢 Creating organization...');
    const orgResult = await db.collection('organizations').insertOne({
      name: orgName,
      tier: 'free', // or 'premium', 'enterprise'
      image: '', // Can be added later
      creator: userEmail,
      orgID: orgID,
      createdAt: new Date(),
      settings: {
        allowPublicApplications: true,
        requireCVUpload: true,
      }
    });

    console.log(`✅ Organization created with ID: ${orgResult.insertedId}`);

    // Add user as admin member
    console.log('👤 Adding you as admin member...');
    await db.collection('members').insertOne({
      image: userImage || `https://api.dicebear.com/8.x/shapes/svg?seed=${userName}`,
      name: userName,
      email: userEmail,
      orgID: orgResult.insertedId.toString(),
      role: 'admin',
      addedAt: new Date(),
      lastLogin: new Date(),
      status: 'joined',
    });

    console.log('✅ Admin member added\n');

    console.log('============================================================');
    console.log('✅ SUCCESS! Organization Created');
    console.log('============================================================\n');

    console.log('📋 Organization Details:');
    console.log(`   Name: ${orgName}`);
    console.log(`   ID: ${orgResult.insertedId}`);
    console.log(`   Org ID: ${orgID}`);
    console.log(`   Admin: ${userName} (${userEmail})`);
    console.log(`   Tier: free\n`);

    console.log('🎯 Next Steps:');
    console.log('   1. Go to: http://localhost:3000/login');
    console.log('   2. Sign in with Google using: ' + userEmail);
    console.log('   3. You will be redirected to the recruiter dashboard');
    console.log('   4. Start creating job postings!\n');

    await client.close();
    rl.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createOrganization();
