#!/usr/bin/env node

/**
 * Setup Validation Script
 * Validates that all required environment variables are configured
 * Run with: node scripts/validate-setup.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const REQUIRED_VARS = [
  'MONGODB_URI',
  'FIREBASE_SERVICE_ACCOUNT',
  'NEXT_PUBLIC_CORE_API_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const OPTIONAL_VARS = [
  'OPENAI_API_KEY', // Optional for now - can be added later
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME',
];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('\n❌ ERROR: .env file not found!', 'red');
    log('\nPlease create a .env file by copying .env.example:', 'yellow');
    log('  cp .env.example .env', 'cyan');
    log('\nThen fill in your credentials.\n', 'yellow');
    return false;
  }
  
  return true;
}

function parseEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        envVars[key.trim()] = value;
      }
    }
  });
  
  return envVars;
}

function validateVariables(envVars) {
  let allValid = true;
  const missing = [];
  const warnings = [];
  
  log('\n🔍 Validating Environment Variables...\n', 'cyan');
  
  // Check required variables
  REQUIRED_VARS.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      log(`  ❌ ${varName} - MISSING`, 'red');
      missing.push(varName);
      allValid = false;
    } else {
      log(`  ✅ ${varName} - SET`, 'green');
    }
  });
  
  // Check optional variables
  log('\n📋 Optional Variables:\n', 'cyan');
  OPTIONAL_VARS.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      log(`  ⚠️  ${varName} - NOT SET (optional)`, 'yellow');
      warnings.push(varName);
    } else {
      log(`  ✅ ${varName} - SET`, 'green');
    }
  });
  
  return { allValid, missing, warnings };
}

function validateFormat(envVars) {
  const issues = [];
  
  log('\n🔧 Validating Format...\n', 'cyan');
  
  // Validate MongoDB URI format
  if (envVars.MONGODB_URI) {
    if (!envVars.MONGODB_URI.startsWith('mongodb://') && 
        !envVars.MONGODB_URI.startsWith('mongodb+srv://')) {
      issues.push('MONGODB_URI should start with mongodb:// or mongodb+srv://');
      log('  ❌ MONGODB_URI format invalid', 'red');
    } else {
      log('  ✅ MONGODB_URI format valid', 'green');
    }
  }
  
  // Validate OpenAI API Key format
  if (envVars.OPENAI_API_KEY) {
    if (!envVars.OPENAI_API_KEY.startsWith('sk-')) {
      issues.push('OPENAI_API_KEY should start with sk-');
      log('  ❌ OPENAI_API_KEY format invalid', 'red');
    } else {
      log('  ✅ OPENAI_API_KEY format valid', 'green');
    }
  }
  
  // Validate Firebase Service Account JSON
  if (envVars.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(envVars.FIREBASE_SERVICE_ACCOUNT);
      if (parsed.type === 'service_account' && parsed.project_id) {
        log('  ✅ FIREBASE_SERVICE_ACCOUNT is valid JSON', 'green');
      } else {
        issues.push('FIREBASE_SERVICE_ACCOUNT missing required fields');
        log('  ❌ FIREBASE_SERVICE_ACCOUNT missing required fields', 'red');
      }
    } catch (e) {
      issues.push('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
      log('  ❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON', 'red');
    }
  }
  
  // Validate Core API URL
  if (envVars.NEXT_PUBLIC_CORE_API_URL) {
    if (!envVars.NEXT_PUBLIC_CORE_API_URL.startsWith('http')) {
      issues.push('NEXT_PUBLIC_CORE_API_URL should start with http:// or https://');
      log('  ❌ NEXT_PUBLIC_CORE_API_URL format invalid', 'red');
    } else {
      log('  ✅ NEXT_PUBLIC_CORE_API_URL format valid', 'green');
    }
  }
  
  return issues;
}

function printSummary(result, formatIssues) {
  log('\n' + '='.repeat(60), 'cyan');
  log('VALIDATION SUMMARY', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (result.allValid && formatIssues.length === 0) {
    log('✅ All required environment variables are properly configured!', 'green');
    log('\nYou can now run:', 'cyan');
    log('  npm run dev', 'yellow');
    log('\nThen check health status at:', 'cyan');
    log('  http://localhost:3000/api/health-check\n', 'yellow');
  } else {
    log('❌ Setup incomplete. Please fix the following issues:\n', 'red');
    
    if (result.missing.length > 0) {
      log('Missing Required Variables:', 'red');
      result.missing.forEach(varName => {
        log(`  - ${varName}`, 'yellow');
      });
      log('');
    }
    
    if (formatIssues.length > 0) {
      log('Format Issues:', 'red');
      formatIssues.forEach(issue => {
        log(`  - ${issue}`, 'yellow');
      });
      log('');
    }
    
    log('Please refer to the README.md for detailed setup instructions.\n', 'cyan');
  }
  
  if (result.warnings.length > 0) {
    log('ℹ️  Optional variables not set:', 'yellow');
    result.warnings.forEach(varName => {
      log(`  - ${varName}`, 'yellow');
    });
    log('\nThese are optional and won\'t affect core functionality.\n', 'yellow');
  }
}

function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('JIA WEB APPLICATION - SETUP VALIDATOR', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // Check if .env file exists
  if (!checkEnvFile()) {
    process.exit(1);
  }
  
  // Parse .env file
  const envVars = parseEnvFile();
  
  // Validate variables
  const result = validateVariables(envVars);
  
  // Validate format
  const formatIssues = validateFormat(envVars);
  
  // Print summary
  printSummary(result, formatIssues);
  
  // Exit with appropriate code
  if (!result.allValid || formatIssues.length > 0) {
    process.exit(1);
  }
}

main();
