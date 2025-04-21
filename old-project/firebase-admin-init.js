
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to service account file
const serviceAccountPath = path.join(__dirname, 'Docs/camera-calibration-beta-firebase-adminsdk-fbsvc-91a80b4148.json');

// Initialize the app with a service account
let db;
let app;

try {
  // Check if the service account file exists
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://camera-calibration-beta.firebaseio.com"
    });
    
    // Initialize Firestore
    db = admin.firestore();
    
    // Database specific configuration
    db.settings({
      ignoreUndefinedProperties: true
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.warn('Service account file not found. Firebase Admin SDK not initialized.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

// Function to get a specific database (for future use with non-default databases)
function getDb(databaseId = 'camera-calibration-db') {
  try {
    return admin.firestore();
  } catch (error) {
    console.error(`Error getting database ${databaseId}:`, error);
    return null;
  }
}

export { db, getDb, app };
