const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

/**
 * Google API endpoint
 * Provides a secure way to access Google APIs
 */
router.post('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const params = req.body;
    
    // Check if Google API key is configured
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }
    
    // Handle different Google API endpoints
    switch (endpoint) {
      case 'youtube':
        const youtube = google.youtube({
          version: 'v3',
          auth: apiKey
        });
        
        const youtubeResponse = await youtube.search.list({
          part: 'snippet',
          ...params
        });
        
        return res.json(youtubeResponse.data);
        
      case 'maps':
        // Example of handling maps API request
        // You'd need to implement specific handling for maps API
        const mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        // Further implementation needed
        
        return res.json({ url: mapsUrl });
        
      default:
        return res.status(400).json({
          error: `Unsupported Google API endpoint: ${endpoint}`
        });
    }
  } catch (error) {
    console.error(`Error in Google API (${req.params.endpoint}):`, error);
    res.status(500).json({
      error: error.message || 'Unknown error'
    });
  }
});

module.exports = router;
