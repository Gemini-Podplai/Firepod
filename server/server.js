import express from 'express';
import admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText } from 'ai';
import { vertexAnthropic } from '@ai-sdk/google-vertex/anthropic';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins (adjust as needed for production)
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the client/public directory
app.use(express.static('../client/public'));

// Initialize Firebase Admin
import serviceAccount from './camera-calibration-beta-6304d1bafd3c.json' assert { type: 'json' }; // Using the camera-calibration-beta service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash-preview-04-17' });

// Route to read messages from Firebase
app.get('/api/roo/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messagesRef = db.collection('messages').doc(userId).collection('chat');
    const snapshot = await messagesRef.orderBy('timestamp').get();
    const messages = [];
    snapshot.forEach(doc => {
      messages.push(doc.data());
    });
    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route to write messages to Firebase
app.post('/api/roo/write-message', async (req, res) => {
  try {
    const { userId, message, role, model } = req.body;
    const messagesRef = db.collection('messages').doc(userId).collection('chat');
    await messagesRef.add({
      message,
      role,
      model: model || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get AI response using Gemini API
app.post('/api/roo/gemini-completion', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error) {
    console.error(error);
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get AI response using Claude via Vertex AI
app.post('/api/roo/claude-completion', async (req, res) => {
  try {
    const { prompt } = req.body;
    const { text } = await generateText({
      model: googleVertex('claude-3-5-sonnet-v2@20241022'),
      prompt: prompt,
    });
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});