const axios = require('axios');

// Your reCAPTCHA secret key (keep this secure and never expose in client-side code)
const RECAPTCHA_SECRET_KEY = '6Lcsaw0rAAAAAJ7xcdo9mX63tX5VWCrUJ-NxZitH';

/**
 * Verify a reCAPTCHA token on the server side
 * @param {string} token - The reCAPTCHA token from client
 * @param {string} remoteIp - Optional IP address of the user
 * @returns {Promise<Object>} - The verification result
 */
async function verifyRecaptchaToken(token, remoteIp = null) {
  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET_KEY);
    params.append('response', token);
    
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }
    
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const data = response.data;
    
    if (data.success) {
      // Token is valid
      return {
        success: true,
        score: data.score, // For v3 reCAPTCHA
        action: data.action,
        challengeTimestamp: data.challenge_ts,
        hostname: data.hostname
      };
    } else {
      // Token is invalid
      return {
        success: false,
        errorCodes: data['error-codes'] || []
      };
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  verifyRecaptchaToken
};
