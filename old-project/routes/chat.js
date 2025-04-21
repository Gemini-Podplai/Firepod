const express = require('express');
const router = express.Router();

/**
 * Chat API endpoint
 * Handles sending messages to OpenAI's API
 */
router.post('/', async (req, res) => {
  try {
    const { messages, model = 'gpt-4' } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: { role: 'system', content: 'Invalid request format' },
        error: 'Messages array is required'
      });
    }
    
    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API error');
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message;
    
    res.status(200).json({
      message: assistantMessage
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({
      message: { role: 'system', content: 'Error processing your request' },
      error: error.message || 'Unknown error'
    });
  }
});

module.exports = router;
