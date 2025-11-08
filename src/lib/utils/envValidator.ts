/**
 * Environment Variable Validator
 * Validates required environment variables are set
 */

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "FIREBASE_SERVICE_ACCOUNT",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_CORE_API_URL",
];

const REQUIRED_CLIENT_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const OPTIONAL_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME",
];

/**
 * Validates server-side environment variables
 */
export function validateServerEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  REQUIRED_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables
  OPTIONAL_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`Optional: ${varName} is not set`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validates client-side environment variables
 */
export function validateClientEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required client variables
  REQUIRED_CLIENT_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Logs environment validation results
 */
export function logEnvValidation(
  result: EnvValidationResult,
  context: "server" | "client"
): void {
  if (result.isValid) {
    console.log(`✅ [${context.toUpperCase()}] All required environment variables are set`);
  } else {
    console.error(`❌ [${context.toUpperCase()}] Missing required environment variables:`);
    result.missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️  [${context.toUpperCase()}] Warnings:`);
    result.warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
  }
}

/**
 * Throws error if environment is invalid (use in API routes)
 */
export function requireValidEnv(): void {
  const result = validateServerEnv();
  if (!result.isValid) {
    throw new Error(
      `Missing required environment variables: ${result.missing.join(", ")}`
    );
  }
}
