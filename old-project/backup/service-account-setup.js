
// Firebase Admin SDK initialization with Service Account
// For secure access to Firebase services from your server

const admin = require("firebase-admin");
const path = require("path");

// Production setup uses environment variable to locate service account file 
// GOOGLE_APPLICATION_CREDENTIALS should point to your service account key
// For local development, place service account file in .credentials folder

function initializeFirebaseAdmin() {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    
    // Configure Firestore settings for Europe-West1 region and native mode
    const db = admin.firestore();
    db.settings({
      ignoreUndefinedProperties: true
    });
    
    return { admin, db };
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}

// Export the initialization function
module.exports = { initializeFirebaseAdmin };
