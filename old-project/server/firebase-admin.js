
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if running in a Replit environment with secrets
let serviceAccount;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    // Try to read the service account file from the specified path
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    serviceAccount = require(path.resolve(credPath));
  } catch (err) {
    console.error('Error loading service account file:', err);
    // If file reading fails, check if the credential is directly in environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (parseErr) {
        console.error('Error parsing service account JSON from env:', parseErr);
      }
    }
  }
}

// Initialize the app with database-specific configuration
const firebaseConfig = {
  credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'camera-calibration-beta',
  databaseURL: `https://${process.env.GOOGLE_CLOUD_PROJECT || 'camera-calibration-beta'}.firebaseio.com`,
};

// Initialize Firebase Admin
let firebaseApp;
try {
  firebaseApp = admin.initializeApp(firebaseConfig);
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firestore with specific database ID if provided
const firestoreSettings = {};
if (process.env.FIRESTORE_DATABASE_ID) {
  firestoreSettings.databaseId = process.env.FIRESTORE_DATABASE_ID;
}

const db = firebaseApp ? firebaseApp.firestore() : null;
if (db && Object.keys(firestoreSettings).length > 0) {
  db.settings(firestoreSettings);
}

module.exports = {
  admin,
  firebaseApp,
  db
};
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
let db;
try {
  // Check if the app has already been initialized
  if (!admin.apps.length) {
    // Use environment variables for configuration
    admin.initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'camera-calibration-beta',
      // If credential JSON is provided as an environment variable (recommended for production)
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  
  db = admin.firestore();
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

export { admin, db };
