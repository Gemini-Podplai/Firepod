// Firebase configuration file for camera-calibration-beta project

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual API key
  authDomain: "camera-calibration-beta.firebaseapp.com",
  projectId: "camera-calibration-beta",
  databaseURL: "https://camera-calibration-beta.firebaseio.com",
  storageBucket: "camera-calibration-beta.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your actual sender ID
  appId: "YOUR_APP_ID", // Replace with your actual app ID
  measurementId: "YOUR_MEASUREMENT_ID" // Replace with your actual measurement ID
};

// Database specific config, for specifying non-default database
const dbConfig = {
  databaseId: "camera-calibration-db"
};

module.exports = {
  firebaseConfig,
  dbConfig
};
