const admin = require("firebase-admin");
const path = require("path");

// Path to your service account key (use the existing credentials file)
const serviceAccount = require("./Docs/camera-calibration-beta-firebase-adminsdk-fbsvc-91a80b4148.json");

// Initialize the app with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // You can specify databaseURL if needed for Realtime Database
  // databaseURL: "https://camera-calibration-beta.firebaseio.com"
});

// Create Firestore client with specific database configuration
const db = admin.firestore();

// Configure Firestore settings for europe-west1 region and native mode
db.settings({
  ignoreUndefinedProperties: true
});

// Helper function that directly accesses the named database
const nativeDb = admin.firestore().database("camera-calibration-db");

// Function to get a specific database (native database with ID)
function getNativeDatabase(databaseId = "camera-calibration-db") {
  try {
    return admin.firestore().database(databaseId);
  } catch (error) {
    console.error(`Error getting database ${databaseId}:`, error);
    throw error;
  }
}

// Export the admin, default db, and function to get specific database
module.exports = { 
  admin, 
  db,
  getNativeDatabase
};
