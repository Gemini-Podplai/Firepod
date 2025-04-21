import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require('../service-account-key.json'))
});

// Initialize Firestore
const firestore = admin.firestore();

export const helloWorld = functions.https.onCall(async (data: any, context) => {
  return { message: "Hello from Firebase!" };
});

export const generateText = functions.https.onCall(async (data: { prompt: string }, context) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The API key for Google AI is not configured."
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(data.prompt);
    const response = await result.response;

    return { text: response.text() };
  } catch (error) {
    console.error("Error generating text:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate text");
  }
});


// Example function for accessing Firestore
export const getCameras = functions.https.onCall(async (data, context) => {
  try {
    const db = admin.firestore();

    const snapshot = await db
      .collection("cameras")
      .get();

    const cameras = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    return { cameras };
  } catch (error) {
    console.error("Error getting cameras:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error retrieving camera data"
    );
  }
});

/**
 * Firebase function for chat-based interaction with Google's Generative AI
 */
export const chatWithAI = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to use this feature."
    );
  }

  try {
    const { messages } = data;

    if (!messages || !Array.isArray(messages)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a 'messages' argument as an array."
      );
    }

    // Initialize the API with an API key
    const API_KEY = process.env.GOOGLE_API_KEY || "YOUR_API_KEY";
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Get the specified model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate chat response
    const result = await model.generateChatResponse(messages);
    const response = await result.response;
    const chatResponse = response.text();

    // Log the request (optional)
    await firestore.collection("chatRequests").add({
      userId: context.auth.uid,
      messages,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      success: true
    });

    // Return the chat response
    return { result: chatResponse };
  } catch (error) {
    console.error("Error generating chat response:", error);

    // Log the error (optional)
    if (context.auth) {
      await firestore.collection("chatErrors").add({
        userId: context.auth.uid,
        error: JSON.stringify(error),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    throw new functions.https.HttpsError(
      "internal",
      "Error generating chat response"
    );
  }
});