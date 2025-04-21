import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { db, admin } from './server/firebase-admin'; // Added import for firebase-admin


// Load environment variables
dotenv.config();

// Load environment variables validation.  This assumes a validateEnv.js file exists
import validateEnv from './scripts/validateEnv';
validateEnv();


// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory
console.log('Setting up static file serving...');
app.use(express.static(path.join(__dirname, 'client/dist')));

// API endpoint for chat (kept from original)
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);

    // Simple echo response for now
    res.json({
      response: `I received your message: "${message}". This is a response from the server.`
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Firebase status check endpoint (added from changes)
app.get('/api/firebase-status', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Try a simple Firestore query to verify connection
    const timestamp = admin.firestore.Timestamp.now();
    res.json({ 
      status: 'connected', 
      timestamp: timestamp.toDate().toISOString(),
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'camera-calibration-beta'
    });
  } catch (error) {
    console.error('Firebase status check error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Health check endpoint (kept from original)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle all routes for SPA (modified to use path.join)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <html>
        <head>
          <title>PodPlai Studio</title>
          <style>
            body { font-family: sans-serif; background: #1a1a1a; color: #e2e8f0; text-align: center; padding: 50px; }
            h1 { font-size: 2rem; margin-bottom: 20px; }
            p { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h1>PodPlai Studio</h1>
          <p>Welcome to PodPlai Studio</p>
          <p>Your AI development environment is starting up...</p>
          <p>If you see this page, the client build may not be available yet.</p>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});