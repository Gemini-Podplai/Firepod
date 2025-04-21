"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = exports.getCameras = exports.generateText = exports.helloWorld = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
// Initialize Firebase Admin with service account
admin.initializeApp({
    credential: admin.credential.cert(require('../service-account-key.json'))
});
// Initialize Firestore
const firestore = admin.firestore();
exports.helloWorld = functions.https.onCall(async (data, context) => {
    return { message: "Hello from Firebase!" };
});
exports.generateText = functions.https.onCall(async (data, context) => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new functions.https.HttpsError("failed-precondition", "The API key for Google AI is not configured.");
    }
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(data.prompt);
        const response = await result.response;
        return { text: response.text() };
    }
    catch (error) {
        console.error("Error generating text:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate text");
    }
});
// Example function for accessing Firestore
exports.getCameras = functions.https.onCall(async (data, context) => {
    try {
        const db = admin.firestore();
        const snapshot = await db
            .collection("cameras")
            .get();
        const cameras = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return { cameras };
    }
    catch (error) {
        console.error("Error getting cameras:", error);
        throw new functions.https.HttpsError("internal", "Error retrieving camera data");
    }
});
/**
 * Firebase function for chat-based interaction with Google's Generative AI
 */
exports.chatWithAI = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to use this feature.");
    }
    try {
        const { messages } = data;
        if (!messages || !Array.isArray(messages)) {
            throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'messages' argument as an array.");
        }
        // Initialize the API with an API key
        const API_KEY = process.env.GOOGLE_API_KEY || "YOUR_API_KEY";
        const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
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
    }
    catch (error) {
        console.error("Error generating chat response:", error);
        // Log the error (optional)
        if (context.auth) {
            await firestore.collection("chatErrors").add({
                userId: context.auth.uid,
                error: JSON.stringify(error),
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        throw new functions.https.HttpsError("internal", "Error generating chat response");
    }
});
//# sourceMappingURL=index.js.map