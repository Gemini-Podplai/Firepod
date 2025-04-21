
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const firestore = admin.firestore();

/**
 * Helper function to initialize Google Generative AI
 * @param {string} apiKey The API key for Google Generative AI
 * @returns A GoogleGenerativeAI instance
 */
function initializeGenerativeAI(apiKey) {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Function that generates text using Google's Generative AI
 */
exports.generateText = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  try {
    // Validate input
    const { prompt, modelName = "gemini-pro" } = data;
    if (!prompt || typeof prompt !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a 'prompt' argument."
      );
    }

    // Initialize the API with an API key
    // In production, use environment variables or Secret Manager
    const API_KEY = process.env.GOOGLE_API_KEY || "YOUR_API_KEY";
    const genAI = initializeGenerativeAI(API_KEY);

    // Get the specified model
    const model = genAI.getGenerativeModel({ model: modelName });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Log the request
    await firestore.collection("generativeRequests").add({
      userId: context.auth.uid,
      prompt,
      modelName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      success: true
    });

    // Return the generated text
    return { result: text, model: modelName };
  } catch (error) {
    console.error("Error generating content:", error);
    
    // Log the error
    if (context.auth) {
      await firestore.collection("generativeErrors").add({
        userId: context.auth.uid,
        error: JSON.stringify(error),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    throw new functions.https.HttpsError(
      "internal",
      "Error generating content"
    );
  }
});

/**
 * Function to access and retrieve camera data
 */
exports.getCameras = functions.https.onCall(async (data, context) => {
  try {
    const snapshot = await firestore.collection("cameras").get();
    
    const cameras = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { cameras };
  } catch (error) {
    console.error("Error retrieving camera data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error retrieving camera data"
    );
  }
});
