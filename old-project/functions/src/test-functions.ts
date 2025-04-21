import * as admin from "firebase-admin";

// This file is for testing your Firebase functions locally

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper function to add test camera data to Firestore
async function seedTestData() {
  const firestore = admin.firestore();
  
  // Add test cameras
  const camerasRef = firestore.collection("cameras");
  
  // Check if test data already exists
  const snapshot = await camerasRef.limit(1).get();
  if (!snapshot.empty) {
    console.log("Test data already exists");
    return;
  }
  
  // Add sample cameras
  const cameras = [
    {
      name: "Camera 1",
      model: "Sony A7III",
      resolution: "4K",
      parameters: {
        focalLength: 50,
        sensorWidth: 36
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: "Camera 2",
      model: "Canon EOS R5",
      resolution: "8K",
      parameters: {
        focalLength: 24,
        sensorWidth: 36
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Add to Firestore
  for (const camera of cameras) {
    await camerasRef.add(camera);
  }
  
  console.log("Added test camera data to Firestore");
}

// Export the seed function so it can be called from the command line
export { seedTestData };

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTestData()
    .then(() => console.log("Seeding complete"))
    .catch(err => console.error("Error seeding data:", err));
}
