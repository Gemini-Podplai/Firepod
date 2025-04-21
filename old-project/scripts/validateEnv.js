import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Try loading .env.local first, then fall back to .env
if (fs.existsSync(path.join(rootDir, '.env.local'))) {
  dotenv.config({ path: path.join(rootDir, '.env.local') });
} else {
  dotenv.config({ path: path.join(rootDir, '.env') });
}

export default function validateEnv() {
  // Required environment variables
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT',
    'SESSION_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('The application may not function correctly without these variables.');
  } else {
    console.log('✅ Environment validation passed');
  }

  // Check for service account credentials
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const absolutePath = path.isAbsolute(credPath) 
      ? credPath 
      : path.join(rootDir, credPath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️ Service account file not found at ${absolutePath}`);
      console.warn('Firebase Admin SDK may fail to initialize properly.');

      // Check if credentials are provided directly in environment
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('✅ Firebase service account provided via environment variable');
      } else {
        console.warn('⚠️ No alternative credentials found in FIREBASE_SERVICE_ACCOUNT');
      }
    } else {
      console.log('✅ Firebase service account file found');
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('✅ Firebase service account provided via environment variable');
  } else {
    console.warn('⚠️ No Firebase credentials found. Firebase services will not work properly.');
  }

  // Warn about exposed API keys in client code
  if (process.env.VITE_FIREBASE_API_KEY) {
    console.log('ℹ️ Firebase client configuration is set (these keys are meant to be public)');
  }
}