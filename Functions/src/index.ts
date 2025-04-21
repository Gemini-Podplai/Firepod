import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CallableRequest } from "firebase-functions/v2/https";

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require('../service-account-key.json'))
});

// Initialize Firestore
const firestore = admin.firestore();

export const helloWorld = functions.https.onCall(async (data: any, context) => {
  return { message: "Hello from Firebase!" };
});

export const generateText = functions.https.onCall(async (request: CallableRequest<{ prompt: string }>) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The API key for Google AI is not configured."
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(request.data.prompt);
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
export const chatWithAI = functions.https.onCall(async (request: CallableRequest<{ messages: any[] }>) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to use this feature."
    );
  }

  try {
    const { messages } = request.data;

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate chat response
    const chat = model.startChat({ history: messages.slice(0, -1) }); // Pass all but the last message as history
    const result = await chat.sendMessage(messages[messages.length - 1].content); // Send the last message
    const response = await result.response;
    const chatResponse = response.text();

    // Log the request (optional)
    if (request.auth) {
      await firestore.collection("chatRequests").add({
        userId: request.auth.uid,
        messages,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        success: true
      });
    }

    // Return the chat response
    return { result: chatResponse };
  } catch (error) {
    console.error("Error generating chat response:", error);

    // Log the error (optional)
    if (request.auth) {
      await firestore.collection("chatErrors").add({
        userId: request.auth.uid,
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