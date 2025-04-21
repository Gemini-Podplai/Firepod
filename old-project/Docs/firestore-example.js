const { admin, db, nativeDb } = require('./firebase-admin-init');

/**
 * Example function to add camera data to the "camera-calibration-db" database
 * @param {Object} cameraData - The camera data to store
 * @returns {Promise<string>} - The ID of the created document
 */
async function addCamera(cameraData) {
  try {
    const result = await nativeDb.collection('cameras').add({
      ...cameraData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Added camera with ID: ${result.id}`);
    return result.id;
  } catch (error) {
    console.error("Error adding camera:", error);
    throw error;
  }
}

/**
 * Example function to retrieve camera data
 * @param {string} cameraId - The ID of the camera to retrieve
 * @returns {Promise<Object|null>} - The camera data or null if not found
 */
async function getCamera(cameraId) {
  try {
    const doc = await nativeDb.collection('cameras').doc(cameraId).get();
    
    if (doc.exists) {
      return doc.data();
    } else {
      console.log("No such camera!");
      return null;
    }
  } catch (error) {
    console.error("Error getting camera:", error);
    throw error;
  }
}

/**
 * Set up reCAPTCHA verification using Google Cloud reCAPTCHA Enterprise
 * @param {string} recaptchaToken - The reCAPTCHA token from client
 * @param {string} recaptchaAction - The action name verified by reCAPTCHA
 * @returns {Promise<{success: boolean, score: number}>} - Verification result with score
 */
async function verifyRecaptcha(recaptchaToken, recaptchaAction = 'login') {
  try {
    // This requires: npm install @google-cloud/recaptcha-enterprise
    const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');
    
    // Create a client
    const client = new RecaptchaEnterpriseServiceClient();
    
    // Build the assessment request
    const projectPath = client.projectPath('dartopia'); // Use your Google Cloud project name
    
    const request = {
      parent: projectPath,
      assessment: {
        event: {
          token: recaptchaToken,
          siteKey: 'YOUR_RECAPTCHA_SITE_KEY', // Replace with your actual site key
          expectedAction: recaptchaAction
        },
      },
    };
    
    // Run the verification
    const [assessment] = await client.createAssessment(request);
    
    // Process the result
    if (!assessment.tokenProperties.valid) {
      console.error("Invalid reCAPTCHA token");
      return { success: false, score: 0 };
    }
    
    // For v3 reCAPTCHA, check the score (0.0 to 1.0, where 1.0 is very likely a good interaction)
    const score = assessment.riskAnalysis.score;
    const minimumScore = 0.5; // You can adjust this threshold
    
    return { 
      success: score >= minimumScore, 
      score,
      reasons: assessment.riskAnalysis?.reasons || []
    };
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return { success: false, score: 0 };
  }
}

/**
 * Set up user authentication with Firebase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User credentials
 */
async function createUser(email, password) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false,
      disabled: false
    });
    
    // Store additional user data in Firestore
    await nativeDb.collection('users').doc(userRecord.uid).set({
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user'
    });
    
    console.log(`User created with ID: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Set up custom claims for users (e.g., admin role)
 * @param {string} uid - User ID
 * @param {Object} claims - Custom claims to set
 */
async function setUserClaims(uid, claims) {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`Custom claims set for user ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw error;
  }
}

// Sample usage
async function testFirestore() {
  const cameraId = await addCamera({
    name: "Test Camera",
    model: "Sony A7III",
    parameters: {
      focalLength: 50,
      sensorWidth: 36
    }
  });
  
  const camera = await getCamera(cameraId);
  console.log("Retrieved camera:", camera);
}

module.exports = {
  addCamera,
  getCamera,
  testFirestore,
  createUser,
  verifyRecaptcha,
  setUserClaims
};
